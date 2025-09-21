module.exports = {
  apps: [
    {
      name: 'anoudjob-backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3234
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3234
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Environment variables
      env_file: '.env',
      
      // Advanced options
      node_args: '--max-old-space-size=1024',
      merge_logs: true,
      
      // Restart conditions
      autorestart: true,
      restart_delay: 4000,
      
      // Error handling
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      
      // Performance
      instances: 'max',
      exec_mode: 'cluster',
      
      // Security
      uid: 'www-data',
      gid: 'www-data',
      
      // File watching (development only)
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git',
        '*.log'
      ]
    }
  ],
  
  deploy: {
    production: {
      user: 'www-data',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/anoudjob.git',
      path: '/var/www/anoudjob',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/anoudjob'
    }
  }
};
