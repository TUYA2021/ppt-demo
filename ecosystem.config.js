module.exports = {
  apps: [{
    name: "ppt-demo",
    cwd: __dirname,
    script: "./node_modules/next/dist/bin/next",
    args: "start -p 7000",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
}
