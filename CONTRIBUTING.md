# Contributing

Thank you for considering contributing to @goobits/themes!

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm (recommended) or npm
- Git

### Getting Started

1. **Fork and clone**:

```bash
git clone https://github.com/YOUR_USERNAME/goobits-themes.git
cd goobits-themes
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Build the package**:

```bash
pnpm run build
```

4. **Run tests**:

```bash
pnpm run test
```

## Project Structure

```
@goobits/themes/
├── core/              # Framework-agnostic theme logic
│   ├── config.ts      # Theme configuration
│   ├── types.ts       # TypeScript types
│   ├── scheme-registry.ts
│   └── theme-manager.ts
├── svelte/            # Svelte 5 components
│   ├── components/    # Theme components
│   ├── stores/        # Theme stores
│   └── index.ts
├── server/            # SvelteKit server utilities
│   ├── hooks.ts       # Server hooks
│   ├── preferences.ts # Cookie handling
│   └── index.ts
├── utils/             # Shared utilities
│   ├── cookies.ts     # Cookie management
│   ├── route-themes.ts
│   └── logger.ts
├── themes/            # CSS theme files
│   ├── base/          # Base design tokens
│   └── presets/       # Preset color schemes
└── docs/              # Documentation
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feat/add-new-scheme` - New features
- `fix/theme-flash-bug` - Bug fixes
- `docs/improve-readme` - Documentation
- `refactor/cleanup-types` - Code refactoring

### Code Style

This project follows standard TypeScript/Svelte conventions:

- Use TypeScript for all code
- Follow existing code style
- Add JSDoc comments for public APIs
- Use meaningful variable names
- Keep functions small and focused

### Commit Messages

Write clear commit messages:

```
feat: add ocean color scheme
fix: prevent theme flash on page load
docs: update API reference with new types
refactor: simplify theme store logic
```

Format: `type: description`

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

## Testing

### Manual Testing

Test your changes:

1. Build the package:

```bash
pnpm run build
```

2. Link locally:

```bash
npm link
```

3. In a test SvelteKit project:

```bash
npm link @goobits/themes
```

4. Test all theme modes:
    - Light mode
    - Dark mode
    - System mode

5. Test multiple schemes

6. Test SSR (no theme flash)

### Automated Tests

Add tests for new features:

```typescript
// Example test
import { test, expect } from 'vitest';
import { createThemeStore } from './theme.svelte';

test('theme store initializes with correct defaults', () => {
    const store = createThemeStore(config);
    expect(store.theme).toBe('system');
});
```

Run tests:

```bash
pnpm run test
```

## Documentation

### Update Documentation

If your change affects the public API:

1. Update relevant docs in `docs/`
2. Update README.md if needed
3. Add examples if appropriate

### Documentation Style

- Be concise and clear
- Use code examples
- Link to related docs
- Test all code examples

## Pull Request Process

### Before Submitting

- [ ] Code follows existing style
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### Submitting

1. Push your branch to your fork
2. Create a pull request to `main`
3. Fill out the PR template
4. Link related issues

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How has this been tested?

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] Commits are clear
```

### Review Process

1. **Automated checks** - Tests and linting must pass
2. **Code review** - Maintainer will review code
3. **Feedback** - Address any requested changes
4. **Approval** - Maintainer approves PR
5. **Merge** - Maintainer merges to main

## Adding New Features

### New Color Scheme

1. Create CSS file in `themes/presets/`
2. Add to scheme registry in `core/scheme-registry.ts`
3. Export from `themes/index.css`
4. Document in `docs/custom-themes.md`
5. Add example in README

### New Component

1. Create component in `svelte/components/`
2. Export from `svelte/index.ts`
3. Add TypeScript types
4. Document in `docs/components.md`
5. Add usage example

### New Utility Function

1. Add to appropriate module (core/svelte/server/utils)
2. Export from module index
3. Add TypeScript types
4. Document in `docs/api-reference.md`
5. Add tests

## Fixing Bugs

### Bug Fix Process

1. **Reproduce** - Confirm the bug exists
2. **Identify** - Find root cause
3. **Fix** - Make minimal changes to fix
4. **Test** - Verify fix works
5. **Document** - Update docs if needed

### Bug Report Requirements

When fixing a bug, reference the issue:

```
fix: prevent theme flash on reload (#123)

- Add theme class to SSR template
- Update server hooks to set cookie
- Add tests for SSR rendering

Fixes #123
```

## Code Review Guidelines

When reviewing PRs:

- Be constructive and respectful
- Suggest improvements, don't demand
- Explain reasoning for changes
- Approve if good, request changes if not

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Publish to npm: `npm publish`
6. Create GitHub release with notes

## Questions?

- **Development questions**: [GitHub Discussions](https://github.com/goobits/goobits-themes/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/goobits/goobits-themes/issues)
- **General support**: See [SUPPORT.md](./SUPPORT.md)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions on topic
- No harassment or discrimination

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!
