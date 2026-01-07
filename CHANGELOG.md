# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-01-07

### Added
- **Redesigned ThemeShowcase** - Modern Apple-inspired demo UI
  - Ambient glow effect behind content
  - Collapsible theme picker grid with gradient dots
  - Inline light/dark toggle switch with sliding thumb
  - Browser preview with nav bar, hero section, and feature cards
- **Smart gradient previews** - Theme dots now show gradient from accent to most visually distinct color
- **Goo presets documentation** - Added docs for using Goo preset themes

### Changed
- Demo theme config uses color distance algorithm to pick distinct gradient colors
- Build caches moved under `.artifacts` directory
- Theme logger output gated behind opt-in flag (less console noise)

### Fixed
- Theme dots now properly represent each theme's color palette

## [1.2.0] - 2026-01-07

### Added
- Goo presets bundle with light/dark variants for each theme
- Goo SSR helpers via `@goobits/themes/server/goo`
- Goo preset generator and consistency checks

### Changed
- Theme store reactivity now uses direct `$state` fields for scheme switching
- Demo uses Goo preset bundle
- Theme logger info/debug output gated behind an opt-in flag

### Fixed
- Scheme selection now updates UI immediately when switching within the same mode

## [1.1.0] - 2025-11-16

### Added
- **Comprehensive test infrastructure** - 81.7% test coverage
  - 154 foundational tests for core functionality
  - 238 unit tests with extensive mocking
  - 176 component tests with comprehensive UI coverage
  - Vitest configuration with coverage reporting
- **Development tooling** - ESLint, Prettier, and CI/CD
  - GitHub Actions CI workflow with manual triggers
  - ESLint with comprehensive rule set (max 10 warnings)
  - Prettier configuration for consistent formatting
  - Automated testing and linting in CI pipeline
- **Interactive demo app** - Full SvelteKit demonstration
  - Demo application with theme showcase
  - Design token explorer
  - Enhanced documentation integration
  - pnpm workspace configuration

### Security
- **Cookie dependency vulnerability** - Fixed security issue in cookie handling

### Changed
- **Package manager migration** - npm → pnpm throughout project
- **Test quality improvements** - Removed 156 low-quality tests (27% reduction)
- **TypeScript strict mode** - Resolved 63 TypeScript errors and 27 warnings
- **Documentation enhancements** - Interactive features and better organization

### Technical Details
<details>
<summary>For maintainers and contributors</summary>

- Migrated from npm to pnpm for faster installs and better disk efficiency
- Added comprehensive test mocks for $app modules
- Improved type safety across core, server, and svelte modules
- Enhanced CI pipeline to prevent regressions
- Removed unused dependencies
- Added dev tooling scripts: lint, lint:fix, format, format:check

</details>

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
