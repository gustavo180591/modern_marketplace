# Contributing Guidelines

## Getting Started
1. **Fork the repository** and clone your fork.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development environment** (see `deployment.md`).

## Code Style
- Use **ESLint** with the provided configuration. Run `npm run lint` before committing.
- Format code with **Prettier** (`npm run format`).
- Follow the existing project structure: `src/` for source, `tests/` for test files.

## Commits & PRs
- Write clear, conventional commit messages.
- Open a Pull Request targeting the `main` branch.
- Ensure all tests pass (`npm test`).
- Request at least one review before merging.

## Reporting Issues
- Use the GitHub Issues tab.
- Provide a clear title, description, steps to reproduce, and expected vs actual behavior.

*This document will evolve as the project grows.*
