# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Complete documentation overhaul** - New comprehensive docs/ directory structure
  - [Getting Started Guide](./docs/getting-started.md) - Step-by-step setup instructions
  - [API Reference](./docs/api-reference.md) - Complete API documentation with correct signatures
  - [Components Guide](./docs/components.md) - Detailed component usage and customization
  - [Custom Themes Guide](./docs/custom-themes.md) - Create your own color schemes
  - [Design Tokens Reference](./docs/design-tokens.md) - CSS variable documentation
  - [Best Practices](./docs/best-practices.md) - Accessibility and performance guidelines
  - [Troubleshooting Guide](./docs/troubleshooting.md) - Common issues and solutions
- **Support files** - SUPPORT.md and CONTRIBUTING.md for community guidance
- **MIT LICENSE file** - Official license file added

### Changed
- **README restructure** - Cleaner, more concise main README with links to detailed docs
- **Documentation accuracy** - All code examples now match actual API (no more incorrect examples)
- **API documentation** - Corrected all function signatures to match implementation:
  - ThemeConfig uses `Record<string, SchemeConfig>` for schemes (not array)
  - Documented actual method names (`setTheme`, `setScheme`, not `setMode`)
  - Fixed cookie utility names (`readPreferenceCookies`, `writePreferenceCookies`)
  - Corrected RouteThemeConfig structure with proper `theme: FullTheme` format
- **Reduced emoji usage** - Strategic emoji placement for professional appearance
- **Feature list** - Condensed to essential capabilities without marketing language
- **Quick Start** - Simplified 4-step setup with correct code examples

### Documentation Impact
**All users should review the updated documentation:**
- If you experienced setup issues, see [Troubleshooting Guide](./docs/troubleshooting.md)
- If code examples from README didn't work, they're now corrected
- TypeScript users: All types and interfaces are now accurately documented

## [1.0.1] - 2025-11-07

### What's New

**Accessibility Improvements**
- Theme changes now announce to screen readers
- No code changes needed - automatically included

**Bug Fixes**
- Fixed TypeScript errors during installation and build process
- TypeScript users should update to get better type hints and IDE suggestions
- Fixed ThemeToggle icon color inheritance - custom icon colors now work correctly

**Developer Experience**
- Cleaned up code comments for better IDE suggestions and autocomplete
- Improved ESM compatibility with correct import extensions

### Should You Upgrade?

✅ **Recommended for all users** (no breaking changes)

- **If you had TypeScript errors**: This release fixes them
- **If you use TypeScript**: Your IDE will show better type hints
- **If you customize ThemeToggle colors**: Icon colors now inherit correctly
- **Everyone else**: Small improvements, update when convenient

### Technical Details

<details>
<summary>For maintainers and contributors</summary>

- Resolve TypeScript build errors for npm publishing
- Update import extensions from .ts to .js for ESM compatibility
- Add type assertion for ThemeScheme in theme store initialization
- Update logger import path to use relative import
- Fix ThemeToggle icon to inherit color from parent
- Screen reader announcements for theme changes (a11y improvement)
- Remove verbose JSDoc comments for cleaner code
- Remove TypeScript annotation from ThemeToggle component

</details>

## [1.0.0] - 2025-11-07

### Added
- Initial release of @goobits/themes
- Complete theme system for SvelteKit with Svelte 5 runes support
- Theme modes: light, dark, and system preference detection
- Multiple color schemes support (default and spells themes)
- ThemeProvider component with SSR support
- ThemeToggle component for mode switching
- Theme store with localStorage persistence and cookie support
- Server-side theme detection and cookies handling
- Comprehensive documentation and setup guide
- Linting and formatting setup
- Optional preset theme CSS files
