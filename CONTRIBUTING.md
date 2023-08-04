# Contributing Guidelines

Thank you for considering contributing to the license-manager project! We appreciate your interest and effort in helping to improve the project.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Contributing](#contributing)
  - [Bug Reports](#bug-reports)
  - [Feature Requests](#feature-requests)
  - [Pull Requests](#pull-requests)
- [License](#license)

## Getting Started

### Prerequisites

Before you start contributing, make sure you have the following installed:

- Node.js (>=18.14.0)
- npm (>=9.3.1)

### Setting Up the Development Environment

To develop locally, fork the repository and clone it in your local machine. 
After cloning, you start developing the following steps.

1. Run `npm ci` to install all dependencies
2. Run `npm run build` to build the project
3. Run `npm run test` to check if all tests will pass

Other useful commands are added in the `package.json`! We recommend that you check them out during development.

## Contributing

We welcome contributions in various forms, including bug reports, feature requests, and pull requests.

### Bug Reports

If you find a bug in the project, please submit a detailed bug report following these steps:

1. Check if the bug has already been reported by searching [the existing issues](https://github.com/cybozu/license-manager/issues).
2. If not found, create a new issue with a descriptive title and provide as much detail as possible about the bug.

### Feature Requests

If you have an idea for a new feature or an enhancement, please follow these steps:

1. Search [the exsisiting issues](https://github.com/cybozu/license-manager/issues) to see if the feature has been requested before.
2. If not, create a new issue and clearly explain the feature you're proposing and why it would be valuable.

### Pull Requests

We encourage you to submit pull requests to contribute code to the project. Here's how:

1. Create a new branch for your feature or bug fix.
2. Make your changes.
3. Write tests to ensure they work as intended.
4. Commit your changes and Submit a pull request, referencing the relevant issue if applicable.

There are a few things to note:

- Before committing, run `npm run lint` to make sure there are no lint errors.
- All tests are located in `src/__tests__` and `__tests__`. Please check them to see how the tests are written.
- Your commit message should suit to the format of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## License

By contributing to this project, you agree that your contributions will be licensed under [the MIT license](https://github.com/cybozu/license-manager/blob/main/LICENSE).
