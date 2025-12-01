# Architecture Overview

## High‑Level Diagram
> (Insert diagram placeholder – e.g., Mermaid flowchart showing client ↔ API Gateway ↔ Services ↔ Database ↔ Cache)

## Components
- **Frontend**: React SPA served via Nginx.
- **API Gateway**: Express server handling routing, authentication, rate‑limiting.
- **Services**: Separate modules for Users, Products, Orders, Payments.
- **Database**: PostgreSQL (primary data store).
- **Cache / Messaging**: Redis for session storage and pub/sub events.
- **File Storage**: S3 bucket for product images.
- **Background Workers**: Node workers for email, notifications, async tasks.

*This document will be expanded with detailed diagrams and interaction flows.*
