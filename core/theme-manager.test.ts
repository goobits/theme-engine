/**
 * Tests for Theme Manager System
 *
 * Comprehensive tests covering theme initialization, system theme watching,
 * route-based theming, and critical memory leak prevention.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initializeTheme,
  watchSystemTheme,
  applyThemeWithScheme,
  applyRouteTheme,
} from "./theme-manager";
import type { FullTheme } from "./types";
import type { RouteThemeConfig } from "../utils/route-themes";

// Mock the $app/environment module
vi.mock("$app/environment", () => ({
  browser: false,
}));

// Mock the logger utility
vi.mock("../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the scheme-registry module
vi.mock("./scheme-registry", () => ({
  applyFullTheme: vi.fn(),
  applyThemeScheme: vi.fn(),
  getCurrentScheme: vi.fn(() => "default"),
}));

// Mock the route-themes module
vi.mock("../utils/route-themes", () => ({
  getRouteTheme: vi.fn(),
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
  const module = await import("$app/environment");
  vi.mocked(module).browser = isBrowser;
}

// Helper to create a mock HTML element with classList
function createMockHtmlElement() {
  const classes = new Set<string>();
  return {
    tagName: "HTML",
    classList: {
      add: vi.fn((...tokens: string[]) => {
        tokens.forEach((token) => classes.add(token));
      }),
      remove: vi.fn((...tokens: string[]) => {
        tokens.forEach((token) => classes.delete(token));
      }),
      contains: vi.fn((token: string) => classes.has(token)),
      toggle: vi.fn(),
      replace: vi.fn(),
      _getClasses: () => Array.from(classes),
      _clear: () => classes.clear(),
    },
  };
}

// Helper to mock window.matchMedia with event listener support
function mockMatchMedia(
  matches: boolean,
  useModernAPI: boolean = true,
  useLegacyAPI: boolean = false
) {
  const listeners: Array<(e: any) => void> = [];
  const mockMediaQuery: any = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    dispatchEvent: vi.fn(),
  };

  if (useModernAPI) {
    mockMediaQuery.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === "change") {
        listeners.push(handler);
      }
    });
    mockMediaQuery.removeEventListener = vi.fn((_event: string, handler: any) => {
      const index = listeners.indexOf(handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    });
  }

  if (useLegacyAPI) {
    mockMediaQuery.addListener = vi.fn((handler: any) => {
      listeners.push(handler);
    });
    mockMediaQuery.removeListener = vi.fn((handler: any) => {
      const index = listeners.indexOf(handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    });
  }

  // Helper to trigger change event
  mockMediaQuery._triggerChange = (newMatches: boolean) => {
    mockMediaQuery.matches = newMatches;
    listeners.forEach((listener) => {
      listener({ matches: newMatches });
    });
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mockMediaQuery),
  });

  return mockMediaQuery;
}

describe("applyThemeWithScheme", () => {
  beforeEach(async () => {
    await setBrowserMode(true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["light", "default"],
    ["dark", "spells"],
    ["system", "default"],
    ["system", "spells"],
  ] as const)("should apply %s theme with %s scheme", async (theme, scheme) => {
    const { applyFullTheme } = await import("./scheme-registry");

    applyThemeWithScheme(theme, scheme);

    expect(applyFullTheme).toHaveBeenCalledWith({
      base: theme,
      scheme: scheme,
    });
  });

  it("should create correct FullTheme structure", async () => {
    const { applyFullTheme } = await import("./scheme-registry");

    applyThemeWithScheme("light", "default");

    const callArg = vi.mocked(applyFullTheme).mock.calls[0][0];
    expect(callArg).toHaveProperty("base");
    expect(callArg).toHaveProperty("scheme");
    expect(callArg.base).toBe("light");
    expect(callArg.scheme).toBe("default");
  });
});

describe("watchSystemTheme", () => {
  let mockHtml: ReturnType<typeof createMockHtmlElement>;

  beforeEach(async () => {
    await setBrowserMode(true);
    mockHtml = createMockHtmlElement();
    vi.stubGlobal("document", {
      documentElement: mockHtml,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("server-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(false);
    });

    it("should return no-op cleanup function when not in browser", () => {
      const callback = vi.fn();
      const cleanup = watchSystemTheme(callback);

      expect(cleanup).toBeInstanceOf(Function);
      cleanup();
      expect(callback).not.toHaveBeenCalled();
    });

    it("should not access window when not in browser", () => {
      const callback = vi.fn();
      vi.stubGlobal("window", undefined);

      const cleanup = watchSystemTheme(callback);
      expect(cleanup).toBeInstanceOf(Function);
    });
  });

  describe("modern addEventListener API", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should use addEventListener when available", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should call callback with 'dark' when system prefers dark", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      // Trigger change to dark mode
      mediaQuery._triggerChange(true);

      expect(callback).toHaveBeenCalledWith("dark");
    });

    it("should call callback with 'light' when system prefers light", () => {
      const mediaQuery = mockMatchMedia(true, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      // Trigger change to light mode
      mediaQuery._triggerChange(false);

      expect(callback).toHaveBeenCalledWith("light");
    });

    it("should update system theme classes when theme-system is active", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      mockHtml.classList.contains = vi.fn((token: string) => token === "theme-system");
      const callback = vi.fn();

      watchSystemTheme(callback);

      // Trigger change to dark mode
      mediaQuery._triggerChange(true);

      expect(mockHtml.classList.remove).toHaveBeenCalledWith(
        "theme-system-light",
        "theme-system-dark"
      );
      expect(mockHtml.classList.add).toHaveBeenCalledWith("theme-system-dark");
    });

    it("should not update system theme classes when theme-system is not active", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      mockHtml.classList.contains = vi.fn(() => false);
      const callback = vi.fn();

      watchSystemTheme(callback);
      vi.clearAllMocks();

      // Trigger change
      mediaQuery._triggerChange(true);

      // Callback should still be called
      expect(callback).toHaveBeenCalledWith("dark");
      // But classList should not be modified
      expect(mockHtml.classList.add).not.toHaveBeenCalled();
    });

    it("should remove event listener on cleanup", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);
      cleanup();

      expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should not trigger callback after cleanup", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);
      cleanup();

      vi.clearAllMocks();
      mediaQuery._triggerChange(true);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("legacy addListener API", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should use addListener when addEventListener is not available", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      const callback = vi.fn();

      watchSystemTheme(callback);

      expect(mediaQuery.addListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should call callback with correct theme using legacy API", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      const callback = vi.fn();

      watchSystemTheme(callback);

      // Trigger change to dark mode
      mediaQuery._triggerChange(true);

      expect(callback).toHaveBeenCalledWith("dark");
    });

    it("should remove listener on cleanup with legacy API", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);
      cleanup();

      expect(mediaQuery.removeListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should not trigger callback after cleanup with legacy API", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);
      cleanup();

      vi.clearAllMocks();
      mediaQuery._triggerChange(true);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("edge cases and missing APIs", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should return no-op cleanup when no API is available", () => {
      mockMatchMedia(false, false, false);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      expect(cleanup).toBeInstanceOf(Function);
      cleanup(); // Should not throw
    });

    it("should handle MediaQueryListEvent with matches property", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      const event = { matches: true };
      const handler = vi.mocked(mediaQuery.addEventListener).mock.calls[0][1];
      handler(event);

      expect(callback).toHaveBeenCalledWith("dark");
    });

    it("should handle MediaQueryList with matches property", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      const mediaQueryList = { matches: false };
      const handler = vi.mocked(mediaQuery.addEventListener).mock.calls[0][1];
      handler(mediaQueryList);

      expect(callback).toHaveBeenCalledWith("light");
    });

    it("should handle rapid theme changes", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      watchSystemTheme(callback);

      // Rapid changes
      mediaQuery._triggerChange(true);
      mediaQuery._triggerChange(false);
      mediaQuery._triggerChange(true);
      mediaQuery._triggerChange(false);

      expect(callback).toHaveBeenCalledTimes(4);
      expect(callback).toHaveBeenNthCalledWith(1, "dark");
      expect(callback).toHaveBeenNthCalledWith(2, "light");
      expect(callback).toHaveBeenNthCalledWith(3, "dark");
      expect(callback).toHaveBeenNthCalledWith(4, "light");
    });

    it("should handle cleanup being called multiple times", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      // Call cleanup multiple times - should not throw
      cleanup();
      cleanup();
      cleanup();

      expect(mediaQuery.removeEventListener).toHaveBeenCalled();
    });

    it("should handle missing removeEventListener gracefully", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      delete mediaQuery.removeEventListener;
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      // Should not throw even if removeEventListener is missing
      expect(() => cleanup()).not.toThrow();
    });

    it("should handle missing removeListener gracefully in legacy API", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      delete mediaQuery.removeListener;
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      // Should not throw even if removeListener is missing
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe("memory leak prevention", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should properly cleanup event listeners to prevent memory leaks", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      // Verify listener was added
      expect(mediaQuery.addEventListener).toHaveBeenCalled();

      // Cleanup
      cleanup();

      // Verify listener was removed
      expect(mediaQuery.removeEventListener).toHaveBeenCalled();

      // Verify same handler function
      const addedHandler = vi.mocked(mediaQuery.addEventListener).mock.calls[0][1];
      const removedHandler = vi.mocked(mediaQuery.removeEventListener).mock.calls[0][1];
      expect(addedHandler).toBe(removedHandler);
    });

    it("should cleanup legacy listeners to prevent memory leaks", () => {
      const mediaQuery = mockMatchMedia(false, false, true);
      const callback = vi.fn();

      const cleanup = watchSystemTheme(callback);

      // Verify listener was added
      expect(mediaQuery.addListener).toHaveBeenCalled();

      // Cleanup
      cleanup();

      // Verify listener was removed
      expect(mediaQuery.removeListener).toHaveBeenCalled();

      // Verify same handler function
      const addedHandler = vi.mocked(mediaQuery.addListener).mock.calls[0][0];
      const removedHandler = vi.mocked(mediaQuery.removeListener).mock.calls[0][0];
      expect(addedHandler).toBe(removedHandler);
    });
  });
});

describe("initializeTheme", () => {
  let mockHtml: ReturnType<typeof createMockHtmlElement>;

  beforeEach(async () => {
    await setBrowserMode(true);
    mockHtml = createMockHtmlElement();
    vi.stubGlobal("document", {
      documentElement: mockHtml,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("server-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(false);
    });

    it("should return no-op cleanup when not in browser", () => {
      const cleanup = initializeTheme("light", "default");

      expect(cleanup).toBeInstanceOf(Function);
      cleanup(); // Should not throw
    });

    it("should not apply theme when not in browser", async () => {
      const { applyFullTheme } = await import("./scheme-registry");

      initializeTheme("light", "default");

      expect(applyFullTheme).not.toHaveBeenCalled();
    });
  });

  describe("client-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should apply stored theme immediately", async () => {
      const { applyFullTheme } = await import("./scheme-registry");
      mockMatchMedia(false, true, false);

      initializeTheme("light", "default");

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "light",
        scheme: "default",
      });
    });

    it("should apply dark theme with spells scheme", async () => {
      const { applyFullTheme } = await import("./scheme-registry");
      mockMatchMedia(true, true, false);

      initializeTheme("dark", "spells");

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "dark",
        scheme: "spells",
      });
    });

    it("should use default scheme when not provided", async () => {
      const { applyFullTheme } = await import("./scheme-registry");
      mockMatchMedia(false, true, false);

      initializeTheme("light");

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "light",
        scheme: "default",
      });
    });

    it("should set up system theme watching", () => {
      const mediaQuery = mockMatchMedia(false, true, false);

      initializeTheme("system", "default");

      expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should return cleanup function that removes listeners", () => {
      const mediaQuery = mockMatchMedia(false, true, false);

      const cleanup = initializeTheme("system", "default");
      cleanup();

      expect(mediaQuery.removeEventListener).toHaveBeenCalled();
    });

    it("should update system theme classes when system mode changes", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      mockHtml.classList.contains = vi.fn((token: string) => token === "theme-system");

      initializeTheme("system", "default");

      // Trigger system theme change
      mediaQuery._triggerChange(true);

      expect(mockHtml.classList.remove).toHaveBeenCalledWith(
        "theme-system-light",
        "theme-system-dark"
      );
      expect(mockHtml.classList.add).toHaveBeenCalledWith("theme-system-dark");
    });

    it("should not update classes when non-system theme is active", () => {
      const mediaQuery = mockMatchMedia(false, true, false);
      mockHtml.classList.contains = vi.fn(() => false);

      initializeTheme("light", "default");
      vi.clearAllMocks();

      // Trigger system theme change
      mediaQuery._triggerChange(true);

      // Classes should not be updated because theme-system is not active
      expect(mockHtml.classList.add).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should handle missing window gracefully", () => {
      vi.stubGlobal("window", undefined);

      const cleanup = initializeTheme("light", "default");

      expect(cleanup).toBeInstanceOf(Function);
    });

    it("should handle missing document gracefully", () => {
      vi.stubGlobal("document", undefined);

      const cleanup = initializeTheme("light", "default");

      expect(cleanup).toBeInstanceOf(Function);
    });

    it("should handle cleanup being called multiple times", () => {
      mockMatchMedia(false, true, false);

      const cleanup = initializeTheme("system", "default");

      // Call cleanup multiple times - should not throw
      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();
    });
  });
});

describe("applyRouteTheme", () => {
  let mockHtml: ReturnType<typeof createMockHtmlElement>;

  beforeEach(async () => {
    await setBrowserMode(true);
    mockHtml = createMockHtmlElement();
    vi.stubGlobal("document", {
      documentElement: mockHtml,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("no route configuration", () => {
    it("should use user preferences when no route theme exists", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");
      vi.mocked(getRouteTheme).mockReturnValue(null);

      const result = applyRouteTheme("/home", "light", "default", {});

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "light",
        scheme: "default",
      });
      expect(result).toEqual({
        base: "light",
        scheme: "default",
      });
    });

    it("should use user dark theme with spells scheme", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");
      vi.mocked(getRouteTheme).mockReturnValue(null);

      const result = applyRouteTheme("/about", "dark", "spells", {});

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "dark",
        scheme: "spells",
      });
      expect(result).toEqual({
        base: "dark",
        scheme: "spells",
      });
    });

    it("should log debug message when no route theme found", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { logger } = await import("../utils/logger");
      vi.mocked(getRouteTheme).mockReturnValue(null);

      applyRouteTheme("/home", "light", "default", {});

      expect(logger.debug).toHaveBeenCalledWith(
        "No route theme found, using user preferences",
        { pathname: "/home" }
      );
    });
  });

  describe("route configuration with override", () => {
    it("should override user preferences when route has override", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: true,
        description: "Special route",
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      const result = applyRouteTheme("/special", "light", "default", {});

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "dark",
        scheme: "spells",
      });
      expect(result).toEqual({
        base: "dark",
        scheme: "spells",
      });
    });

    it("should ignore user theme when route overrides", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "light", scheme: "default" },
        override: true,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      const result = applyRouteTheme("/override", "dark", "spells", {});

      // Should use route theme, not user theme
      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "light",
        scheme: "default",
      });
      expect(result.base).toBe("light");
      expect(result.scheme).toBe("default");
    });

    it("should log info message when applying override", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { logger } = await import("../utils/logger");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: true,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      applyRouteTheme("/special", "light", "default", {});

      expect(logger.info).toHaveBeenCalledWith(
        "Applying route theme override",
        expect.objectContaining({
          pathname: "/special",
          routeTheme: { base: "dark", scheme: "spells" },
        })
      );
    });
  });

  describe("route configuration without override", () => {
    it("should respect user base theme but use route scheme", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: false,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      const result = applyRouteTheme("/suggested", "light", "default", {});

      // Should use user base theme but route scheme
      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "light",
        scheme: "spells",
      });
      expect(result).toEqual({
        base: "light",
        scheme: "spells",
      });
    });

    it("should preserve user system theme with route scheme", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { applyFullTheme } = await import("./scheme-registry");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "light", scheme: "spells" },
        override: false,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      const result = applyRouteTheme("/suggested", "system", "default", {});

      expect(applyFullTheme).toHaveBeenCalledWith({
        base: "system",
        scheme: "spells",
      });
      expect(result.base).toBe("system");
      expect(result.scheme).toBe("spells");
    });

    it("should log info message when applying suggestion", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { logger } = await import("../utils/logger");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: false,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      applyRouteTheme("/suggested", "light", "default", {});

      expect(logger.info).toHaveBeenCalledWith(
        "Applying route theme suggestion",
        expect.objectContaining({
          pathname: "/suggested",
          suggestedTheme: { base: "light", scheme: "spells" },
        })
      );
    });
  });

  describe("logging behavior", () => {
    it("should log route theme check with all details", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { logger } = await import("../utils/logger");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: true,
        description: "Test route",
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      applyRouteTheme("/test", "light", "default", {});

      expect(logger.info).toHaveBeenCalledWith(
        "Route theme check",
        expect.objectContaining({
          pathname: "/test",
          routeConfig: {
            theme: { base: "dark", scheme: "spells" },
            override: true,
            description: "Test route",
          },
          userTheme: "light",
          userScheme: "default",
        })
      );
    });

    it("should log null routeConfig when no route matches", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      const { logger } = await import("../utils/logger");
      vi.mocked(getRouteTheme).mockReturnValue(null);

      applyRouteTheme("/home", "light", "default", {});

      expect(logger.info).toHaveBeenCalledWith(
        "Route theme check",
        expect.objectContaining({
          pathname: "/home",
          routeConfig: null,
          userTheme: "light",
          userScheme: "default",
        })
      );
    });
  });

  describe("return value verification", () => {
    it("should return applied theme for all scenarios", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");
      vi.mocked(getRouteTheme).mockReturnValue(null);

      const result = applyRouteTheme("/test", "dark", "spells", {});

      expect(result).toEqual({
        base: "dark",
        scheme: "spells",
      });
      expect(result).toHaveProperty("base");
      expect(result).toHaveProperty("scheme");
    });

    it("should return FullTheme type structure", async () => {
      const { getRouteTheme } = await import("../utils/route-themes");

      const routeConfig: RouteThemeConfig = {
        theme: { base: "dark", scheme: "spells" },
        override: true,
      };
      vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

      const result = applyRouteTheme("/test", "light", "default", {});

      // Verify it matches FullTheme interface
      const fullTheme: FullTheme = result;
      expect(fullTheme.base).toBeDefined();
      expect(fullTheme.scheme).toBeDefined();
    });
  });
});

describe("integration scenarios", () => {
  let mockHtml: ReturnType<typeof createMockHtmlElement>;

  beforeEach(async () => {
    await setBrowserMode(true);
    mockHtml = createMockHtmlElement();
    vi.stubGlobal("document", {
      documentElement: mockHtml,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize theme and watch for system changes", async () => {
    const { applyFullTheme } = await import("./scheme-registry");
    const mediaQuery = mockMatchMedia(false, true, false);
    mockHtml.classList.contains = vi.fn((token: string) => token === "theme-system");

    const cleanup = initializeTheme("system", "default");

    // Verify initial theme applied
    expect(applyFullTheme).toHaveBeenCalledWith({
      base: "system",
      scheme: "default",
    });

    // Trigger system change
    mediaQuery._triggerChange(true);

    // Verify system theme classes updated
    expect(mockHtml.classList.add).toHaveBeenCalledWith("theme-system-dark");

    cleanup();
  });

  it("should handle complete lifecycle: init, change, cleanup", () => {
    const mediaQuery = mockMatchMedia(false, true, false);
    mockHtml.classList.contains = vi.fn((token: string) => token === "theme-system");

    // Initialize
    const cleanup = initializeTheme("system", "default");
    expect(mediaQuery.addEventListener).toHaveBeenCalled();

    // Change system preference
    mediaQuery._triggerChange(true);
    expect(mockHtml.classList.add).toHaveBeenCalledWith("theme-system-dark");

    // Cleanup
    cleanup();
    expect(mediaQuery.removeEventListener).toHaveBeenCalled();

    // Verify no more updates after cleanup
    vi.clearAllMocks();
    mediaQuery._triggerChange(false);
    expect(mockHtml.classList.add).not.toHaveBeenCalled();
  });

  it("should handle route theme changes with system watching", async () => {
    const { getRouteTheme } = await import("../utils/route-themes");
    const { applyFullTheme } = await import("./scheme-registry");
    mockMatchMedia(false, true, false);

    // Initialize with system theme
    const cleanup = initializeTheme("system", "default");

    // Apply route theme
    const routeConfig: RouteThemeConfig = {
      theme: { base: "dark", scheme: "spells" },
      override: true,
    };
    vi.mocked(getRouteTheme).mockReturnValue(routeConfig);

    applyRouteTheme("/special", "system", "default", {});

    // Should apply route theme
    expect(applyFullTheme).toHaveBeenLastCalledWith({
      base: "dark",
      scheme: "spells",
    });

    cleanup();
  });
});
