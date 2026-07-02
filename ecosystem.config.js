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
      script: "cd AIService && source venv/bin/activate && uvicorn main:app --port 8005",
      interpreter: "bash"
    }
  ],
};
