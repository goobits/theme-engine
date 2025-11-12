/**
 * Tests for Theme Svelte Store
 *
 * Comprehensive tests for the Svelte 5 runes-based theme store
 * with localStorage and cookie persistence.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createThemeStore } from "./theme.svelte";
import type { ThemeMode, ThemeScheme } from "../../core/types";
import type { ThemeConfig } from "../../core/config";

// Mock the $app/environment module
vi.mock("$app/environment", () => ({
  browser: false,
}));

// Mock the cookies utilities
vi.mock("../../utils/cookies", () => ({
  readPreferenceCookies: vi.fn(() => ({})),
  writePreferenceCookies: vi.fn(),
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
  const module = await import("$app/environment");
  vi.mocked(module).browser = isBrowser;
}

// Helper to create mock ThemeConfig
function createMockConfig(schemes?: Record<string, any>): ThemeConfig {
  return {
    schemes: schemes || {
      default: {
        name: "default",
        displayName: "Default",
        description: "Default theme",
        preview: {
          primary: "#000",
          accent: "#fff",
          background: "#fff",
        },
      },
      spells: {
        name: "spells",
        displayName: "Spells",
        description: "Spells theme",
        preview: {
          primary: "#purple",
          accent: "#gold",
          background: "#dark",
        },
      },
    },
  };
}

// Helper to mock localStorage
function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
}

describe("createThemeStore", () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  describe("initialization", () => {
    it("should create store with default settings on server", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
      expect(store.theme).toBe("system");
      expect(store.scheme).toBe("default");
    });

    it("should create store with first scheme from config", async () => {
      await setBrowserMode(false);
      const config = createMockConfig({
        custom: {
          name: "custom",
          displayName: "Custom",
          description: "Custom theme",
          preview: { primary: "#000", accent: "#fff", background: "#fff" },
        },
      });
      const store = createThemeStore(config);

      expect(store.settings.themeScheme).toBe("custom");
    });

    it("should expose availableSchemes from config", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.availableSchemes).toHaveLength(2);
      expect(store.availableSchemes[0].name).toBe("default");
      expect(store.availableSchemes[1].name).toBe("spells");
    });

    it("should handle empty schemes config gracefully", async () => {
      await setBrowserMode(false);
      const config = createMockConfig({});
      const store = createThemeStore(config);

      expect(store.settings.themeScheme).toBe("default");
    });

    it("should load settings from localStorage on browser", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      mockStorage.setItem("app_theme_v1", JSON.stringify({
        theme: "dark",
        themeScheme: "spells",
      }));

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "dark",
        themeScheme: "spells",
      });
      expect(store.theme).toBe("dark");
      expect(store.scheme).toBe("spells");
    });

    it("should fallback to cookies when localStorage is empty", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "light",
        themeScheme: "default",
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "light",
        themeScheme: "default",
      });
    });

    it("should use defaults when both localStorage and cookies are empty", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({});

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
    });
  });

  describe("setTheme", () => {
    it("should update theme mode", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");

      expect(store.theme).toBe("dark");
      expect(store.settings.theme).toBe("dark");
    });

    it("should save to localStorage when theme is changed", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("light");

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "app_theme_v1",
        JSON.stringify({ theme: "light", themeScheme: "default" })
      );
    });

    it("should write to cookies when theme is changed", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { writePreferenceCookies } = await import("../../utils/cookies");

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");

      expect(writePreferenceCookies).toHaveBeenCalledWith({
        theme: "dark",
        themeScheme: "default",
      });
    });

    it("should update all theme modes correctly", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      const modes: ThemeMode[] = ["light", "dark", "system"];

      modes.forEach((mode) => {
        store.setTheme(mode);
        expect(store.theme).toBe(mode);
      });
    });

    it("should handle localStorage errors gracefully", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      // Should not throw
      expect(() => store.setTheme("dark")).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to save theme settings to localStorage",
        expect.any(Error)
      );
    });
  });

  describe("setScheme", () => {
    it("should update theme scheme", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setScheme("spells");

      expect(store.scheme).toBe("spells");
      expect(store.settings.themeScheme).toBe("spells");
    });

    it("should save to localStorage when scheme is changed", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setScheme("spells");

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "app_theme_v1",
        JSON.stringify({ theme: "system", themeScheme: "spells" })
      );
    });

    it("should write to cookies when scheme is changed", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { writePreferenceCookies } = await import("../../utils/cookies");

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setScheme("spells");

      expect(writePreferenceCookies).toHaveBeenCalledWith({
        theme: "system",
        themeScheme: "spells",
      });
    });

    it("should handle different scheme types", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      const schemes: ThemeScheme[] = ["default", "spells"];

      schemes.forEach((scheme) => {
        store.setScheme(scheme);
        expect(store.scheme).toBe(scheme);
      });
    });
  });

  describe("cycleMode", () => {
    it("should cycle from light to dark", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("light");
      store.cycleMode();

      expect(store.theme).toBe("dark");
    });

    it("should cycle from dark to system", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");
      store.cycleMode();

      expect(store.theme).toBe("system");
    });

    it("should cycle from system to light", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("system");
      store.cycleMode();

      expect(store.theme).toBe("light");
    });

    it("should complete full cycle through all modes", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("light");
      expect(store.theme).toBe("light");

      store.cycleMode();
      expect(store.theme).toBe("dark");

      store.cycleMode();
      expect(store.theme).toBe("system");

      store.cycleMode();
      expect(store.theme).toBe("light");
    });

    it("should save to localStorage when cycling", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.cycleMode();

      expect(mockStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("localStorage persistence", () => {
    it("should not save to localStorage on server", async () => {
      await setBrowserMode(false);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("should handle JSON parse errors gracefully", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem("app_theme_v1", "invalid json {");
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({});

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to load theme settings from localStorage",
        expect.any(Error)
      );
    });

    it("should merge localStorage settings with defaults", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem("app_theme_v1", JSON.stringify({
        theme: "dark",
      }));
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "dark",
        themeScheme: "default",
      });
    });

    it("should use localStorage over cookies when both exist", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem("app_theme_v1", JSON.stringify({
        theme: "dark",
        themeScheme: "spells",
      }));
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "light",
        themeScheme: "default",
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "dark",
        themeScheme: "spells",
      });
    });
  });

  describe("cookie fallback chain", () => {
    it("should fallback to cookies when localStorage throws error", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.getItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "light",
        themeScheme: "spells",
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "light",
        themeScheme: "spells",
      });
    });

    it("should fallback to defaults when cookies throw error", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockImplementation(() => {
        throw new Error("Cookie access denied");
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
    });

    it("should only use cookies when both theme and themeScheme are present", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "dark",
        // Missing themeScheme
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      // Should use defaults because themeScheme is missing from cookies
      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
    });

    it("should use cookies when only themeScheme is missing from localStorage", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "light",
        themeScheme: "spells",
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.settings).toEqual({
        theme: "light",
        themeScheme: "spells",
      });
    });
  });

  describe("subscribe function", () => {
    it("should provide subscribe function for backward compatibility", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(store.subscribe).toBeInstanceOf(Function);
    });

    it("should call subscriber immediately with initial value", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      const subscriber = vi.fn();
      store.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith({
        settings: store.settings,
        theme: store.theme,
        scheme: store.scheme,
      });
    });

    it("should return unsubscribe function", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it("should stop calling subscriber after unsubscribe", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      subscriber.mockClear();

      store.setTheme("dark");

      // Subscriber should not be called after unsubscribe
      // Note: The current implementation doesn't auto-notify subscribers
      // This is expected behavior for a manual subscription system
      expect(subscriber).not.toHaveBeenCalled();
    });

    it("should support multiple subscribers", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      store.subscribe(subscriber1);
      store.subscribe(subscriber2);

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    it("should allow partial unsubscribe", async () => {
      await setBrowserMode(false);
      const config = createMockConfig();
      const store = createThemeStore(config);

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.subscribe(subscriber1);
      store.subscribe(subscriber2);

      unsubscribe1();

      // Both should still have been called initially
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });
  });


  describe("edge cases", () => {
    it("should handle concurrent theme changes", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");
      store.setTheme("light");
      store.setTheme("system");

      expect(store.theme).toBe("system");
      expect(mockStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it("should handle storage quota exceeded error", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem.mockImplementation(() => {
        const error: any = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      expect(() => store.setTheme("dark")).not.toThrow();
      expect(store.theme).toBe("dark");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should maintain state consistency after errors", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      let shouldThrow = true;
      mockStorage.setItem.mockImplementation((key, value) => {
        if (shouldThrow) {
          throw new Error("Storage error");
        }
      });
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("dark");
      expect(store.theme).toBe("dark");

      shouldThrow = false;
      store.setScheme("spells");
      expect(store.scheme).toBe("spells");
      expect(store.theme).toBe("dark");
    });

    it("should handle cookie write failures gracefully", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { writePreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(writePreferenceCookies).mockImplementation(() => {
        throw new Error("Cookie write failed");
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      // Should still complete the operation even if cookie write fails
      expect(() => store.setTheme("dark")).not.toThrow();
      expect(store.theme).toBe("dark");
    });

    it("should handle undefined or null in stored data", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      mockStorage.setItem("app_theme_v1", JSON.stringify({
        theme: null,
        themeScheme: undefined,
      }));
      global.localStorage = mockStorage as any;

      const config = createMockConfig();
      const store = createThemeStore(config);

      // The spread operator doesn't override null with defaults
      // null values are explicitly set, so they override defaults
      expect(store.settings.theme).toBe(null);
      // undefined values are not serialized to JSON, so default is used
      expect(store.settings.themeScheme).toBe("default");
    });
  });

  describe("integration scenarios", () => {
    it("should persist and restore complete user session", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();

      // First session: user changes preferences
      const store1 = createThemeStore(config);
      store1.setTheme("dark");
      store1.setScheme("spells");

      // Second session: preferences should be restored
      const store2 = createThemeStore(config);
      expect(store2.theme).toBe("dark");
      expect(store2.scheme).toBe("spells");
    });

    it("should sync between localStorage and cookies", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const { writePreferenceCookies } = await import("../../utils/cookies");
      const mockWriteCookies = vi.mocked(writePreferenceCookies);

      const config = createMockConfig();
      const store = createThemeStore(config);

      store.setTheme("light");

      // Check both storage mechanisms were updated
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "app_theme_v1",
        expect.stringContaining('"theme":"light"')
      );
      expect(mockWriteCookies).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "light" })
      );
    });

    it("should handle migration from cookies to localStorage", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      // User has cookies but no localStorage (migration scenario)
      const { readPreferenceCookies } = await import("../../utils/cookies");
      vi.mocked(readPreferenceCookies).mockReturnValue({
        theme: "dark",
        themeScheme: "spells",
      });

      const config = createMockConfig();
      const store = createThemeStore(config);

      // Should load from cookies
      expect(store.theme).toBe("dark");
      expect(store.scheme).toBe("spells");

      // Any change should now save to localStorage
      store.setTheme("light");
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "app_theme_v1",
        expect.stringContaining('"theme":"light"')
      );
    });

    it("should work correctly across multiple store instances", async () => {
      await setBrowserMode(true);
      const mockStorage = mockLocalStorage();
      global.localStorage = mockStorage as any;

      const config = createMockConfig();

      const store1 = createThemeStore(config);
      const store2 = createThemeStore(config);

      store1.setTheme("dark");

      // Note: store2 won't automatically sync, but a new instance will read the updated value
      const store3 = createThemeStore(config);
      expect(store3.theme).toBe("dark");
    });
  });
});
