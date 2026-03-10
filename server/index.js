import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Fastify with logging
const fastify = Fastify({
  logger: {
    level: 'info'
  }
});

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = process.env.DB_PATH || join(dataDir, 'familywall.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Register static file serving for React build
await fastify.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/'
});

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: Date.now()
  };
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // Close database connection
    db.close();
    fastify.log.info('Database connection closed');

    // Close Fastify server
    await fastify.close();
    fastify.log.info('Server closed successfully');

    process.exit(0);
  } catch (err) {
    fastify.log.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

try {
  await fastify.listen({ port, host });
  fastify.log.info(`Server listening on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
