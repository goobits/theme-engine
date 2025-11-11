# Support

Get help with @goobits/themes.

## Before Asking

Please check these resources first:

1. **[Documentation](./docs/)** - Comprehensive guides and API reference
2. **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
3. **[GitHub Issues](https://github.com/goobits/goobits-themes/issues)** - Search for similar problems
4. **[GitHub Discussions](https://github.com/goobits/goobits-themes/discussions)** - Community Q&A

## Getting Help

### Found a Bug?

[Open an issue](https://github.com/goobits/goobits-themes/issues/new) with:

- **Package version**: Run `npm list @goobits/themes`
- **SvelteKit version**: Run `npm list @sveltejs/kit`
- **Node version**: Run `node --version`
- **Steps to reproduce**: Minimal code example
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots/errors**: If applicable

**Minimal reproduction:**

Create a minimal example that demonstrates the issue. This helps us identify and fix the problem faster.

```typescript
// Example minimal reproduction
import { ThemeProvider } from '@goobits/themes/svelte';

// Minimal setup that shows the issue
```

### Have a Question?

**Check documentation first:**
- [Getting Started](./docs/getting-started.md) - Installation and setup
- [API Reference](./docs/api-reference.md) - Complete API docs
- [Troubleshooting](./docs/troubleshooting.md) - Common issues

**Still need help?**

1. Search [GitHub Discussions](https://github.com/goobits/goobits-themes/discussions)
2. If not found, create a new discussion with:
   - Clear question title
   - Context about what you're trying to achieve
   - What you've already tried
   - Relevant code snippets

### Feature Request?

We welcome feature suggestions!

1. Check [existing discussions](https://github.com/goobits/goobits-themes/discussions/categories/ideas) first
2. Create a new discussion in the "Ideas" category
3. Describe:
   - **Use case**: What problem does this solve?
   - **Proposed solution**: How would it work?
   - **Alternatives**: Other solutions you considered

### Security Issue?

**Do not open public issues for security vulnerabilities.**

Report security vulnerabilities via [GitHub Security Advisories](https://github.com/goobits/goobits-themes/security/advisories/new).

## Response Times

As an open-source project maintained by volunteers, response times vary based on maintainer availability.

Typical response times:
- **Critical bugs**: 1-2 weeks
- **General questions**: 2-4 weeks
- **Feature requests**: 2-4 weeks

Please be patient! We appreciate your understanding.

## Community Guidelines

- Be respectful and constructive
- Provide context and details
- Search before posting
- Use clear, descriptive titles
- Format code with markdown
- Stay on topic

## Quick Diagnostic

Before reporting an issue, verify:

```bash
# Check package version
npm list @goobits/themes

# Check SvelteKit version
npm list @sveltejs/kit

# Clear cache
rm -rf .svelte-kit node_modules
npm install

# Rebuild
npm run dev
```

## Example Bug Report

**Good bug report:**

> **Theme flashes white on page load**
>
> **Package version**: @goobits/themes@1.0.1
> **SvelteKit version**: @sveltejs/kit@2.0.0
> **Node version**: v20.0.0
>
> **Steps to reproduce**:
> 1. Set theme to dark mode
> 2. Reload page
> 3. Brief white flash appears before dark theme applies
>
> **Expected**: No flash, dark theme from first paint
> **Actual**: White flash for ~100ms
>
> **Code**:
> ```typescript
> // src/routes/+layout.svelte
> import { ThemeProvider } from '@goobits/themes/svelte';
> // ... rest of setup
> ```
>
> **Screenshot**: [attached]

**Poor bug report:**

> "Themes don't work. Help!"

## Example Question

**Good question:**

> **How do I apply different themes to different routes?**
>
> I want my admin section to always use dark mode, but let users choose for the rest of the site.
>
> I tried:
> ```typescript
> // My attempt here
> ```
>
> But it doesn't work. Is this the right approach?

**Poor question:**

> "Routes???"

## Useful Commands

```bash
# Check if theme is applied (browser console)
console.log(document.documentElement.className);
# Should show: theme-dark scheme-default (or similar)

# Check CSS variables (browser console)
getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');

# View all theme-related classes
Array.from(document.documentElement.classList)
  .filter(c => c.startsWith('theme-') || c.startsWith('scheme-'));
```

## Additional Resources

- **[SvelteKit Docs](https://kit.svelte.dev/)** - SvelteKit documentation
- **[Svelte Docs](https://svelte.dev/)** - Svelte 5 documentation
- **[MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)** - Browser theme detection

## Thank You

Thank you for using @goobits/themes! Your feedback helps make this project better for everyone.
