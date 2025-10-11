/**
 * Theme Scheme Management System
 *
 * Provides utilities for managing theme schemes alongside base themes,
 * supporting both route-specific automatic application and global user selection.
 */

import { browser } from "$app/environment";
import { logger } from "$lib/utils/logger";
import type { ThemeScheme, SchemeConfig, FullTheme } from "./types";

// Available theme schemes
export const THEME_SCHEMES: Record<ThemeScheme, SchemeConfig> = {
  default: {
    name: "default",
    displayName: "Default",
    description: "Clean, minimal design system",
    icon: "🤖", // Robot icon for default theme
    title: "Prompt Library", // Default title
    preview: {
      primary: "#007aff",
      accent: "#5856d6",
      background: "#ffffff",
    },
  },
  spells: {
    name: "spells",
    displayName: "Grimoire",
    description: "Magical purple theme for enchanted experiences",
    icon: "✨", // Sparkles for magical theme
    title: "Spell Library", // Magical title
    preview: {
      primary: "#7c3aed",
      accent: "#a78bfa",
      background: "#0a0a0f",
    },
    // Note: CSS is loaded via import in design-tokens.css, not dynamically
  },
};

/**
 * Apply theme scheme to the HTML element
 */
export function applyThemeScheme(scheme: ThemeScheme): void {
  if (!browser || typeof document === "undefined") return;

  const html = document.documentElement;

  // Remove existing scheme classes
  Object.keys(THEME_SCHEMES).forEach((schemeName) => {
    html.classList.remove(`scheme-${schemeName}`);
  });

  // Apply new scheme class
  html.classList.add(`scheme-${scheme}`);

  logger.debug("Theme scheme applied", { scheme });
}

/**
 * Apply full theme (base + scheme) to the HTML element
 */
export function applyFullTheme(fullTheme: FullTheme): void {
  if (!browser || typeof document === "undefined") return;

  const html = document.documentElement;

  // Temporarily disable transitions for instant theme switching
  html.classList.add("theme-switching");

  // Remove existing theme classes
  html.classList.remove(
    "theme-light",
    "theme-dark",
    "theme-system",
    "theme-system-light",
    "theme-system-dark",
  );

  // Remove existing scheme classes
  Object.keys(THEME_SCHEMES).forEach((schemeName) => {
    html.classList.remove(`scheme-${schemeName}`);
  });

  // Apply base theme
  switch (fullTheme.base) {
    case "light":
      html.classList.add("theme-light");
      break;
    case "dark":
      html.classList.add("theme-dark");
      break;
    case "system": {
      html.classList.add("theme-system");
      // For system theme, also apply the appropriate resolved theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      html.classList.add(
        prefersDark ? "theme-system-dark" : "theme-system-light",
      );
      break;
    }
  }

  // Apply scheme
  html.classList.add(`scheme-${fullTheme.scheme}`);

  // Re-enable transitions after a brief delay
  setTimeout(() => {
    html.classList.remove("theme-switching");
  }, 100);

  // Enhanced debugging for theme application
  const appliedClasses = Array.from(html.classList).filter(
    (cls) => cls.startsWith("theme-") || cls.startsWith("scheme-"),
  );

  logger.info("Full theme applied successfully", {
    fullTheme,
    appliedClasses,
    htmlElement: html.tagName,
  });
}

/**
 * Get the current scheme from document classes
 */
export function getCurrentScheme(): ThemeScheme {
  if (!browser || typeof document === "undefined") return "default";

  const html = document.documentElement;

  for (const scheme of Object.keys(THEME_SCHEMES)) {
    if (html.classList.contains(`scheme-${scheme}`)) {
      return scheme as ThemeScheme;
    }
  }

  return "default";
}

/**
 * Check if a scheme requires dark mode for optimal appearance
 */
function schemePrefersDark(scheme: ThemeScheme): boolean {
  switch (scheme) {
    case "spells":
      return true; // Spells theme looks best in dark mode
    default:
      return false;
  }
}

/**
 * All scheme CSS is now statically imported in design-tokens.css
 * No dynamic loading needed - schemes are always available
 */
