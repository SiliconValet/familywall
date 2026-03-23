import db from '../db.js';
import { google } from 'googleapis';
import { startOfDay, subDays, addDays } from 'date-fns';

export default async function calendarRoutes(fastify, options) {
  // Helper: Create OAuth2Client
  function createOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );
  }

  // Helper: Get OAuth2Client with stored refresh token
  function getOAuth2Client() {
    const oauth2Client = createOAuth2Client();

    const auth = db.prepare('SELECT refresh_token, access_token, token_expiry FROM calendar_auth WHERE id = 1').get();
    if (!auth || !auth.refresh_token) {
      return null;
    }

    oauth2Client.setCredentials({
      refresh_token: auth.refresh_token,
      access_token: auth.access_token,
      expiry_date: auth.token_expiry
    });

    // Listen for token refresh events and persist them
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.access_token) {
        db.prepare(`
          UPDATE calendar_auth
          SET access_token = ?, token_expiry = ?, updated_at = unixepoch()
          WHERE id = 1
        `).run(tokens.access_token, tokens.expiry_date || null);
      }
    });

    return oauth2Client;
  }

  // Helper: Auto-map family members to calendar sources by name
  function autoMapFamilyMembers(calendarSummary) {
    const members = db.prepare('SELECT id, name FROM family_members').all();
    const summaryLower = calendarSummary.toLowerCase();

    for (const member of members) {
      if (summaryLower.includes(member.name.toLowerCase())) {
        return member.id;
      }
    }

    return null;
  }

  // GET /api/calendar/auth - Generate OAuth URL
  fastify.get('/api/calendar/auth', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            authUrl: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const oauth2Client = createOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    return { authUrl };
  });

  // GET /api/calendar/oauth/callback - OAuth callback
  fastify.get('/api/calendar/oauth/callback', async (request, reply) => {
    const { code } = request.query;

    if (!code) {
      reply.code(400).send({ error: 'Missing authorization code' });
      return;
    }

    try {
      const oauth2Client = createOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user email from OAuth2 userinfo
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const googleEmail = userInfo.data.email;

      // Store tokens in database (INSERT OR REPLACE)
      db.prepare(`
        INSERT OR REPLACE INTO calendar_auth (id, google_email, access_token, refresh_token, token_expiry, updated_at)
        VALUES (1, ?, ?, ?, ?, unixepoch())
      `).run(googleEmail, tokens.access_token, tokens.refresh_token, tokens.expiry_date || null);

      // Fetch calendar list
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const calendarList = await calendar.calendarList.list();

      // Store calendar sources
      for (const cal of calendarList.data.items) {
        const familyMemberId = autoMapFamilyMembers(cal.summary);

        db.prepare(`
          INSERT OR REPLACE INTO calendar_sources
          (id, calendar_id, summary, background_color, selected, family_member_id, updated_at)
          VALUES (?, ?, ?, ?, 1, ?, unixepoch())
        `).run(cal.id, cal.id, cal.summary, cal.backgroundColor || null, familyMemberId);
      }

      // Redirect to frontend success page
      reply.redirect('/#/calendar-connected');
    } catch (error) {
      fastify.log.error('OAuth callback error:', error);
      reply.code(500).send({ error: 'OAuth authentication failed' });
    }
  });

  // GET /api/calendar/status - Check if calendar is connected
  fastify.get('/api/calendar/status', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            email: { type: ['string', 'null'] }
          }
        }
      }
    }
  }, async (request, reply) => {
    const auth = db.prepare('SELECT google_email FROM calendar_auth WHERE id = 1').get();

    return {
      connected: !!auth,
      email: auth?.google_email || null
    };
  });

  // GET /api/calendar/sources - List calendar sources
  fastify.get('/api/calendar/sources', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              summary: { type: 'string' },
              backgroundColor: { type: ['string', 'null'] },
              selected: { type: 'integer' },
              familyMemberId: { type: ['integer', 'null'] },
              familyMemberName: { type: ['string', 'null'] }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const sources = db.prepare(`
      SELECT
        cs.id,
        cs.summary,
        cs.background_color as backgroundColor,
        cs.selected,
        cs.family_member_id as familyMemberId,
        fm.name as familyMemberName
      FROM calendar_sources cs
      LEFT JOIN family_members fm ON cs.family_member_id = fm.id
      ORDER BY cs.summary
    `).all();

    return sources;
  });

  // PUT /api/calendar/sources/:id - Toggle calendar source selection
  fastify.put('/api/calendar/sources/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['selected'],
        properties: {
          selected: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            selected: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { selected } = request.body;

    const result = db.prepare(`
      UPDATE calendar_sources
      SET selected = ?, updated_at = unixepoch()
      WHERE id = ?
    `).run(selected ? 1 : 0, id);

    if (result.changes === 0) {
      reply.code(404).send({ error: 'Calendar source not found' });
      return;
    }

    const updated = db.prepare('SELECT id, selected FROM calendar_sources WHERE id = ?').get(id);
    return updated;
  });

  // GET /api/calendar/events - Fetch cached events for date range
  fastify.get('/api/calendar/events', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              summary: { type: ['string', 'null'] },
              description: { type: ['string', 'null'] },
              location: { type: ['string', 'null'] },
              start_time: { type: ['string', 'null'] },
              end_time: { type: ['string', 'null'] },
              start_date: { type: ['string', 'null'] },
              end_date: { type: ['string', 'null'] },
              is_all_day: { type: 'integer' },
              status: { type: 'string' },
              calendar_source_id: { type: 'string' },
              calendar_summary: { type: 'string' },
              family_member_id: { type: ['integer', 'null'] },
              family_member_name: { type: ['string', 'null'] }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { start, end } = request.query;

    const events = db.prepare(`
      SELECT
        ce.*,
        cs.summary as calendar_summary,
        cs.family_member_id,
        fm.name as family_member_name
      FROM calendar_events ce
      JOIN calendar_sources cs ON ce.calendar_source_id = cs.id
      LEFT JOIN family_members fm ON cs.family_member_id = fm.id
      WHERE cs.selected = 1
        AND (
          (ce.start_time >= ? AND ce.start_time < ?)
          OR (ce.start_date >= ? AND ce.start_date < ?)
        )
      ORDER BY
        CASE WHEN ce.is_all_day = 1 THEN 0 ELSE 1 END,
        COALESCE(ce.start_time, ce.start_date)
    `).all(start, end, start, end);

    return events;
  });

  // POST /api/calendar/sync - Trigger sync
  fastify.post('/api/calendar/sync', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            synced: { type: 'boolean' },
            eventCount: { type: 'integer' },
            lastSynced: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      reply.code(401).send({ error: 'Not authenticated with Google Calendar' });
      return;
    }

    // Debounce: Check if last sync was < 30 seconds ago
    const auth = db.prepare('SELECT updated_at FROM calendar_auth WHERE id = 1').get();
    const now = Math.floor(Date.now() / 1000);
    if (auth && (now - auth.updated_at) < 30) {
      fastify.log.info('Sync debounced: last sync was less than 30 seconds ago');
      const events = db.prepare('SELECT COUNT(*) as count FROM calendar_events').get();
      return {
        synced: true,
        eventCount: events.count,
        lastSynced: new Date(auth.updated_at * 1000).toISOString()
      };
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const selectedSources = db.prepare('SELECT * FROM calendar_sources WHERE selected = 1').all();

      let totalEventCount = 0;

      for (const source of selectedSources) {
        try {
          let eventsResponse;

          // Check if we have a sync token for incremental sync
          if (source.sync_token) {
            try {
              eventsResponse = await calendar.events.list({
                calendarId: source.calendar_id,
                syncToken: source.sync_token,
                maxResults: 2500
              });
            } catch (error) {
              // HTTP 410 - sync token invalidated, need full sync
              if (error.code === 410) {
                fastify.log.info(`Sync token invalid for ${source.summary}, performing full sync`);

                // Clear sync token and all events for this source
                db.prepare('UPDATE calendar_sources SET sync_token = NULL WHERE id = ?').run(source.id);
                db.prepare('DELETE FROM calendar_events WHERE calendar_source_id = ?').run(source.id);

                // Perform full sync
                eventsResponse = await calendar.events.list({
                  calendarId: source.calendar_id,
                  timeMin: subDays(new Date(), 30).toISOString(),
                  timeMax: addDays(new Date(), 90).toISOString(),
                  singleEvents: true,
                  maxResults: 2500
                });
              } else {
                throw error;
              }
            }
          } else {
            // No sync token - full sync
            eventsResponse = await calendar.events.list({
              calendarId: source.calendar_id,
              timeMin: subDays(new Date(), 30).toISOString(),
              timeMax: addDays(new Date(), 90).toISOString(),
              singleEvents: true,
              maxResults: 2500
            });
          }

          // Process events
          const events = eventsResponse.data.items || [];

          for (const event of events) {
            if (event.status === 'cancelled') {
              // Delete cancelled events
              db.prepare('DELETE FROM calendar_events WHERE id = ?').run(event.id);
            } else {
              // Upsert event
              const isAllDay = !event.start.dateTime;

              db.prepare(`
                INSERT OR REPLACE INTO calendar_events
                (id, calendar_source_id, summary, description, location,
                 start_time, end_time, start_date, end_date, is_all_day,
                 status, raw_json, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
              `).run(
                event.id,
                source.id,
                event.summary || null,
                event.description || null,
                event.location || null,
                event.start.dateTime || null,
                event.end.dateTime || null,
                event.start.date || null,
                event.end.date || null,
                isAllDay ? 1 : 0,
                event.status || 'confirmed',
                JSON.stringify(event)
              );

              totalEventCount++;
            }
          }

          // Save new sync token
          if (eventsResponse.data.nextSyncToken) {
            db.prepare(`
              UPDATE calendar_sources
              SET sync_token = ?, updated_at = unixepoch()
              WHERE id = ?
            `).run(eventsResponse.data.nextSyncToken, source.id);
          }

        } catch (error) {
          fastify.log.error(`Error syncing calendar ${source.summary}:`, error);
          // Continue with other calendars even if one fails
        }
      }

      // Update auth last sync time
      db.prepare('UPDATE calendar_auth SET updated_at = unixepoch() WHERE id = 1').run();

      return {
        synced: true,
        eventCount: totalEventCount,
        lastSynced: new Date().toISOString()
      };

    } catch (error) {
      fastify.log.error('Calendar sync error:', error);
      reply.code(502).send({ error: 'Google Calendar API error' });
    }
  });

  // POST /api/calendar/disconnect - Remove OAuth tokens and cached data
  fastify.post('/api/calendar/disconnect', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            disconnected: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    db.prepare('DELETE FROM calendar_events').run();
    db.prepare('DELETE FROM calendar_sources').run();
    db.prepare('DELETE FROM calendar_auth WHERE id = 1').run();

    return { disconnected: true };
  });
}
