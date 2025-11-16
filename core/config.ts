import type { SchemeConfig } from './types';
import type { RouteThemeConfig } from '../utils/route-themes';

export interface ThemeConfig {
    schemes: Record<string, SchemeConfig>;
    routeThemes?: Record<string, RouteThemeConfig>;
}

export function createThemeConfig(config: ThemeConfig): ThemeConfig {
    return config;
}
