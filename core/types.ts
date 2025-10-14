/**
 * Represents the theme mode, which can be "light", "dark", or "system".
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Represents the theme scheme, which can be "default" or "spells".
 */
export type ThemeScheme = "default" | "spells";

/**
 * Represents the full theme, including the base mode and the scheme.
 */
export interface FullTheme {
  /** The base theme mode. */
  base: ThemeMode;
  /** The theme scheme. */
  scheme: ThemeScheme;
}

/**
 * Represents the configuration for a theme scheme.
 */
export interface SchemeConfig {
  /** The name of the scheme. */
  name: string;
  /** The display name of the scheme. */
  displayName: string;
  /** A description of the scheme. */
  description: string;
  /** An optional icon for the scheme. */
  icon?: string;
  /** An optional title for the scheme. */
  title?: string;
  /** The preview colors for the scheme. */
  preview: {
    /** The primary color. */
    primary: string;
    /** The accent color. */
    accent: string;
    /** The background color. */
    background: string;
  };
  /** An optional CSS file for the scheme. */
  cssFile?: string;
}
