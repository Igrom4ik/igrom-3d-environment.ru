module.exports = {
  apps: [{
    name: 'igrom-portfolio',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/igrom-3d-environment',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/igrom-3d-environment/logs/pm2-error.log',
    out_file: '/var/www/igrom-3d-environment/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
