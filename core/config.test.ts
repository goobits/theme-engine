/**
 * Tests for Theme Configuration Factory
 */

import { describe, it, expect } from "vitest";
import { createThemeConfig } from "./config";
import type { ThemeConfig } from "./config";
import type { SchemeConfig } from "./types";
import type { RouteThemeConfig } from "../utils/route-themes";

describe("ThemeConfig interface", () => {
  it("should accept minimal configuration with single scheme", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
    };

    expect(config.schemes).toBeDefined();
    expect(config.schemes.default).toBeDefined();
  });

  it("should accept configuration with multiple schemes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
        custom: {
          name: "custom",
          displayName: "Custom",
          description: "Custom theme",
          preview: {
            primary: "#ff0000",
            accent: "#00ff00",
            background: "#0000ff",
          },
        },
      },
    };

    expect(Object.keys(config.schemes)).toHaveLength(2);
    expect(config.schemes.default).toBeDefined();
    expect(config.schemes.custom).toBeDefined();
  });

  it("should accept configuration with optional route themes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/dashboard": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
      },
    };

    expect(config.routeThemes).toBeDefined();
    expect(config.routeThemes?.["/dashboard"]).toBeDefined();
  });

  it("should accept scheme with all optional fields", () => {
    const scheme: SchemeConfig = {
      name: "complete",
      displayName: "Complete",
      description: "Complete scheme with all fields",
      icon: "star",
      title: "Complete Scheme",
      preview: {
        primary: "#3b82f6",
        accent: "#8b5cf6",
        background: "#ffffff",
      },
      cssFile: "/styles/complete.css",
    };

    const config: ThemeConfig = {
      schemes: { complete: scheme },
    };

    expect(config.schemes.complete.icon).toBe("star");
    expect(config.schemes.complete.title).toBe("Complete Scheme");
    expect(config.schemes.complete.cssFile).toBe("/styles/complete.css");
  });

  it("should accept route theme with optional description", () => {
    const routeTheme: RouteThemeConfig = {
      theme: { base: "light", scheme: "default" },
      override: false,
      description: "Special route theme",
    };

    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/special": routeTheme,
      },
    };

    expect(config.routeThemes?.["/special"]?.description).toBe("Special route theme");
  });
});

describe("createThemeConfig", () => {
  it("should return the provided configuration unchanged", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result).toBe(config);
    expect(result).toEqual(config);
  });

  it("should preserve all scheme properties", () => {
    const config: ThemeConfig = {
      schemes: {
        test: {
          name: "test",
          displayName: "Test Scheme",
          description: "Test description",
          icon: "test-icon",
          title: "Test Title",
          preview: {
            primary: "#111111",
            accent: "#222222",
            background: "#333333",
          },
          cssFile: "/test.css",
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.schemes.test.name).toBe("test");
    expect(result.schemes.test.displayName).toBe("Test Scheme");
    expect(result.schemes.test.description).toBe("Test description");
    expect(result.schemes.test.icon).toBe("test-icon");
    expect(result.schemes.test.title).toBe("Test Title");
    expect(result.schemes.test.cssFile).toBe("/test.css");
  });

  it("should preserve preview colors exactly", () => {
    const config: ThemeConfig = {
      schemes: {
        colors: {
          name: "colors",
          displayName: "Colors",
          description: "Color test",
          preview: {
            primary: "#abcdef",
            accent: "#123456",
            background: "#fedcba",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.schemes.colors.preview.primary).toBe("#abcdef");
    expect(result.schemes.colors.preview.accent).toBe("#123456");
    expect(result.schemes.colors.preview.background).toBe("#fedcba");
  });

  it("should handle multiple schemes configuration", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
        dark: {
          name: "dark",
          displayName: "Dark",
          description: "Dark theme",
          preview: {
            primary: "#1e40af",
            accent: "#6d28d9",
            background: "#1f2937",
          },
        },
        spells: {
          name: "spells",
          displayName: "Spells",
          description: "Magic theme",
          preview: {
            primary: "#7c3aed",
            accent: "#db2777",
            background: "#0f172a",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(Object.keys(result.schemes)).toHaveLength(3);
    expect(result.schemes.default).toBeDefined();
    expect(result.schemes.dark).toBeDefined();
    expect(result.schemes.spells).toBeDefined();
  });

  it("should preserve route themes configuration", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/dashboard": {
          theme: { base: "dark", scheme: "default" },
          override: true,
          description: "Dashboard uses dark theme",
        },
        "/admin/*": {
          theme: { base: "light", scheme: "default" },
          override: false,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes).toBeDefined();
    expect(Object.keys(result.routeThemes!)).toHaveLength(2);
    expect(result.routeThemes!["/dashboard"].override).toBe(true);
    expect(result.routeThemes!["/admin/*"].override).toBe(false);
  });

  it("should handle configuration without route themes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes).toBeUndefined();
  });

  it("should preserve route theme properties", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/special": {
          theme: { base: "system", scheme: "default" },
          override: true,
          description: "Special route",
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/special"].theme.base).toBe("system");
    expect(result.routeThemes!["/special"].theme.scheme).toBe("default");
    expect(result.routeThemes!["/special"].override).toBe(true);
    expect(result.routeThemes!["/special"].description).toBe("Special route");
  });

  it("should handle empty route themes object", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {},
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes).toBeDefined();
    expect(Object.keys(result.routeThemes!)).toHaveLength(0);
  });

  it("should support all valid theme modes in route themes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/light": {
          theme: { base: "light", scheme: "default" },
          override: true,
        },
        "/dark": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
        "/system": {
          theme: { base: "system", scheme: "default" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/light"].theme.base).toBe("light");
    expect(result.routeThemes!["/dark"].theme.base).toBe("dark");
    expect(result.routeThemes!["/system"].theme.base).toBe("system");
  });

  it("should maintain object reference integrity", () => {
    const scheme: SchemeConfig = {
      name: "test",
      displayName: "Test",
      description: "Test scheme",
      preview: {
        primary: "#111111",
        accent: "#222222",
        background: "#333333",
      },
    };

    const config: ThemeConfig = {
      schemes: { test: scheme },
    };

    const result = createThemeConfig(config);

    expect(result.schemes.test).toBe(scheme);
  });

  it("should support complex route patterns", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/api/*": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
        "/admin/*/settings": {
          theme: { base: "light", scheme: "default" },
          override: false,
        },
        "/docs/**": {
          theme: { base: "system", scheme: "default" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/api/*"]).toBeDefined();
    expect(result.routeThemes!["/admin/*/settings"]).toBeDefined();
    expect(result.routeThemes!["/docs/**"]).toBeDefined();
  });

  it("should handle schemes with different color schemes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
        spells: {
          name: "spells",
          displayName: "Spells",
          description: "Magical theme",
          preview: {
            primary: "#7c3aed",
            accent: "#db2777",
            background: "#0f172a",
          },
        },
      },
      routeThemes: {
        "/magic": {
          theme: { base: "dark", scheme: "spells" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/magic"].theme.scheme).toBe("spells");
    expect(result.schemes.spells.name).toBe("spells");
  });
});

describe("createThemeConfig - edge cases", () => {
  it("should handle scheme with minimal required fields only", () => {
    const config: ThemeConfig = {
      schemes: {
        minimal: {
          name: "minimal",
          displayName: "Minimal",
          description: "Minimal scheme",
          preview: {
            primary: "#000000",
            accent: "#111111",
            background: "#ffffff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.schemes.minimal.icon).toBeUndefined();
    expect(result.schemes.minimal.title).toBeUndefined();
    expect(result.schemes.minimal.cssFile).toBeUndefined();
  });

  it("should handle route theme without description", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/test": {
          theme: { base: "light", scheme: "default" },
          override: false,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/test"].description).toBeUndefined();
  });

  it("should preserve scheme names that match their keys", () => {
    const config: ThemeConfig = {
      schemes: {
        custom: {
          name: "custom",
          displayName: "Custom",
          description: "Custom scheme",
          preview: {
            primary: "#ff0000",
            accent: "#00ff00",
            background: "#0000ff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.schemes.custom.name).toBe("custom");
  });

  it("should handle single scheme configuration", () => {
    const config: ThemeConfig = {
      schemes: {
        only: {
          name: "only",
          displayName: "Only",
          description: "Only scheme",
          preview: {
            primary: "#123456",
            accent: "#654321",
            background: "#abcdef",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(Object.keys(result.schemes)).toHaveLength(1);
    expect(result.schemes.only).toBeDefined();
  });

  it("should handle configuration with many schemes", () => {
    const schemes: Record<string, SchemeConfig> = {};

    for (let i = 0; i < 10; i++) {
      schemes[`scheme${i}`] = {
        name: `scheme${i}`,
        displayName: `Scheme ${i}`,
        description: `Description ${i}`,
        preview: {
          primary: `#${i}${i}${i}${i}${i}${i}`,
          accent: `#${i}${i}${i}${i}${i}${i}`,
          background: `#${i}${i}${i}${i}${i}${i}`,
        },
      };
    }

    const config: ThemeConfig = { schemes };
    const result = createThemeConfig(config);

    expect(Object.keys(result.schemes)).toHaveLength(10);
  });

  it("should preserve special characters in scheme names", () => {
    const config: ThemeConfig = {
      schemes: {
        "my-scheme": {
          name: "my-scheme",
          displayName: "My Scheme",
          description: "Scheme with dash",
          preview: {
            primary: "#111111",
            accent: "#222222",
            background: "#333333",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.schemes["my-scheme"]).toBeDefined();
    expect(result.schemes["my-scheme"].name).toBe("my-scheme");
  });

  it("should preserve special characters in route patterns", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/api/v1/users/*": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/api/v1/users/*"]).toBeDefined();
  });

  it("should handle override flag values correctly", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default theme",
          preview: {
            primary: "#3b82f6",
            accent: "#8b5cf6",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/override-true": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
        "/override-false": {
          theme: { base: "light", scheme: "default" },
          override: false,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result.routeThemes!["/override-true"].override).toBe(true);
    expect(result.routeThemes!["/override-false"].override).toBe(false);
  });
});

describe("createThemeConfig - type safety", () => {
  it("should accept valid ThemeConfig type", () => {
    const config: ThemeConfig = {
      schemes: {
        test: {
          name: "test",
          displayName: "Test",
          description: "Test",
          preview: {
            primary: "#000000",
            accent: "#111111",
            background: "#ffffff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    // Type check - result should be ThemeConfig
    const typed: ThemeConfig = result;
    expect(typed).toBeDefined();
  });

  it("should maintain type information for schemes", () => {
    const config: ThemeConfig = {
      schemes: {
        typed: {
          name: "typed",
          displayName: "Typed",
          description: "Type test",
          preview: {
            primary: "#000000",
            accent: "#111111",
            background: "#ffffff",
          },
        },
      },
    };

    const result = createThemeConfig(config);

    // Access should be type-safe
    const scheme: SchemeConfig = result.schemes.typed;
    expect(scheme.name).toBe("typed");
  });

  it("should maintain type information for route themes", () => {
    const config: ThemeConfig = {
      schemes: {
        default: {
          name: "default",
          displayName: "Default",
          description: "Default",
          preview: {
            primary: "#000000",
            accent: "#111111",
            background: "#ffffff",
          },
        },
      },
      routeThemes: {
        "/test": {
          theme: { base: "light", scheme: "default" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    // Access should be type-safe
    if (result.routeThemes) {
      const routeTheme: RouteThemeConfig = result.routeThemes["/test"];
      expect(routeTheme.override).toBe(true);
    }
  });
});
