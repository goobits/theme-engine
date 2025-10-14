import type { SchemeConfig } from './types';
import type { RouteThemeConfig } from '../utils/route-themes';

/**
 * Defines the shape of the theme configuration object.
 */
export interface ThemeConfig {
  /** A record of available color schemes. */
  schemes: Record<string, SchemeConfig>;
  /** Optional configuration for route-specific themes. */
  routeThemes?: Record<string, RouteThemeConfig>;
}

/**
 * Creates a theme configuration object.
 * @param config The theme configuration.
 * @returns The theme configuration object.
 */
export function createThemeConfig(config: ThemeConfig): ThemeConfig {
  return config;
}
