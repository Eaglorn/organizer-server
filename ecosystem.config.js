module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/main.js',
      exec_mode: 'fork',
      error_file: './logs/pm2/app/error.log',
      out_file: './logs/pm2/app/out.log',
      pid_file: './logs/pm2/app/.pid',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      log_type: 'json',
      merge_logs: true,
      env: {
        DATABASE_URL:
          'postgresql://organizer:organizer@localhost:5432/organizer',
      },
      env_production: {
        DATABASE_URL:
          'postgresql://organizer:organizer@localhost:5432/organizer',
      },
    },
    {
      name: 'update',
      script: './update.js',
      exec_mode: 'fork',
      error_file: './logs/pm2/update/error.log',
      out_file: './logs/pm2/update/out.log',
      pid_file: './logs/pm2/update/.pid',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      log_type: 'json',
      merge_logs: true,
    },
  ],
}
