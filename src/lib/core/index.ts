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

export * from './types';
export * from './config';
export * from './constants';
export * from './scheme-registry';
export * from './theme-manager';
