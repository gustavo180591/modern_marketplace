# Testing Strategy

## Unit Tests
- **Frontend**: Jest + React Testing Library for component/unit tests.
- **Backend**: Jest + SuperTest for API route/unit tests.

## Integration Tests
- Test end‑to‑end flows using Cypress (or Playwright) covering user registration, product listing, cart checkout.

## Performance Tests
- Load testing with k6 or Artillery on critical endpoints (search, checkout).

## Code Coverage
- Enforce >80% coverage via `jest --coverage` and CI badge.

## Continuous Integration
- GitHub Actions pipeline runs lint → unit tests → integration tests on each PR.

*Details and scripts will be added as the codebase evolves.*
