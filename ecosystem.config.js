module.exports = {
  apps: [
    {
      name: "si-frontend",
      script: "./start_frontend.sh",
      interpreter: "bash"
    },
    {
      name: "si-backend",
      script: "./start_backend.sh",
      interpreter: "bash"
    },
    {
      name: "si-ai-service",
      script: "./start_ai.sh",
      interpreter: "bash"
    }
  ],
};
