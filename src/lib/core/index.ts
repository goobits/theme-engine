/**
 * Core Theme Engine
 *
 * Foundational types, configuration, and theme application logic.
 * This module provides the building blocks for theme management.
 *
 * @module core
 *
 * @example
 * ```typescript
 * import { applyFullTheme, resolveTheme, THEME_SCHEMES } from '@goobits/themes/core';
 *
 * applyFullTheme({ base: 'dark', scheme: 'spells' });
 * ```
 */

export * from './config'
export * from './constants'
export * from './schemeRegistry'
export * from './themeManager'
export * from './types'
