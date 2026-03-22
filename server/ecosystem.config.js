module.exports = {
  apps: [{
    name: 'familywall-backend',
    script: './index.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_PATH: './data/familywall.db'
    },
    kill_timeout: 5000
  }]
};
