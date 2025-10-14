/**
 * Theme Application System
 *
 * Bridges Svelte store state with CSS theming system, providing functions
 * to apply theme classes and handle system theme preference changes.
 */

import { browser } from "$app/environment";
import { logger } from "../utils/logger";
import {
  applyFullTheme,
  applyThemeScheme,
  getCurrentScheme,
} from "./scheme-registry";
import { getRouteTheme, type RouteThemeConfig } from "../utils/route-themes";
import type { ThemeMode, FullTheme, ThemeScheme } from "./types";

/**
 * Applies the theme to the HTML element based on the theme mode.
 * @param theme The theme mode to apply.
 * @deprecated This function is a legacy function. Use `applyThemeWithScheme` instead.
 */
export function applyTheme(theme: ThemeMode): void {
  const currentScheme = getCurrentScheme();
  const fullTheme: FullTheme = { base: theme, scheme: currentScheme };
  applyFullTheme(fullTheme);
}

/**
 * Applies the theme with scheme support.
 * @param theme The theme mode to apply.
 * @param scheme The theme scheme to apply.
 */
export function applyThemeWithScheme(
  theme: ThemeMode,
  scheme: ThemeScheme,
): void {
  const fullTheme: FullTheme = { base: theme, scheme };
  applyFullTheme(fullTheme);
}

/**
 * Applies the resolved system theme preference.
 */
function applySystemTheme(): void {
  if (
    !browser ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  )
    return;

  const html = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Add resolved system theme class for immediate styling
  html.classList.remove("theme-system-light", "theme-system-dark");
  html.classList.add(prefersDark ? "theme-system-dark" : "theme-system-light");
}

/**
 * Watches for system theme preference changes and calls a callback.
 * @param callback The callback to call when the system theme changes.
 * @returns A function to stop watching for changes.
 */
export function watchSystemTheme(
  callback: (systemTheme: "light" | "dark") => void,
): () => void {
  if (!browser || typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    const matches =
      "matches" in e ? e.matches : (e as MediaQueryListEvent).matches;
    const systemTheme = matches ? "dark" : "light";
    callback(systemTheme);

    // If system theme is currently active, update the resolved class
    if (
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("theme-system")
    ) {
      applySystemTheme();
    }
  };

  // Defensive programming: check if addEventListener is available, fallback to addListener
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  } else if (typeof (mediaQuery as any).addListener === "function") {
    // Legacy API fallback
    (mediaQuery as any).addListener(handleChange);
    return () => {
      if (typeof (mediaQuery as any).removeListener === "function") {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  } else {
    // No event support available
    return () => {};
  }
}

/**
 * Initializes the theme system by applying the stored theme and setting up system watching.
 * @param storedTheme The stored theme mode.
 * @param storedScheme The stored theme scheme.
 * @returns A function to clean up the system theme watcher.
 */
export function initializeTheme(
  storedTheme: ThemeMode,
  storedScheme: ThemeScheme = "default",
): () => void {
  if (
    !browser ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  )
    return () => {};

  // All scheme CSS is statically imported - no preloading needed

  // Apply the stored theme and scheme immediately
  applyThemeWithScheme(storedTheme, storedScheme);

  // Set up system theme watching for when system mode is active
  const cleanup = watchSystemTheme((systemTheme) => {
    // Only react if system theme is currently active
    if (
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("theme-system")
    ) {
      applySystemTheme();
    }
  });

  return cleanup;
}

/**
 * Applies a theme based on the route configuration.
 * @param pathname The current route's pathname.
 * @param userTheme The user's preferred theme mode.
 * @param userScheme The user's preferred theme scheme.
 * @param routeThemes A record of route-specific theme configurations.
 * @returns The full theme applied to the route.
 */
export function applyRouteTheme(
    pathname: string,
    userTheme: ThemeMode,
    userScheme: ThemeScheme,
    routeThemes: Record<string, RouteThemeConfig>,
): FullTheme {
  const routeConfig = getRouteTheme(pathname, routeThemes);

  logger.info("Route theme check", {
    pathname,
    routeConfig: routeConfig
      ? {
          theme: routeConfig.theme,
          override: routeConfig.override,
          description: routeConfig.description,
        }
      : null,
    userTheme,
    userScheme,
  });

  if (routeConfig) {
    if (routeConfig.override) {
      // Route overrides user preferences
      logger.info("Applying route theme override", {
        pathname,
        routeTheme: routeConfig.theme,
        userTheme: { base: userTheme, scheme: userScheme },
      });
      applyFullTheme(routeConfig.theme);
      return routeConfig.theme;
    } else {
      // Route suggests theme but respects user preferences for base theme
      const suggestedTheme: FullTheme = {
        base: userTheme,
        scheme: routeConfig.theme.scheme,
      };
      logger.info("Applying route theme suggestion", {
        pathname,
        suggestedTheme,
        userTheme: { base: userTheme, scheme: userScheme },
      });
      applyFullTheme(suggestedTheme);
      return suggestedTheme;
    }
  } else {
    // No route theme, use user preferences
    logger.debug("No route theme found, using user preferences", { pathname });
    const userFullTheme: FullTheme = { base: userTheme, scheme: userScheme };
    applyFullTheme(userFullTheme);
    return userFullTheme;
  }
}
