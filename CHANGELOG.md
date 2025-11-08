# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-07

### Fixed
- Resolve TypeScript build errors for npm publishing
- Update import extensions from .ts to .js for ESM compatibility
- Add type assertion for ThemeScheme in theme store initialization
- Update logger import path to use relative import
- Fix ThemeToggle icon to inherit color from parent

### Added
- Screen reader announcements for theme changes (a11y improvement)

### Changed
- Remove verbose JSDoc comments for cleaner code
- Remove TypeScript annotation from ThemeToggle component

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
