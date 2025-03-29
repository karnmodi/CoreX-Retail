module.exports = {
    apps: [
      {
        name: "backend",
        cwd: "./corex-retail-backend",
        script: "npm",
        args: "start",
        env: {
          NODE_ENV: "production",
          PORT: 5000
        }
      },
      {
        name: "frontend",
        cwd: "./corex-retail-frontend/build",
        script: "npx",
        args: "serve -s . -l 3000"
      }
    ]
  };