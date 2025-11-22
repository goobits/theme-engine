/**
 * Core Type Definitions
 *
 * Foundational types for the theme engine. These types define the shape
 * of theme configurations and are used throughout the library.
 *
 * @module types
 */

/**
 * Theme mode representing the user's light/dark preference.
 *
 * - `'light'` - Force light theme regardless of system preference
 * - `'dark'` - Force dark theme regardless of system preference
 * - `'system'` - Follow the user's operating system preference
 *
 * @example
 * ```typescript
 * const userTheme: ThemeMode = 'system'; // Respects OS dark mode setting
 * ```
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Color scheme identifier for visual styling variants.
 *
 * Schemes provide distinct visual identities while maintaining
 * the same light/dark mode behavior. Each scheme maps to a CSS
 * class (`scheme-{name}`) applied to the document root.
 *
 * - `'default'` - Clean, minimal design system
 * - `'spells'` - Magical purple theme for enchanted experiences
 *
 * @example
 * ```typescript
 * const scheme: ThemeScheme = 'spells'; // Applies .scheme-spells class
 * ```
 */
export type ThemeScheme = 'default' | 'spells';

/**
 * Complete theme configuration combining mode and scheme.
 *
 * Represents the full theme state applied to the application.
 * The `base` property controls light/dark appearance, while
 * `scheme` determines the color palette and visual style.
 *
 * @example
 * ```typescript
 * const theme: FullTheme = {
 *   base: 'dark',      // Dark mode
 *   scheme: 'spells'   // With magical purple colors
 * };
 * ```
 */
export interface FullTheme {
    /** Theme mode: 'light', 'dark', or 'system' */
    base: ThemeMode;
    /** Color scheme identifier */
    scheme: ThemeScheme;
}

/**
 * Configuration for a color scheme.
 *
 * Defines the metadata and preview colors for a theme scheme.
 * Used by the theme picker UI and for validation.
 *
 * @example
 * ```typescript
 * const spellsConfig: SchemeConfig = {
 *   name: 'spells',
 *   displayName: 'Grimoire',
 *   description: 'Magical purple theme',
 *   icon: '✨',
 *   title: 'Spell Library',
 *   preview: {
 *     primary: '#7c3aed',
 *     accent: '#a78bfa',
 *     background: '#0a0a0f'
 *   }
 * };
 * ```
 */
export interface SchemeConfig {
    /** Internal scheme identifier (should match the key in schemes record) */
    name: string;
    /** Human-readable name shown in UI */
    displayName: string;
    /** Brief description of the scheme's visual style */
    description: string;
    /** Optional emoji or icon character for visual identification */
    icon?: string;
    /** Optional custom page title when this scheme is active */
    title?: string;
    /** Preview colors for theme picker thumbnails */
    preview: {
        /** Primary brand color in 6-digit hex format (#RRGGBB) */
        primary: string;
        /** Accent/secondary color in 6-digit hex format */
        accent: string;
        /** Background color in 6-digit hex format */
        background: string;
    };
    /** Optional path to additional CSS file for this scheme */
    cssFile?: string;
}
