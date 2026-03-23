import db from '../db.js';

export default async function choreRoutes(fastify, options) {
  // GET all chores with view filtering (daily or weekly)
  fastify.get('/api/chores', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          view: { type: 'string', enum: ['daily', 'weekly'] }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              description: { type: ['string', 'null'] },
              assigned_to: { type: 'integer' },
              completed_by: { type: ['integer', 'null'] },
              points: { type: 'integer' },
              status: { type: 'string' },
              is_recurring: { type: 'integer' },
              recurrence_config: { type: ['string', 'null'] },
              parent_chore_id: { type: ['integer', 'null'] },
              created_at: { type: 'integer' },
              completed_at: { type: ['integer', 'null'] },
              updated_at: { type: 'integer' },
              assignee_name: { type: 'string' },
              completed_by_name: { type: ['string', 'null'] }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { view = 'daily' } = request.query;

    let whereClause = `1=1`;

    if (view === 'daily') {
      // Filter to chores created today (localtime)
      whereClause = `DATE(c.created_at, 'unixepoch', 'localtime') = DATE('now', 'localtime')`;
    } else if (view === 'weekly') {
      // Filter to chores created this week (Sunday-Saturday)
      whereClause = `c.created_at >= unixepoch(DATE('now', 'localtime', 'weekday 0', '-6 days'))
                     AND c.created_at < unixepoch(DATE('now', 'localtime', 'weekday 0', '+1 day'))`;
    }

    const chores = db.prepare(`
      SELECT c.*,
             a.name as assignee_name,
             cb.name as completed_by_name
      FROM chores c
      JOIN family_members a ON c.assigned_to = a.id
      LEFT JOIN family_members cb ON c.completed_by = cb.id
      WHERE ${whereClause}
      ORDER BY
        CASE WHEN c.status = 'active' THEN 0 ELSE 1 END,
        c.points DESC,
        c.created_at DESC
    `).all();

    return chores;
  });

  // POST new chore
  fastify.post('/api/chores', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'assigned_to'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          assigned_to: { type: 'integer' },
          description: { type: 'string', maxLength: 1000 },
          points: { type: 'integer', minimum: 0 },
          is_recurring: { type: 'boolean' },
          recurrence_config: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: ['string', 'null'] },
            assigned_to: { type: 'integer' },
            completed_by: { type: ['integer', 'null'] },
            points: { type: 'integer' },
            status: { type: 'string' },
            is_recurring: { type: 'integer' },
            recurrence_config: { type: ['string', 'null'] },
            parent_chore_id: { type: ['integer', 'null'] },
            created_at: { type: 'integer' },
            completed_at: { type: ['integer', 'null'] },
            updated_at: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { title, assigned_to, description, points = 0, is_recurring = false, recurrence_config } = request.body;

    // Validate assigned_to exists in family_members
    const member = db.prepare('SELECT id FROM family_members WHERE id = ?').get(assigned_to);
    if (!member) {
      reply.code(400).send({ error: 'Invalid assigned_to: family member not found' });
      return;
    }

    // Prepare recurrence_config JSON string if recurring
    const recurrenceConfigStr = is_recurring && recurrence_config
      ? JSON.stringify(recurrence_config)
      : null;

    const stmt = db.prepare(`
      INSERT INTO chores (title, description, assigned_to, points, is_recurring, recurrence_config, parent_chore_id)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
    `);
    const result = stmt.run(
      title.trim(),
      description?.trim() || null,
      assigned_to,
      points,
      is_recurring ? 1 : 0,
      recurrenceConfigStr
    );

    // Fetch the created row
    const created = db.prepare('SELECT * FROM chores WHERE id = ?').get(result.lastInsertRowid);

    reply.code(201).send(created);
  });

  // PUT update chore
  fastify.put('/api/chores/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          assigned_to: { type: 'integer' },
          description: { type: 'string', maxLength: 1000 },
          points: { type: 'integer', minimum: 0 },
          is_recurring: { type: 'boolean' },
          recurrence_config: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: ['string', 'null'] },
            assigned_to: { type: 'integer' },
            completed_by: { type: ['integer', 'null'] },
            points: { type: 'integer' },
            status: { type: 'string' },
            is_recurring: { type: 'integer' },
            recurrence_config: { type: ['string', 'null'] },
            parent_chore_id: { type: ['integer', 'null'] },
            created_at: { type: 'integer' },
            completed_at: { type: ['integer', 'null'] },
            updated_at: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { title, assigned_to, description, points, is_recurring, recurrence_config } = request.body;

    // Check if chore exists
    const existing = db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
    if (!existing) {
      reply.code(404).send({ error: 'Chore not found' });
      return;
    }

    // Validate assigned_to if provided
    if (assigned_to !== undefined) {
      const member = db.prepare('SELECT id FROM family_members WHERE id = ?').get(assigned_to);
      if (!member) {
        reply.code(400).send({ error: 'Invalid assigned_to: family member not found' });
        return;
      }
    }

    // Prepare recurrence_config JSON string if recurring
    const recurrenceConfigStr = is_recurring && recurrence_config
      ? JSON.stringify(recurrence_config)
      : null;

    const stmt = db.prepare(`
      UPDATE chores
      SET title = ?,
          description = ?,
          assigned_to = ?,
          points = ?,
          is_recurring = ?,
          recurrence_config = ?,
          updated_at = unixepoch()
      WHERE id = ?
    `);
    stmt.run(
      title.trim(),
      description?.trim() || existing.description,
      assigned_to !== undefined ? assigned_to : existing.assigned_to,
      points !== undefined ? points : existing.points,
      is_recurring !== undefined ? (is_recurring ? 1 : 0) : existing.is_recurring,
      recurrenceConfigStr !== undefined ? recurrenceConfigStr : existing.recurrence_config,
      id
    );

    // Fetch the updated row
    const updated = db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
    return updated;
  });

  // PUT complete chore (defaults completed_by to assignee per D-06)
  fastify.put('/api/chores/:id/complete', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      body: {
        type: 'object',
        properties: {
          completed_by: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string' },
            completed_by: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { completed_by } = request.body || {};

    const chore = db.prepare('SELECT assigned_to FROM chores WHERE id = ?').get(id);
    if (!chore) {
      reply.code(404).send({ error: 'Chore not found' });
      return;
    }

    // Default to assignee per D-06
    const completedBy = completed_by || chore.assigned_to;

    db.prepare(`
      UPDATE chores
      SET status = 'completed',
          completed_by = ?,
          completed_at = unixepoch(),
          updated_at = unixepoch()
      WHERE id = ?
    `).run(completedBy, id);

    return { id, status: 'completed', completed_by: completedBy };
  });

  // PUT undo completion
  fastify.put('/api/chores/:id/undo', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    const chore = db.prepare('SELECT id FROM chores WHERE id = ?').get(id);
    if (!chore) {
      reply.code(404).send({ error: 'Chore not found' });
      return;
    }

    db.prepare(`
      UPDATE chores
      SET status = 'active',
          completed_at = NULL,
          completed_by = NULL,
          updated_at = unixepoch()
      WHERE id = ?
    `).run(id);

    return { id, status: 'active' };
  });

  // DELETE chore
  fastify.delete('/api/chores/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const stmt = db.prepare('DELETE FROM chores WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      reply.code(404).send({ error: 'Chore not found' });
      return;
    }

    reply.code(204).send();
  });

  // GET completion stats per family member
  fastify.get('/api/chores/stats', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              member_id: { type: 'integer' },
              member_name: { type: 'string' },
              completed_count: { type: 'integer' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const stats = db.prepare(`
      SELECT
        fm.id as member_id,
        fm.name as member_name,
        COUNT(c.id) as completed_count
      FROM family_members fm
      LEFT JOIN chores c ON fm.id = c.assigned_to AND c.status = 'completed'
      GROUP BY fm.id, fm.name
      ORDER BY fm.name COLLATE NOCASE
    `).all();

    return stats;
  });

  // GET weekly summary (recurring chores with daily completion status)
  fastify.get('/api/chores/summary', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              chore_title: { type: 'string' },
              assigned_to: { type: 'integer' },
              assignee_name: { type: 'string' },
              days: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    // Get all recurring template chores
    const recurringChores = db.prepare(`
      SELECT c.*, fm.name as assignee_name
      FROM chores c
      JOIN family_members fm ON c.assigned_to = fm.id
      WHERE c.is_recurring = 1 AND c.parent_chore_id IS NULL
    `).all();

    const summary = [];

    // For each recurring chore, build daily completion status for this week
    for (const chore of recurringChores) {
      const days = [];

      // Get instances for this week (Sunday-Saturday)
      const instances = db.prepare(`
        SELECT
          DATE(created_at, 'unixepoch', 'localtime') as date,
          status
        FROM chores
        WHERE parent_chore_id = ?
          AND created_at >= unixepoch(DATE('now', 'localtime', 'weekday 0', '-6 days'))
          AND created_at < unixepoch(DATE('now', 'localtime', 'weekday 0', '+1 day'))
      `).all(chore.id);

      // Parse recurrence config to determine which days should have instances
      const config = chore.recurrence_config ? JSON.parse(chore.recurrence_config) : null;

      // Build 7-day grid (Sun-Sat)
      for (let i = 0; i < 7; i++) {
        // Calculate date for day i of this week
        const dayOffset = i - 6; // Sunday is -6 days from today's week end
        const dateStr = db.prepare(`
          SELECT DATE('now', 'localtime', 'weekday 0', '${dayOffset} days') as date
        `).get().date;

        // Find instance for this date
        const instance = instances.find(inst => inst.date === dateStr);

        let status = 'not_scheduled';
        if (config) {
          // Check if this day is scheduled based on frequency
          const dayOfWeek = new Date(dateStr).getDay();
          const isScheduled = config.frequency === 'daily' ||
                              (config.frequency === 'weekly' && config.days.includes(dayOfWeek)) ||
                              (config.frequency === 'custom' && config.days.includes(dayOfWeek));

          if (isScheduled) {
            status = instance ? (instance.status === 'completed' ? 'completed' : 'missed') : 'missed';
          }
        }

        days.push({ date: dateStr, status });
      }

      summary.push({
        chore_title: chore.title,
        assigned_to: chore.assigned_to,
        assignee_name: chore.assignee_name,
        days
      });
    }

    return summary;
  });
}
