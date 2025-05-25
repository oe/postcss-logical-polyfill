# Contributing to postcss-logical-polyfill

Thank you for considering contributing to postcss-logical-polyfill! This document outlines the process for contributing to the project.

## Development

### Prerequisites

- Node.js 14.0.0 or higher
- pnpm (preferred) or npm

### Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run tests to make sure everything is working:
   ```bash
   pnpm test
   ```

### Making Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Add tests for your changes
4. Run tests to ensure they pass:
   ```bash
   pnpm test
   ```
5. Build the project to ensure it compiles:
   ```bash
   pnpm build
   ```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for changes to tests
- `chore:` for maintenance tasks

### Pull Request Process

1. Update the README.md and documentation with details of changes if applicable
2. Update the CHANGELOG.md with details of changes
3. The PR should work with the latest development branch
4. Include appropriate tests for your changes
5. The PR must pass all CI checks

## Code of Conduct

Please adhere to the project's code of conduct in all your interactions with the project.

## License

By contributing to postcss-logical-polyfill, you agree that your contributions will be licensed under the project's MIT license.
