import { exec } from 'child_process';

export default async function systemRoutes(fastify, options) {
  // POST /api/system/exit-kiosk
  // Kills the Chromium kiosk process to restore desktop access.
  // PIN verification handled client-side via withPinAuth (D-14).
  // Server is localhost-only, so no additional server-side auth needed.
  fastify.post('/api/system/exit-kiosk', async (request, reply) => {
    // Delay execution 300ms to allow HTTP response to reach client before kill
    setTimeout(() => {
      exec('pkill -SIGTERM chromium', () => {
        // Error expected if chromium is not running (e.g., dev environment) — ignore
      });
    }, 300);
    return { success: true };
  });
}
