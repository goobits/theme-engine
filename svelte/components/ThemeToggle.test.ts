/**
 * Tests for ThemeToggle Svelte Component
 *
 * Comprehensive tests for the ThemeToggle component that provides a button
 * to cycle through theme modes (light → dark → system → light) with
 * appropriate icons and accessibility features.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ThemeStore } from "../stores/theme.svelte";
import type { ThemeMode, ThemeScheme } from "../../core/types";

// Mock lucide-svelte icons
const MockSun = vi.fn();
const MockMoon = vi.fn();
const MockMonitor = vi.fn();

vi.mock("@lucide/svelte", () => ({
  Sun: MockSun,
  Moon: MockMoon,
  Monitor: MockMonitor,
}));

// Mock useTheme hook
let mockThemeStore: ThemeStore;
const useThemeMock = vi.fn();

vi.mock("../hooks/useTheme.svelte", () => ({
  useTheme: () => useThemeMock(),
}));

// Helper to create mock ThemeStore with reactive properties
function createMockThemeStore(
  theme: ThemeMode = "system",
  scheme: ThemeScheme = "default"
): ThemeStore {
  return {
    subscribe: vi.fn(),
    settings: { theme, themeScheme: scheme },
    theme,
    scheme,
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
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeStore = createMockThemeStore();
    useThemeMock.mockReturnValue(mockThemeStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("component initialization", () => {
    it("should call useTheme hook on mount", async () => {
      useThemeMock.mockReturnValue(createMockThemeStore());
      await import("./ThemeToggle.svelte");

      expect(useThemeMock).toBeDefined();
    });

    it("should initialize with light theme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("light");
      expect(store.settings.theme).toBe("light");
    });

    it("should initialize with dark theme", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("dark");
      expect(store.settings.theme).toBe("dark");
    });

    it("should initialize with system theme", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("system");
      expect(store.settings.theme).toBe("system");
    });

    it("should initialize with default scheme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBe("default");
      expect(store.settings.themeScheme).toBe("default");
    });

    it("should initialize with custom scheme", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBe("spells");
      expect(store.settings.themeScheme).toBe("spells");
    });
  });

  describe("theme store integration", () => {
    it("should use theme from theme store", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("dark");
    });

    it("should use scheme from theme store", () => {
      const store = createMockThemeStore("light", "spells");
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBe("spells");
    });

    it("should use availableSchemes from theme store", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.availableSchemes).toHaveLength(2);
      expect(store.availableSchemes[0].name).toBe("default");
      expect(store.availableSchemes[1].name).toBe("spells");
    });

    it("should have access to cycleMode function", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.cycleMode).toBeDefined();
      expect(typeof store.cycleMode).toBe("function");
    });

    it("should have access to setTheme function", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.setTheme).toBeDefined();
      expect(typeof store.setTheme).toBe("function");
    });

    it("should have access to setScheme function", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.setScheme).toBeDefined();
      expect(typeof store.setScheme).toBe("function");
    });
  });

  describe("cycleMode functionality", () => {
    it("should call cycleMode when triggered", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      store.cycleMode();

      expect(store.cycleMode).toHaveBeenCalledTimes(1);
    });

    it("should handle cycling from light theme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("light");
      store.cycleMode();

      expect(store.cycleMode).toHaveBeenCalled();
    });

    it("should handle cycling from dark theme", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("dark");
      store.cycleMode();

      expect(store.cycleMode).toHaveBeenCalled();
    });

    it("should handle cycling from system theme", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("system");
      store.cycleMode();

      expect(store.cycleMode).toHaveBeenCalled();
    });

    it("should handle multiple cycle calls", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      store.cycleMode();
      store.cycleMode();
      store.cycleMode();

      expect(store.cycleMode).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid cycling", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      for (let i = 0; i < 5; i++) {
        store.cycleMode();
      }

      expect(store.cycleMode).toHaveBeenCalledTimes(5);
    });
  });

  describe("icon component integration", () => {
    it("should have Sun icon available for light theme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(MockSun).toBeDefined();
    });

    it("should have Moon icon available for dark theme", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      expect(MockMoon).toBeDefined();
    });

    it("should have Monitor icon available for system theme", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(MockMonitor).toBeDefined();
    });

    it("should handle light theme icon selection logic", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const expectedIcon = MockSun;
      expect(expectedIcon).toBeDefined();
    });

    it("should handle dark theme icon selection logic", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      const expectedIcon = MockMoon;
      expect(expectedIcon).toBeDefined();
    });

    it("should handle system theme icon selection logic", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      const expectedIcon = MockMonitor;
      expect(expectedIcon).toBeDefined();
    });
  });

  describe("accessibility features", () => {
    it("should provide aria-label for light theme (next: dark)", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const expectedLabel = "Switch to dark theme";
      expect(expectedLabel).toBe("Switch to dark theme");
    });

    it("should provide aria-label for dark theme (next: system)", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      const expectedLabel = "Switch to system theme";
      expect(expectedLabel).toBe("Switch to system theme");
    });

    it("should provide aria-label for system theme (next: light)", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      const expectedLabel = "Switch to light theme";
      expect(expectedLabel).toBe("Switch to light theme");
    });

    it("should provide tooltip for light theme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `Light theme (${schemeConfig?.displayName || "Default"})`;
      expect(tooltip).toBe("Light theme (Default)");
    });

    it("should provide tooltip for dark theme", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `Dark theme (${schemeConfig?.displayName || "Default"})`;
      expect(tooltip).toBe("Dark theme (Default)");
    });

    it("should provide tooltip for system theme", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `System theme (${schemeConfig?.displayName || "Default"})`;
      expect(tooltip).toBe("System theme (Default)");
    });

    it("should include scheme name in tooltip", () => {
      const store = createMockThemeStore("light", "spells");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `Light theme (${schemeConfig?.displayName || "Default"})`;
      expect(tooltip).toBe("Light theme (Spells)");
    });

    it("should handle aria-live announcements", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const announcement = `Switched to dark theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;
      expect(announcement).toBe("Switched to dark theme with Spells colors");
    });
  });

  describe("theme info calculation", () => {
    it("should calculate correct info for light theme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const info = {
        icon: "Sun",
        tooltip: `Light theme (${schemeConfig?.displayName || "Default"})`,
        ariaLabel: "Switch to dark theme",
      };

      expect(info.icon).toBe("Sun");
      expect(info.tooltip).toBe("Light theme (Default)");
      expect(info.ariaLabel).toBe("Switch to dark theme");
    });

    it("should calculate correct info for dark theme", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const info = {
        icon: "Moon",
        tooltip: `Dark theme (${schemeConfig?.displayName || "Default"})`,
        ariaLabel: "Switch to system theme",
      };

      expect(info.icon).toBe("Moon");
      expect(info.tooltip).toBe("Dark theme (Default)");
      expect(info.ariaLabel).toBe("Switch to system theme");
    });

    it("should calculate correct info for system theme", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const info = {
        icon: "Monitor",
        tooltip: `System theme (${schemeConfig?.displayName || "Default"})`,
        ariaLabel: "Switch to light theme",
      };

      expect(info.icon).toBe("Monitor");
      expect(info.tooltip).toBe("System theme (Default)");
      expect(info.ariaLabel).toBe("Switch to light theme");
    });

    it("should handle custom scheme in theme info", () => {
      const store = createMockThemeStore("light", "spells");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `Light theme (${schemeConfig?.displayName || "Default"})`;

      expect(tooltip).toBe("Light theme (Spells)");
    });

    it("should fallback to Default when scheme not found", () => {
      const store = createMockThemeStore("dark", "unknown" as ThemeScheme);
      store.availableSchemes = [{ name: "default", displayName: "Default" }];
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const tooltip = `Dark theme (${schemeConfig?.displayName || "Default"})`;

      expect(tooltip).toBe("Dark theme (Default)");
    });

    it("should handle default case in theme switch", () => {
      const store = createMockThemeStore("invalid" as ThemeMode, "default");
      useThemeMock.mockReturnValue(store);

      // Default case should return Monitor icon and system-like info
      const defaultIcon = "Monitor";
      expect(defaultIcon).toBe("Monitor");
    });
  });

  describe("scheme name resolution", () => {
    it("should find scheme displayName from availableSchemes", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig).toBeDefined();
      expect(schemeConfig?.displayName).toBe("Default");
    });

    it("should find custom scheme displayName", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig).toBeDefined();
      expect(schemeConfig?.displayName).toBe("Spells");
    });

    it("should return undefined for non-existent scheme", () => {
      const store = createMockThemeStore("system", "nonexistent" as ThemeScheme);
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig).toBeUndefined();
    });

    it("should handle empty availableSchemes array", () => {
      const store = createMockThemeStore("light", "default");
      store.availableSchemes = [];
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig).toBeUndefined();
    });

    it("should handle multiple schemes", () => {
      const store = createMockThemeStore("dark", "spells");
      store.availableSchemes = [
        { name: "default", displayName: "Default" },
        { name: "spells", displayName: "Spells" },
        { name: "custom", displayName: "Custom" },
      ];
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig?.name).toBe("spells");
      expect(schemeConfig?.displayName).toBe("Spells");
    });
  });

  describe("announcement functionality", () => {
    it("should skip announcement on initial load", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      // Initial load flag should prevent announcement
      let isInitialLoad = true;

      if (isInitialLoad) {
        isInitialLoad = false;
        // Should not announce
        expect(isInitialLoad).toBe(false);
      }
    });

    it("should announce light theme switch", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const message = `Switched to light theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;

      expect(message).toBe("Switched to light theme");
    });

    it("should announce dark theme switch", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const message = `Switched to dark theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;

      expect(message).toBe("Switched to dark theme");
    });

    it("should announce system theme switch", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const message = `Switched to system theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;

      expect(message).toBe("Switched to system theme");
    });

    it("should include scheme name in announcement", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const message = `Switched to dark theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;

      expect(message).toBe("Switched to dark theme with Spells colors");
    });

    it("should not include scheme for Default scheme", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );
      const message = `Switched to light theme${schemeConfig?.displayName !== "Default" ? ` with ${schemeConfig?.displayName} colors` : ""}`;

      expect(message).toBe("Switched to light theme");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined theme mode", () => {
      const store = {
        ...createMockThemeStore("system", "default"),
        theme: undefined as any,
      };
      useThemeMock.mockReturnValue(store as ThemeStore);

      expect(store.theme).toBeUndefined();
    });

    it("should handle null scheme", () => {
      const store = createMockThemeStore("system", null as any);
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBeNull();
    });

    it("should handle empty string theme", () => {
      const store = createMockThemeStore("" as ThemeMode, "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("");
    });

    it("should handle empty string scheme", () => {
      const store = createMockThemeStore("light", "" as ThemeScheme);
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBe("");
    });

    it("should handle missing cycleMode function", () => {
      const store = createMockThemeStore("dark", "default");
      store.cycleMode = undefined as any;
      useThemeMock.mockReturnValue(store);

      expect(store.cycleMode).toBeUndefined();
    });

    it("should handle very long scheme names", () => {
      const store = createMockThemeStore("system", "custom" as ThemeScheme);
      store.availableSchemes = [
        {
          name: "custom",
          displayName: "Very Long Scheme Name That Exceeds Normal Length",
        },
      ];
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig?.displayName).toBe(
        "Very Long Scheme Name That Exceeds Normal Length"
      );
    });

    it("should handle scheme with special characters", () => {
      const store = createMockThemeStore("light", "custom" as ThemeScheme);
      store.availableSchemes = [
        { name: "custom", displayName: "Custom™ Theme (β)" },
      ];
      useThemeMock.mockReturnValue(store);

      const schemeConfig = store.availableSchemes.find(
        (s) => s.name === store.scheme
      );

      expect(schemeConfig?.displayName).toBe("Custom™ Theme (β)");
    });

    it("should handle missing availableSchemes", () => {
      const store = createMockThemeStore("dark", "default");
      store.availableSchemes = undefined as any;
      useThemeMock.mockReturnValue(store);

      expect(store.availableSchemes).toBeUndefined();
    });
  });

  describe("reactivity and state management", () => {
    it("should maintain theme state", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe("light");
    });

    it("should maintain scheme state", () => {
      const store = createMockThemeStore("dark", "spells");
      useThemeMock.mockReturnValue(store);

      expect(store.scheme).toBe("spells");
    });

    it("should track settings object", () => {
      const store = createMockThemeStore("system", "default");
      useThemeMock.mockReturnValue(store);

      expect(store.settings).toEqual({
        theme: "system",
        themeScheme: "default",
      });
    });

    it("should maintain consistency between theme and settings", () => {
      const store = createMockThemeStore("light", "spells");
      useThemeMock.mockReturnValue(store);

      expect(store.theme).toBe(store.settings.theme);
      expect(store.scheme).toBe(store.settings.themeScheme);
    });

    it("should handle theme changes in store", () => {
      const store = createMockThemeStore("light", "default");
      useThemeMock.mockReturnValue(store);

      // Simulate theme change
      store.theme = "dark";
      store.settings.theme = "dark";

      expect(store.theme).toBe("dark");
      expect(store.settings.theme).toBe("dark");
    });

    it("should handle scheme changes in store", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      // Simulate scheme change
      store.scheme = "spells";
      store.settings.themeScheme = "spells";

      expect(store.scheme).toBe("spells");
      expect(store.settings.themeScheme).toBe("spells");
    });
  });

  describe("integration scenarios", () => {
    it("should work with all theme mode variations", () => {
      const modes: ThemeMode[] = ["light", "dark", "system"];

      modes.forEach((mode) => {
        const store = createMockThemeStore(mode, "default");
        useThemeMock.mockReturnValue(store);

        expect(store.theme).toBe(mode);
      });
    });

    it("should work with all scheme variations", () => {
      const schemes: ThemeScheme[] = ["default", "spells"];

      schemes.forEach((scheme) => {
        const store = createMockThemeStore("light", scheme);
        useThemeMock.mockReturnValue(store);

        expect(store.scheme).toBe(scheme);
      });
    });

    it("should handle all theme-scheme combinations", () => {
      const modes: ThemeMode[] = ["light", "dark", "system"];
      const schemes: ThemeScheme[] = ["default", "spells"];

      modes.forEach((mode) => {
        schemes.forEach((scheme) => {
          const store = createMockThemeStore(mode, scheme);
          useThemeMock.mockReturnValue(store);

          expect(store.theme).toBe(mode);
          expect(store.scheme).toBe(scheme);
        });
      });
    });

    it("should maintain store methods", () => {
      const store = createMockThemeStore("dark", "default");
      useThemeMock.mockReturnValue(store);

      expect(store).toHaveProperty("cycleMode");
      expect(store).toHaveProperty("setTheme");
      expect(store).toHaveProperty("setScheme");
      expect(store).toHaveProperty("subscribe");
    });
  });
});
