# Contributing

## Packages

This project is a monorepo using [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

```
📦packages      Workspaces
 ┣ 📂app        Electron app
 ┗ 📂server    Python DRS server
```

## Prerequisites

- **Node.js** version ≥16.15.0: You may use [**nvm**](https://github.com/nvm-sh/nvm) to quickly install the supported version of Node.js by running `nvm use .` within this repository.
- [**Python 3**](https://www.python.org/downloads/)
- [**Visual Studio Code**](https://code.visualstudio.com/): This project contains [VS Code extension recommendations](.vscode/extensions.json) which assist with code linting and formatting.

## Development Tools

- [**Turborepo**](https://turbo.build/repo) for a build system
- [**TypeScript**](https://www.typescriptlang.org/) for static type checking
- [**ESLint**](https://eslint.org/) for TypeScript linting
- [**Prettier**](https://prettier.io) for TypeScript/Markdown formatting
- [**Black**](https://github.com/psf/black) for Python formatting
- [**EditorConfig**](https://editorconfig.org/) for IDE standardization
- [**Commitlint**](https://commitlint.js.org/) to enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [**Changesets**](https://github.com/changesets/changesets) for versioning and changelogs
- [**Husky**](https://github.com/typicode/husky) and [**lint-staged**](https://github.com/okonet/lint-staged) for Git hooks

## Development Setup

1. Obtain a hard key recovery ZIP, RSA private key (with passphrase), and Fireblocks mobile app passphrase.
2. After installing the prerequisite software, install Node.js and Python dependencies:

   ```sh
   yarn install
   ./packages/server/res/setup.sh
   ```

3. Start the Python DRS server and Electron development app:

   ```sh
   yarn dev
   ```

4. Build the app Electron app for production, compiling for the current development platform:

   ```sh
   yarn build
   ```

## Development Scripts

### Develop

To develop all apps and packages, run the following command:

```
yarn dev
```

### Build

To build all apps and packages, run the following command:

```
yarn build
```

## Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```