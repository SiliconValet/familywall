import bcrypt from 'bcryptjs';
import db from '../db.js';

export default async function authRoutes(fastify, options) {
  // Verify PIN
  fastify.post('/api/auth/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['pin'],
        properties: {
          pin: { type: 'string', minLength: 4, maxLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { pin } = request.body;

    // Get stored PIN hash from settings
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get('parental_pin');

    if (!row) {
      return { valid: false }; // No PIN set yet
    }

    const isValid = await bcrypt.compare(pin, row.value);
    return { valid: isValid };
  });

  // Set/update PIN (requires current PIN verification per D-02)
  fastify.put('/api/settings/pin', {
    schema: {
      body: {
        type: 'object',
        required: ['currentPin', 'newPin'],
        properties: {
          currentPin: { type: 'string', minLength: 4, maxLength: 6 },
          newPin: { type: 'string', minLength: 4, maxLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { currentPin, newPin } = request.body;

    // Get stored PIN hash from settings
    const getStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = getStmt.get('parental_pin');

    if (!row) {
      // No PIN exists yet (shouldn't happen due to default seed, but handle gracefully)
      reply.code(403).send({ error: 'Current PIN is incorrect' });
      return;
    }

    // Verify current PIN
    const isValid = await bcrypt.compare(currentPin, row.value);
    if (!isValid) {
      reply.code(403).send({ error: 'Current PIN is incorrect' });
      return;
    }

    // Hash new PIN with cost factor 13 (per D-04)
    const hash = await bcrypt.hash(newPin, 13);

    // Upsert new PIN
    const upsertStmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('parental_pin', ?, unixepoch())
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = unixepoch()
    `);
    upsertStmt.run(hash, hash);

    return { success: true };
  });
}
