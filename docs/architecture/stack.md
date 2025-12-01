# Technology Stack

## Front‑end
- **Framework**: React (with Vite for bundling) – lightweight, fast hot‑module replacement.
- **Styling**: Vanilla CSS with CSS‑variables for theming (dark / light mode) and utility classes for a premium look.
- **State Management**: React Context + `useReducer` (or optional Redux Toolkit for larger scale).
- **Testing**: Jest + React Testing Library.

## Back‑end
- **Runtime**: Node.js (v20) with **Express** for RESTful APIs.
- **Database**: PostgreSQL – relational, ACID‑compliant, scalable.
- **Cache / Pub‑Sub**: Redis – for session store, caching, and real‑time notifications.
- **Authentication**: JWT (access + refresh tokens) with bcrypt for password hashing.
- **File Storage**: Amazon S3 (or compatible MinIO for local development) for product images.
- **Payment Integration**: Stripe (or Mercado Pago) SDK.
- **Testing**: Jest + SuperTest for API integration tests.

## DevOps / Infrastructure
- **Containerisation**: Docker – each service runs in its own container.
- **Orchestration**: Docker Compose for local development; Kubernetes (future) for production scaling.
- **CI/CD**: GitHub Actions – lint, test, build Docker images, and deploy.
- **Monitoring**: Prometheus + Grafana for metrics; Sentry for error tracking.

## Tooling & Utilities
- **Package Manager**: npm (or pnpm) for deterministic installs.
- **Linting / Formatting**: ESLint + Prettier.
- **Version Control**: Git (GitHub repository).
- **Documentation**: Markdown files in `docs/` and OpenAPI spec for the API.

*This stack balances rapid development, performance, and scalability while keeping the tech choices modern and widely supported.*
