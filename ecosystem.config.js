module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./client",
      script: "npm",
      args: "run dev",
      interpreter: "cmd",
      interpreter_args: "/c",
      env: {
        NODE_ENV: "development",
      },
      env_file: "./client/.env",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      ignore_watch: ["node_modules", "dist", ".git", "coverage"],
      max_memory_restart: "500M",
      error_file: "~/.pm2/logs/frontend-error.log",
      out_file: "~/.pm2/logs/frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: "30s",
    },

    {
      name: "backend",
      cwd: "./server",
      script: "npm",
      args: "run dev",
      interpreter: "cmd",
      interpreter_args: "/c",
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_file: "./server/.env",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      ignore_watch: [
        "node_modules",
        "dist",
        ".git",
        "logs",
        "services/workers",
      ],
      max_memory_restart: "300M",
      error_file: "~/.pm2/logs/backend-error.log",
      out_file: "~/.pm2/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: "30s",
      kill_timeout: 5000,
    },

    {
      name: "workers",
      cwd: "./server",
      script: "npm",
      args: "run worker:dev",
      interpreter: "cmd",
      interpreter_args: "/c",
      env: {
        NODE_ENV: "development",
      },
      env_file: "./server/.env",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      ignore_watch: [
        "node_modules",
        "dist",
        ".git",
        "logs",
        "index.js",
        "routes",
        "controllers",
      ],
      max_memory_restart: "300M",
      error_file: "~/.pm2/logs/workers-error.log",
      out_file: "~/.pm2/logs/workers-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: "30s",
      kill_timeout: 5000,
    },
  ],

  deploy: {
    production: {
      user: "node",
      host: "your-server.com",
      ref: "origin/main",
      repo: "git@github.com:your-repo/project.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
    },
  },

  node_args: "--max-old-space-size=512",

  // Graceful shutdown timeout (ms)
  kill_timeout: 5000,

  // Wait time before considering app as stopped
  wait_ready: false,

  // Listen for 'ready' message from app (optional, for custom ready signals)
  listen_timeout: 3000,
};
