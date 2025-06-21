# Contributing to Flow

We are grateful for your interest in contributing to the **Flow** project! Contributions are essential for the project's growth and success. This document outlines the guidelines for contributing to ensure a smooth and collaborative development process.

## Getting Started

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- `apps`: all applications for different platform.
- `packages/core`: core functionality library containing shared utilities, and store

### Prerequisites

Ensure you have [set up your Environment](https://reactnative.dev/docs/set-up-your-environment).

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn Classic](https://classic.yarnpkg.com/en/docs)
- For iOS development: macOS and Xcode
- For Android development: Android Studio

### Development Workflow

1. **Fork the Repository**

   Fork the [`flow`](https://github.com/nodefinity/flow) repository.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/flow.git
   cd flow
   ```

3. **Install Dependencies**

   ```bash
   pnpm install
   ```

4. **Install**

   ```bash
   # iOS
   pnpm mobile ios

   # Android
   pnpm mobile android
   ```

5. **Start**

   ```
   pnpm dev
   ```

## Contribution Guidelines

### Commit Guidelines

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and format

We strictly adhere to code quality and coding standards to maintain a high-quality codebase.

We use [ESLint](https://eslint.org/) to lint and format code. So ensure your VScode install the recommend extensions.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
