/**
 * Tests for useTheme Svelte Hook
 *
 * Comprehensive tests for the useTheme hook that provides access to
 * theme context in Svelte components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTheme } from "./useTheme.svelte";
import type { ThemeStore } from "../stores/theme.svelte";
import type { ThemeMode, ThemeScheme } from "../../core/types";

// Mock the svelte module
vi.mock("svelte", () => ({
  getContext: vi.fn(),
}));

describe("useTheme", () => {
  let getContextMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const svelteModule = await import("svelte");
    getContextMock = vi.mocked(svelteModule.getContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("successful context retrieval", () => {
    it("should retrieve theme store from context", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(getContextMock).toHaveBeenCalledWith("theme");
      expect(getContextMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockStore);
    });

    it("should return theme store with light mode", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "light", themeScheme: "default" },
        theme: "light",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.theme).toBe("light");
      expect(result.settings.theme).toBe("light");
    });

    it("should return theme store with dark mode", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "dark", themeScheme: "default" },
        theme: "dark",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.theme).toBe("dark");
      expect(result.settings.theme).toBe("dark");
    });

    it("should return theme store with custom scheme", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "spells" },
        theme: "system",
        scheme: "spells",
        availableSchemes: [
          {
            name: "default",
            displayName: "Default",
            description: "Default theme",
          },
          {
            name: "spells",
            displayName: "Spells",
            description: "Spells theme",
          },
        ],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.scheme).toBe("spells");
      expect(result.settings.themeScheme).toBe("spells");
      expect(result.availableSchemes).toHaveLength(2);
    });

    it("should return theme store with all available methods", () => {
      const setThemeMock = vi.fn();
      const setSchemeMock = vi.fn();
      const cycleModeMock = vi.fn();
      const subscribeMock = vi.fn();

      const mockStore: ThemeStore = {
        subscribe: subscribeMock,
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: setThemeMock,
        setScheme: setSchemeMock,
        cycleMode: cycleModeMock,
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.setTheme).toBe(setThemeMock);
      expect(result.setScheme).toBe(setSchemeMock);
      expect(result.cycleMode).toBe(cycleModeMock);
      expect(result.subscribe).toBe(subscribeMock);
    });

    it("should return theme store with multiple available schemes", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "dark", themeScheme: "custom" as ThemeScheme },
        theme: "dark",
        scheme: "custom" as ThemeScheme,
        availableSchemes: [
          { name: "default", displayName: "Default" },
          { name: "custom", displayName: "Custom" },
          { name: "spells", displayName: "Spells" },
          { name: "brand", displayName: "Brand" },
        ],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.availableSchemes).toHaveLength(4);
      expect(result.availableSchemes[1].name).toBe("custom");
    });
  });

  describe("error handling", () => {
    it("should throw error when context is not found", () => {
      getContextMock.mockReturnValue(undefined);

      expect(() => useTheme()).toThrow(
        "useTheme must be used within a ThemeProvider"
      );
      expect(getContextMock).toHaveBeenCalledWith("theme");
    });

    it("should throw error when context is null", () => {
      getContextMock.mockReturnValue(null);

      expect(() => useTheme()).toThrow(
        "useTheme must be used within a ThemeProvider"
      );
    });

    it("should throw error with correct message", () => {
      getContextMock.mockReturnValue(undefined);

      try {
        useTheme();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "useTheme must be used within a ThemeProvider"
        );
      }
    });

    it.each([
      ["false", false],
      ["empty string", ""],
      ["0", 0],
    ])("should throw error when getContext returns %s", (_, value) => {
      getContextMock.mockReturnValue(value);

      expect(() => useTheme()).toThrow(
        "useTheme must be used within a ThemeProvider"
      );
    });
  });

  describe("context key verification", () => {
    it("should use 'theme' as context key", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      useTheme();

      expect(getContextMock).toHaveBeenCalledWith("theme");
      expect(getContextMock).not.toHaveBeenCalledWith("Theme");
      expect(getContextMock).not.toHaveBeenCalledWith("themeStore");
    });

    it("should call getContext exactly once", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      useTheme();

      expect(getContextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle theme store with empty availableSchemes", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.availableSchemes).toEqual([]);
      expect(result.availableSchemes).toHaveLength(0);
    });

    it("should handle multiple calls to useTheme", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result1 = useTheme();
      const result2 = useTheme();
      const result3 = useTheme();

      expect(result1).toBe(mockStore);
      expect(result2).toBe(mockStore);
      expect(result3).toBe(mockStore);
      expect(getContextMock).toHaveBeenCalledTimes(3);
    });

    it("should handle theme store with all theme modes in availableSchemes", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "light", themeScheme: "default" },
        theme: "light",
        scheme: "default",
        availableSchemes: [
          {
            name: "default",
            displayName: "Default",
            description: "Default theme",
            preview: {
              primary: "#000",
              accent: "#fff",
              background: "#fff",
            },
          },
          {
            name: "spells",
            displayName: "Spells",
            description: "Magical theme",
            preview: {
              primary: "#purple",
              accent: "#gold",
              background: "#dark",
            },
          },
        ],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.availableSchemes).toHaveLength(2);
      expect(result.availableSchemes[0]).toHaveProperty("preview");
      expect(result.availableSchemes[1]).toHaveProperty("preview");
    });

    it("should preserve store reference identity", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result).toBe(mockStore);
      expect(Object.is(result, mockStore)).toBe(true);
    });

    it("should handle context retrieval with complex settings", () => {
      const complexSettings = {
        theme: "dark" as ThemeMode,
        themeScheme: "spells" as ThemeScheme,
      };

      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: complexSettings,
        theme: complexSettings.theme,
        scheme: complexSettings.themeScheme,
        availableSchemes: [
          { name: "default", displayName: "Default" },
          { name: "spells", displayName: "Spells" },
          { name: "custom1", displayName: "Custom 1" },
          { name: "custom2", displayName: "Custom 2" },
          { name: "custom3", displayName: "Custom 3" },
        ],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      const result = useTheme();

      expect(result.settings).toEqual(complexSettings);
      expect(result.availableSchemes).toHaveLength(5);
    });
  });

  describe("integration with getContext", () => {
    it("should properly integrate with Svelte's getContext API", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValue(mockStore);

      useTheme();

      // Verify getContext is called with correct type signature
      expect(getContextMock).toHaveBeenCalledWith("theme");
      expect(typeof getContextMock.mock.calls[0][0]).toBe("string");
    });

    it("should handle getContext returning different store instances", () => {
      const mockStore1: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "light", themeScheme: "default" },
        theme: "light",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      const mockStore2: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "dark", themeScheme: "spells" },
        theme: "dark",
        scheme: "spells",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      getContextMock.mockReturnValueOnce(mockStore1);
      const result1 = useTheme();

      getContextMock.mockReturnValueOnce(mockStore2);
      const result2 = useTheme();

      expect(result1).toBe(mockStore1);
      expect(result2).toBe(mockStore2);
      expect(result1).not.toBe(result2);
      expect(result1.theme).toBe("light");
      expect(result2.theme).toBe("dark");
    });

    it("should not modify the context value", () => {
      const mockStore: ThemeStore = {
        subscribe: vi.fn(),
        settings: { theme: "system", themeScheme: "default" },
        theme: "system",
        scheme: "default",
        availableSchemes: [],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
      };

      const originalStore = { ...mockStore };
      getContextMock.mockReturnValue(mockStore);

      useTheme();

      // Verify the store is not modified by useTheme
      expect(mockStore.theme).toBe(originalStore.theme);
      expect(mockStore.scheme).toBe(originalStore.scheme);
      expect(mockStore.settings).toEqual(originalStore.settings);
    });
  });
});
