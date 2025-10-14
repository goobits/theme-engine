/**
 * Centralized cookie utilities for user preferences
 * Works on both client and server side
 */

import { browser } from '$app/environment';

/**
 * Represents the user's preferences.
 */
export interface UserPreferences {
  /** The theme mode. */
  theme: 'light' | 'dark' | 'system';
  /** The theme scheme. */
  themeScheme: 'default' | 'spells';
  /** The user's language. */
  language: string;
  /** The theme for the language. */
  languageTheme: 'default' | 'spells';
  /** Whether to show the sidebar. */
  showSidebar: boolean;
}

/**
 * The names of the preference cookies.
 */
export const PREFERENCE_COOKIE_NAMES = {
  theme: 'theme',
  themeScheme: 'themeScheme',
  language: 'language',
  languageTheme: 'languageTheme',
  showSidebar: 'showSidebar'
} as const;

/**
 * The options for the preference cookies.
 */
export const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: false, // Allow client-side access
  secure: false, // Allow in development
  sameSite: 'lax' as const,
};

/**
 * Reads user preferences from cookies on the client-side.
 * @returns The user's preferences.
 */
export function readPreferenceCookies(): Partial<UserPreferences> {
  if (!browser) return {};

  const preferences: Partial<UserPreferences> = {};

  if (!document.cookie) return preferences;

  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === 'theme') preferences.theme = value as UserPreferences['theme'];
    if (key === 'themeScheme') preferences.themeScheme = value as UserPreferences['themeScheme'];
    if (key === 'language') preferences.language = value;
    if (key === 'languageTheme') preferences.languageTheme = value as UserPreferences['languageTheme'];
    if (key === 'showSidebar') preferences.showSidebar = value === 'true';
  }

  return preferences;
}

/**
 * Writes user preferences to cookies on the client-side.
 * @param preferences The preferences to write.
 */
export function writePreferenceCookies(preferences: Partial<UserPreferences>): void {
  if (!browser) return;

  const cookieOptions = `path=${COOKIE_OPTIONS.path}; max-age=${COOKIE_OPTIONS.maxAge}; SameSite=${COOKIE_OPTIONS.sameSite}`;

  if (preferences.theme) {
    document.cookie = `theme=${preferences.theme}; ${cookieOptions}`;
  }
  if (preferences.themeScheme) {
    document.cookie = `themeScheme=${preferences.themeScheme}; ${cookieOptions}`;
  }
  if (preferences.language) {
    document.cookie = `language=${preferences.language}; ${cookieOptions}`;
  }
  if (preferences.languageTheme) {
    document.cookie = `languageTheme=${preferences.languageTheme}; ${cookieOptions}`;
  }
  if (preferences.showSidebar !== undefined) {
    document.cookie = `showSidebar=${preferences.showSidebar}; ${cookieOptions}`;
  }
}

/**
 * Gets the default user preferences.
 * @returns The default user preferences.
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'system',
    themeScheme: 'default',
    language: 'en',
    languageTheme: 'default',
    showSidebar: true,
  };
}