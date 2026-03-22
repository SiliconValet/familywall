import db from '../db.js';

export default async function familyRoutes(fastify, options) {
  // GET all family members (sorted alphabetically per D-08)
  fastify.get('/api/family', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              created_at: { type: 'integer' },
              updated_at: { type: 'integer' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const stmt = db.prepare('SELECT * FROM family_members ORDER BY name COLLATE NOCASE');
    return stmt.all();
  });

  // POST new family member
  fastify.post('/api/family', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            created_at: { type: 'integer' },
            updated_at: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { name } = request.body;
    const stmt = db.prepare('INSERT INTO family_members (name) VALUES (?)');
    const result = stmt.run(name.trim());

    // Fetch the created row
    const created = db.prepare('SELECT * FROM family_members WHERE id = ?').get(result.lastInsertRowid);

    reply.code(201).send(created);
  });

  // PUT update family member name
  fastify.put('/api/family/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            created_at: { type: 'integer' },
            updated_at: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { name } = request.body;

    const stmt = db.prepare('UPDATE family_members SET name = ?, updated_at = unixepoch() WHERE id = ?');
    const result = stmt.run(name.trim(), id);

    // Check if row was found
    if (result.changes === 0) {
      reply.code(404).send({ error: 'Family member not found' });
      return;
    }

    // Fetch the updated row
    const updated = db.prepare('SELECT * FROM family_members WHERE id = ?').get(id);
    return updated;
  });

  // DELETE family member
  fastify.delete('/api/family/:id', {
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
    const stmt = db.prepare('DELETE FROM family_members WHERE id = ?');
    const result = stmt.run(id);

    // Check if row was found
    if (result.changes === 0) {
      reply.code(404).send({ error: 'Family member not found' });
      return;
    }

    reply.code(204).send();
  });
}
