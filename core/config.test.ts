/**
 * Tests for Theme Configuration Factory
 *
 * NOTE: This test suite is intentionally minimal because createThemeConfig is an
 * identity function that simply returns its input unchanged. Testing beyond basic
 * behavior verification would be testing TypeScript's type system rather than
 * runtime behavior.
 */

import { describe, it, expect } from "vitest";
import { createThemeConfig } from "./config";
import type { ThemeConfig } from "./config";

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
      routeThemes: {
        "/dashboard": {
          theme: { base: "dark", scheme: "default" },
          override: true,
        },
      },
    };

    const result = createThemeConfig(config);

    expect(result).toBe(config);
    expect(result).toEqual(config);
  });

  it("should be a pure function that does not mutate the input", () => {
    const config: ThemeConfig = {
      schemes: {
        test: {
          name: "test",
          displayName: "Test",
          description: "Test description",
          preview: {
            primary: "#111111",
            accent: "#222222",
            background: "#333333",
          },
        },
      },
    };

    const originalConfig = JSON.parse(JSON.stringify(config));
    const result = createThemeConfig(config);

    // Verify input was not mutated
    expect(config).toEqual(originalConfig);
    // Verify result is the same object reference (identity function)
    expect(result).toBe(config);
  });
});
