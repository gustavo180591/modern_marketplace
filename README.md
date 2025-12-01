# Modern Marketplace

## Overview
A modern, scalable marketplace platform inspired by Mercado Libre. This project provides a full‑stack solution for buying and selling products online, featuring user authentication, product listings, shopping cart, checkout, reviews, and more.

## Features
- User registration, login, and profile management
- Product creation, browsing, searching, and categorization
- Shopping cart with persistent sessions
- Secure checkout with Stripe/Mercado Pago integration
- Seller and buyer ratings & reviews
- Real‑time notifications via WebSockets
- Responsive UI with dark/light themes
- Docker‑based development environment

## Technology Stack
- **Frontend**: React (Vite), vanilla CSS with CSS variables, React Context/Redux Toolkit
- **Backend**: Node.js (v20) with Express
- **Database**: PostgreSQL
- **Cache & Messaging**: Redis
- **File Storage**: Amazon S3 (or MinIO locally)
- **Payments**: Stripe (or Mercado Pago)
- **Containerisation**: Docker & Docker Compose (Kubernetes future)
- **CI/CD**: GitHub Actions
- **Testing**: Jest, React Testing Library, SuperTest, Cypress

## Documentation
All project documentation lives in the `docs/` directory:
- `01_user_story.md` – High‑level requirements
- `stack.md` – Detailed tech stack
- `architecture.md` – System architecture overview
- `api_spec.md` – OpenAPI specification
- `database_schema.md` – Database model description
- `ui_ux_guidelines.md` – Design system and UI guidelines
- `deployment.md` – How to run locally and deploy
- `testing_strategy.md` – Testing approach
- `roadmap.md` – Project milestones
- `contributing.md` – How to contribute
- `changelog.md` – Change history
- `faq.md` – Frequently asked questions

## Getting Started
```bash
# Clone the repo
git clone https://github.com/gustavo180591/modern_marketplace.git
cd modern_marketplace

# Install dependencies
npm install

# Start services (Docker Compose)
docker compose up -d

# Run the frontend
npm run dev
```
The app will be available at `http://localhost:3000`.

## Contributing
Please read `docs/contributing.md` for guidelines on how to submit issues, fork the repo, and open pull requests.

## License
This project is licensed under the MIT License.

