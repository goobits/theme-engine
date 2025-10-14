import { browser } from "$app/environment";
import type { ThemeMode, ThemeScheme } from '../../core/types';
import { readPreferenceCookies, writePreferenceCookies } from '../../utils/cookies';
import type { ThemeConfig } from "../../core/config";

/**
 * Represents the theme settings.
 */
export interface ThemeSettings {
  /** The theme mode. */
  theme: ThemeMode;
  /** The theme scheme. */
  themeScheme: ThemeScheme;
}

/**
 * Represents the theme store.
 */
export interface ThemeStore {
  /** Subscribes to changes in the theme store. */
  subscribe: (fn: (value: any) => void) => () => void;
  /** The theme settings. */
  readonly settings: ThemeSettings;
  /** The current theme mode. */
  readonly theme: ThemeMode;
  /** The current theme scheme. */
  readonly scheme: ThemeScheme;
  /** The available theme schemes. */
  readonly availableSchemes: any[];
  /** Sets the theme mode. */
  setTheme(theme: ThemeMode): void;
  /** Sets the theme scheme. */
  setScheme(scheme: ThemeScheme): void;
  /** Cycles through the available theme modes. */
  cycleMode(): void;
}

/**
 * Creates a theme store.
 * @param config The theme configuration.
 * @returns The theme store.
 */
export function createThemeStore(config: ThemeConfig): ThemeStore {
  const defaultSettings: ThemeSettings = {
    theme: "system",
    themeScheme: Object.keys(config.schemes)[0] || 'default',
  };

  const STORAGE_KEY = "app_theme_v1";

  let settings = $state<ThemeSettings>(defaultSettings);

  function saveToLocalStorage(currentSettings: ThemeSettings): void {
    if (!browser) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      writePreferenceCookies({
        theme: currentSettings.theme,
        themeScheme: currentSettings.themeScheme,
      });
    } catch (err) {
      console.error(
        "Failed to save theme settings to localStorage",
        err
      );
    }
  }

  function loadFromLocalStorage(): ThemeSettings {
    if (!browser) {
      return defaultSettings;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch (err) {
        console.warn(
            "Failed to load theme settings from localStorage",
            err
        );
    }

    try {
      const cookieSettings: any = readPreferenceCookies();
      if (cookieSettings.theme && cookieSettings.themeScheme) {
        return { ...defaultSettings, theme: cookieSettings.theme, themeScheme: cookieSettings.themeScheme };
      }
    } catch {
      // Cookie reading failed, use defaults
    }

    return defaultSettings;
  }

  if (browser) {
    settings = loadFromLocalStorage();
  }

  const theme = $derived(settings.theme);
  const scheme = $derived(settings.themeScheme);
  const availableSchemes = $derived(Object.values(config.schemes));

  function setTheme(newTheme: ThemeMode) {
    settings.theme = newTheme;
    saveToLocalStorage(settings);
  }

  function setScheme(newScheme: ThemeScheme) {
    settings.themeScheme = newScheme;
    saveToLocalStorage(settings);
  }

  function cycleMode() {
    const modes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  }

  // Create a subscribe function for backward compatibility with non-runes code
  let subscribers = new Set<(value: any) => void>();

  const subscribe = (fn: (value: any) => void): (() => void) => {
    subscribers.add(fn);
    fn({
      settings,
      theme,
      scheme,
    });
    return () => {
      subscribers.delete(fn);
    };
  };

  return {
    subscribe,
    get settings() {
      return settings;
    },
    get theme() {
      return theme;
    },
    get scheme() {
      return scheme;
    },
    get availableSchemes() {
      return availableSchemes;
    },
    setTheme,
    setScheme,
    cycleMode,
  };
}
