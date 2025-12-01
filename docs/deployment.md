# Deployment Guide

## Local Development
1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd modern_marketplace
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start services with Docker Compose**
   ```bash
   docker compose up -d
   ```
4. **Run the frontend**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Production
- Build Docker images for each service.
- Deploy to a Kubernetes cluster (or Docker Swarm) using the provided Helm charts.
- Configure environment variables for DB, Redis, S3, and payment provider.
- Set up CI/CD pipelines (GitHub Actions) to lint, test, build, and push images.

*Further details (helm values, secrets management) will be added as the project matures.*
