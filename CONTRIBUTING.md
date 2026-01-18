# Contributing to TraceMind

Thank you for your interest in contributing to TraceMind! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- **Clear title and description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Node.js version, Docker version)
- **Relevant logs** or error messages
- **Screenshots** if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:

- **Clear description** of the feature
- **Use case** and why it would be useful
- **Possible implementation** approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Follow existing code style
   - Write clear, self-documenting code
   - Add comments for complex logic
   - Update documentation as needed

3. **Write tests** for new features or bug fixes
   ```bash
   npm run test
   npm run test:e2e
   ```

4. **Run linting** and fix any issues
   ```bash
   npm run lint
   ```

5. **Update CHANGELOG.md** with your changes

6. **Commit your changes** with clear commit messages
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in trace analyzer"
   ```

7. **Push to your fork** and open a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Getting Started

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/trace-mind.git
   cd trace-mind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY (optional for local dev)
   ```

4. **Run in development mode**
   ```bash
   npm run start:dev
   ```

5. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### NestJS

- Follow NestJS module structure
- Use dependency injection
- Keep controllers thin, business logic in services
- Use DTOs for data validation

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add support for custom Gemini models
fix: resolve memory leak in trace analyzer
docs: update README with Docker Compose examples
```

## Testing

- Write unit tests for services
- Write e2e tests for API endpoints
- Aim for good test coverage
- Test error cases and edge cases

## Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Add JSDoc for public APIs
- Update CHANGELOG.md

## Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. Code review feedback should be addressed
4. Maintainers will merge approved PRs

## Questions?

Feel free to open an issue for questions or reach out to maintainers.

Thank you for contributing to TraceMind! 🚀
