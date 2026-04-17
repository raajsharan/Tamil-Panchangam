module.exports = {
  apps: [
    {
      name: 'tamil-calendar-api',
      script: 'apps/api/dist/index.js',
      cwd: '/var/www/tamil-calendar',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: 'apps/api/logs/error.log',
      out_file: 'apps/api/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'tamil-calendar-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/tamil-calendar/apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://your-domain.com'
      },
      error_file: 'apps/web/logs/error.log',
      out_file: 'apps/web/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
