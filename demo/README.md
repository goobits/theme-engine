# @goobits/themes Demo

Demo app for testing `@goobits/themes` and `@goobits/docs-engine` packages.

## Prerequisites

This project uses [pnpm](https://pnpm.io/) for package management.

- Node.js >= 18.0.0
- pnpm >= 9.0.0

## Developing

Install dependencies and start the development server:

```sh
pnpm install
pnpm run dev

# or open the app in a new browser tab
pnpm run dev --open
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Type Checking

```sh
pnpm run check
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
