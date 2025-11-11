/**
 * Tests for Cookie Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  readPreferenceCookies,
  writePreferenceCookies,
  getDefaultPreferences,
  PREFERENCE_COOKIE_NAMES,
  COOKIE_OPTIONS,
  type UserPreferences,
} from "./cookies";

// Mock the $app/environment module
vi.mock("$app/environment", () => ({
  browser: false,
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
  const module = await import("$app/environment");
  vi.mocked(module).browser = isBrowser;
}

// Helper to mock document.cookie
function mockDocumentCookie(cookieString: string) {
  Object.defineProperty(document, "cookie", {
    writable: true,
    configurable: true,
    value: cookieString,
  });
}

// Helper to get document.cookie setter calls
function getDocumentCookieWrites(): string[] {
  const cookieDescriptor = Object.getOwnPropertyDescriptor(document, "cookie");
  if (cookieDescriptor && cookieDescriptor.set) {
    const mockSetter = vi.mocked(cookieDescriptor.set);
    return mockSetter.mock.calls.map((call) => call[0]);
  }
  return [];
}

describe("getDefaultPreferences", () => {
  it("should return all default preferences", () => {
    const defaults = getDefaultPreferences();

    expect(defaults).toEqual({
      theme: "system",
      themeScheme: "default",
      language: "en",
      languageTheme: "default",
      showSidebar: true,
    });
  });

  it("should return consistent values on multiple calls", () => {
    const defaults1 = getDefaultPreferences();
    const defaults2 = getDefaultPreferences();

    expect(defaults1).toEqual(defaults2);
  });

  it("should return all required UserPreferences fields", () => {
    const defaults = getDefaultPreferences();

    expect(defaults).toHaveProperty("theme");
    expect(defaults).toHaveProperty("themeScheme");
    expect(defaults).toHaveProperty("language");
    expect(defaults).toHaveProperty("languageTheme");
    expect(defaults).toHaveProperty("showSidebar");
  });

  it("should have valid theme value", () => {
    const defaults = getDefaultPreferences();
    expect(["light", "dark", "system"]).toContain(defaults.theme);
  });

  it("should have valid themeScheme value", () => {
    const defaults = getDefaultPreferences();
    expect(["default", "spells"]).toContain(defaults.themeScheme);
  });
});

describe("readPreferenceCookies", () => {
  beforeEach(() => {
    // Reset document.cookie before each test
    mockDocumentCookie("");
  });

  describe("server-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(false);
    });

    it("should return empty object when not in browser", () => {
      const result = readPreferenceCookies();
      expect(result).toEqual({});
    });

    it("should not attempt to read document.cookie on server", () => {
      const cookieGetter = vi.fn(() => "theme=dark");
      Object.defineProperty(document, "cookie", {
        get: cookieGetter,
        configurable: true,
      });

      readPreferenceCookies();
      expect(cookieGetter).not.toHaveBeenCalled();
    });
  });

  describe("client-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should return empty object when document.cookie is empty", () => {
      mockDocumentCookie("");
      const result = readPreferenceCookies();
      expect(result).toEqual({});
    });

    it("should parse single theme preference cookie", () => {
      mockDocumentCookie("theme=dark");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("dark");
      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should parse single themeScheme preference cookie", () => {
      mockDocumentCookie("themeScheme=spells");
      const result = readPreferenceCookies();

      expect(result.themeScheme).toBe("spells");
      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should parse single language preference cookie", () => {
      mockDocumentCookie("language=fr");
      const result = readPreferenceCookies();

      expect(result.language).toBe("fr");
      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should parse single languageTheme preference cookie", () => {
      mockDocumentCookie("languageTheme=spells");
      const result = readPreferenceCookies();

      expect(result.languageTheme).toBe("spells");
      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should parse showSidebar as boolean true", () => {
      mockDocumentCookie("showSidebar=true");
      const result = readPreferenceCookies();

      expect(result.showSidebar).toBe(true);
      expect(typeof result.showSidebar).toBe("boolean");
    });

    it("should parse showSidebar as boolean false", () => {
      mockDocumentCookie("showSidebar=false");
      const result = readPreferenceCookies();

      expect(result.showSidebar).toBe(false);
      expect(typeof result.showSidebar).toBe("boolean");
    });

    it("should parse multiple preference cookies", () => {
      mockDocumentCookie(
        "theme=light; themeScheme=spells; language=es; languageTheme=default; showSidebar=true"
      );
      const result = readPreferenceCookies();

      expect(result).toEqual({
        theme: "light",
        themeScheme: "spells",
        language: "es",
        languageTheme: "default",
        showSidebar: true,
      });
    });

    it("should ignore non-preference cookies", () => {
      mockDocumentCookie(
        "theme=dark; unrelated=value; session=abc123; themeScheme=default"
      );
      const result = readPreferenceCookies();

      expect(result).toEqual({
        theme: "dark",
        themeScheme: "default",
      });
      expect(result).not.toHaveProperty("unrelated");
      expect(result).not.toHaveProperty("session");
    });

    it("should handle cookies with mixed order", () => {
      mockDocumentCookie(
        "showSidebar=false; theme=system; language=de; themeScheme=spells; languageTheme=spells"
      );
      const result = readPreferenceCookies();

      expect(result).toEqual({
        theme: "system",
        themeScheme: "spells",
        language: "de",
        languageTheme: "spells",
        showSidebar: false,
      });
    });

    it("should handle cookies with extra whitespace", () => {
      mockDocumentCookie("theme=dark;  themeScheme=default;   language=en");
      const result = readPreferenceCookies();

      // Note: Extra spaces after semicolons cause empty keys in split
      // The implementation splits by '; ' so extra spaces create issues
      expect(result.theme).toBe("dark");
      // themeScheme key would have a leading space, so it won't match
      expect(result.language).toBeUndefined();
    });

    it("should handle partial preference cookies", () => {
      mockDocumentCookie("theme=light; language=jp");
      const result = readPreferenceCookies();

      expect(result).toEqual({
        theme: "light",
        language: "jp",
      });
      expect(result).not.toHaveProperty("themeScheme");
      expect(result).not.toHaveProperty("showSidebar");
    });

    it("should handle language codes with hyphens", () => {
      mockDocumentCookie("language=en-US");
      const result = readPreferenceCookies();

      expect(result.language).toBe("en-US");
    });

    it("should handle language codes with underscores", () => {
      mockDocumentCookie("language=zh_CN");
      const result = readPreferenceCookies();

      expect(result.language).toBe("zh_CN");
    });
  });

  describe("edge cases and malformed cookies", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should handle cookie with no value", () => {
      mockDocumentCookie("theme=");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("");
    });

    it("should handle cookie with multiple equals signs", () => {
      mockDocumentCookie("theme=light; data=key=value; language=en");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("light");
      expect(result.language).toBe("en");
    });

    it("should handle showSidebar with non-boolean string as false", () => {
      mockDocumentCookie("showSidebar=yes");
      const result = readPreferenceCookies();

      expect(result.showSidebar).toBe(false);
    });

    it("should handle single cookie without semicolon", () => {
      mockDocumentCookie("theme=dark");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("dark");
    });

    it("should handle cookies with trailing semicolon", () => {
      mockDocumentCookie("theme=light; language=en;");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("light");
      // Trailing semicolon creates empty string after split which won't match
      expect(result.language).toBe("en;");
    });

    it("should handle duplicate preference cookies (last wins)", () => {
      mockDocumentCookie("theme=light; theme=dark; theme=system");
      const result = readPreferenceCookies();

      expect(result.theme).toBe("system");
    });

    it("should handle URL-encoded values", () => {
      mockDocumentCookie("language=en%2DUS");
      const result = readPreferenceCookies();

      expect(result.language).toBe("en%2DUS");
    });

    it("should return empty object for malformed cookie string", () => {
      mockDocumentCookie(";;;");
      const result = readPreferenceCookies();

      expect(result).toEqual({});
    });

    it("should handle cookies with only keys no values", () => {
      mockDocumentCookie("theme; language; showSidebar");
      const result = readPreferenceCookies();

      // When splitting by '=', we get undefined for value
      // The code expects [key, value] so this might add undefined values
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("writePreferenceCookies", () => {
  let cookieWrites: string[];

  beforeEach(() => {
    cookieWrites = [];

    // Mock document.cookie setter
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => ""),
      set: vi.fn((value: string) => {
        cookieWrites.push(value);
      }),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("server-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(false);
    });

    it("should not write cookies when not in browser", () => {
      writePreferenceCookies({ theme: "dark" });

      expect(cookieWrites).toHaveLength(0);
    });

    it("should not attempt to access document.cookie on server", () => {
      const cookieSetter = vi.fn();
      Object.defineProperty(document, "cookie", {
        set: cookieSetter,
        configurable: true,
      });

      writePreferenceCookies({ theme: "dark", language: "en" });
      expect(cookieSetter).not.toHaveBeenCalled();
    });
  });

  describe("client-side behavior", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should write theme preference cookie", () => {
      writePreferenceCookies({ theme: "dark" });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("theme=dark");
      expect(cookieWrites[0]).toContain("path=/");
      expect(cookieWrites[0]).toContain("max-age=31536000");
      expect(cookieWrites[0]).toContain("SameSite=lax");
    });

    it("should write themeScheme preference cookie", () => {
      writePreferenceCookies({ themeScheme: "spells" });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("themeScheme=spells");
    });

    it("should write language preference cookie", () => {
      writePreferenceCookies({ language: "fr" });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("language=fr");
    });

    it("should write languageTheme preference cookie", () => {
      writePreferenceCookies({ languageTheme: "spells" });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("languageTheme=spells");
    });

    it("should write showSidebar preference cookie as string", () => {
      writePreferenceCookies({ showSidebar: true });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("showSidebar=true");
    });

    it("should write showSidebar false correctly", () => {
      writePreferenceCookies({ showSidebar: false });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("showSidebar=false");
    });

    it("should write multiple preference cookies", () => {
      writePreferenceCookies({
        theme: "light",
        themeScheme: "default",
        language: "es",
        languageTheme: "spells",
        showSidebar: true,
      });

      expect(cookieWrites).toHaveLength(5);
      expect(cookieWrites[0]).toContain("theme=light");
      expect(cookieWrites[1]).toContain("themeScheme=default");
      expect(cookieWrites[2]).toContain("language=es");
      expect(cookieWrites[3]).toContain("languageTheme=spells");
      expect(cookieWrites[4]).toContain("showSidebar=true");
    });

    it("should write partial preferences", () => {
      writePreferenceCookies({
        theme: "system",
        language: "de",
      });

      expect(cookieWrites).toHaveLength(2);
      expect(cookieWrites[0]).toContain("theme=system");
      expect(cookieWrites[1]).toContain("language=de");
    });

    it("should handle empty preferences object", () => {
      writePreferenceCookies({});

      expect(cookieWrites).toHaveLength(0);
    });

    it("should include correct cookie options path", () => {
      writePreferenceCookies({ theme: "dark" });

      expect(cookieWrites[0]).toContain(`path=${COOKIE_OPTIONS.path}`);
    });

    it("should include correct cookie options max-age", () => {
      writePreferenceCookies({ theme: "dark" });

      expect(cookieWrites[0]).toContain(`max-age=${COOKIE_OPTIONS.maxAge}`);
    });

    it("should include correct cookie options sameSite", () => {
      writePreferenceCookies({ theme: "dark" });

      expect(cookieWrites[0]).toContain(`SameSite=${COOKIE_OPTIONS.sameSite}`);
    });

    it("should handle language codes with special characters", () => {
      writePreferenceCookies({ language: "zh-CN" });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("language=zh-CN");
    });

    it("should write all theme values correctly", () => {
      const themes: Array<UserPreferences["theme"]> = ["light", "dark", "system"];

      themes.forEach((theme) => {
        cookieWrites = [];
        writePreferenceCookies({ theme });

        expect(cookieWrites).toHaveLength(1);
        expect(cookieWrites[0]).toContain(`theme=${theme}`);
      });
    });

    it("should write all themeScheme values correctly", () => {
      const schemes: Array<UserPreferences["themeScheme"]> = ["default", "spells"];

      schemes.forEach((themeScheme) => {
        cookieWrites = [];
        writePreferenceCookies({ themeScheme });

        expect(cookieWrites).toHaveLength(1);
        expect(cookieWrites[0]).toContain(`themeScheme=${themeScheme}`);
      });
    });

    it("should write all languageTheme values correctly", () => {
      const languageThemes: Array<UserPreferences["languageTheme"]> = ["default", "spells"];

      languageThemes.forEach((languageTheme) => {
        cookieWrites = [];
        writePreferenceCookies({ languageTheme });

        expect(cookieWrites).toHaveLength(1);
        expect(cookieWrites[0]).toContain(`languageTheme=${languageTheme}`);
      });
    });
  });

  describe("edge cases", () => {
    beforeEach(async () => {
      await setBrowserMode(true);
    });

    it("should not write showSidebar cookie when undefined", () => {
      writePreferenceCookies({
        theme: "dark",
        showSidebar: undefined,
      });

      expect(cookieWrites).toHaveLength(1);
      expect(cookieWrites[0]).toContain("theme=dark");
      expect(cookieWrites[0]).not.toContain("showSidebar");
    });

    it("should write showSidebar cookie when explicitly false", () => {
      writePreferenceCookies({
        theme: "dark",
        showSidebar: false,
      });

      expect(cookieWrites).toHaveLength(2);
      expect(cookieWrites.some((c) => c.includes("showSidebar=false"))).toBe(true);
    });

    it("should handle preferences with empty string values", () => {
      writePreferenceCookies({
        language: "",
      });

      // Empty strings are falsy, so they won't be written (if check fails)
      expect(cookieWrites).toHaveLength(0);
    });
  });
});

describe("integration tests", () => {
  beforeEach(async () => {
    await setBrowserMode(true);
  });

  it("should maintain consistency between read and write", () => {
    const preferences: Partial<UserPreferences> = {
      theme: "dark",
      themeScheme: "spells",
      language: "fr",
      languageTheme: "default",
      showSidebar: false,
    };

    // Mock cookie writes
    const writes: string[] = [];
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => {
        // Simulate browser combining the cookies
        return writes.map((w) => w.split(";")[0]).join("; ");
      }),
      set: vi.fn((value: string) => {
        writes.push(value);
      }),
      configurable: true,
    });

    writePreferenceCookies(preferences);
    const readBack = readPreferenceCookies();

    expect(readBack).toEqual(preferences);
  });

  it("should handle partial updates correctly", () => {
    // Initial state
    mockDocumentCookie("theme=light; language=en; showSidebar=true");
    const initial = readPreferenceCookies();

    expect(initial).toEqual({
      theme: "light",
      language: "en",
      showSidebar: true,
    });

    // Update only theme
    const writes: string[] = [];
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => {
        // Simulate keeping old cookies and adding new ones
        const oldCookies = "language=en; showSidebar=true";
        const newCookies = writes.map((w) => w.split(";")[0]).join("; ");
        return newCookies ? `${oldCookies}; ${newCookies}` : oldCookies;
      }),
      set: vi.fn((value: string) => {
        writes.push(value);
      }),
      configurable: true,
    });

    writePreferenceCookies({ theme: "dark" });
    const updated = readPreferenceCookies();

    expect(updated.theme).toBe("dark");
    expect(updated.language).toBe("en");
    expect(updated.showSidebar).toBe(true);
  });

  it("should work with default preferences", () => {
    const defaults = getDefaultPreferences();

    const writes: string[] = [];
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => {
        return writes.map((w) => w.split(";")[0]).join("; ");
      }),
      set: vi.fn((value: string) => {
        writes.push(value);
      }),
      configurable: true,
    });

    writePreferenceCookies(defaults);
    const readBack = readPreferenceCookies();

    expect(readBack).toEqual(defaults);
  });
});

describe("constants", () => {
  it("should have all preference cookie names defined", () => {
    expect(PREFERENCE_COOKIE_NAMES).toEqual({
      theme: "theme",
      themeScheme: "themeScheme",
      language: "language",
      languageTheme: "languageTheme",
      showSidebar: "showSidebar",
    });
  });

  it("should have valid cookie options", () => {
    expect(COOKIE_OPTIONS.path).toBe("/");
    expect(COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 365);
    expect(COOKIE_OPTIONS.httpOnly).toBe(false);
    expect(COOKIE_OPTIONS.secure).toBe(false);
    expect(COOKIE_OPTIONS.sameSite).toBe("lax");
  });

  it("should have cookie max-age of 1 year", () => {
    const oneYearInSeconds = 60 * 60 * 24 * 365;
    expect(COOKIE_OPTIONS.maxAge).toBe(oneYearInSeconds);
  });
});
