/**
 * Tests for Theme Scheme Management System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    THEME_SCHEMES,
    applyThemeScheme,
    applyFullTheme,
    getCurrentScheme,
} from './scheme-registry';
import type { FullTheme } from './types';

// Mock the $app/environment module
vi.mock('$app/environment', () => ({
    browser: false,
}));

// Mock the logger utility
vi.mock('../utils/logger', () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
    const module = await import('$app/environment');
    vi.mocked(module).browser = isBrowser;
}

// Helper to create a mock HTML element with classList
function createMockHtmlElement() {
    const classes = new Set<string>();
    const datasetObj: Record<string, string> = {};
    return {
        tagName: 'HTML',
        classList: {
            add: vi.fn((...tokens: string[]) => {
                tokens.forEach(token => classes.add(token));
            }),
            remove: vi.fn((...tokens: string[]) => {
                tokens.forEach(token => classes.delete(token));
            }),
            contains: vi.fn((token: string) => classes.has(token)),
            toggle: vi.fn(),
            replace: vi.fn(),
            _getClasses: () => Array.from(classes),
            _clear: () => classes.clear(),
        },
        dataset: datasetObj,
    };
}

// Helper to mock window.matchMedia
function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

describe('THEME_SCHEMES', () => {
    it('should contain default scheme configuration', () => {
        expect(THEME_SCHEMES.default).toBeDefined();
        expect(THEME_SCHEMES.default.name).toBe('default');
        expect(THEME_SCHEMES.default.displayName).toBe('Default');
    });

    it('should contain spells scheme configuration', () => {
        expect(THEME_SCHEMES.spells).toBeDefined();
        expect(THEME_SCHEMES.spells.name).toBe('spells');
        expect(THEME_SCHEMES.spells.displayName).toBe('Grimoire');
    });

    it.each([
        ['default', THEME_SCHEMES.default],
        ['spells', THEME_SCHEMES.spells],
    ])('should have all required fields for %s scheme', (_name, scheme) => {
        expect(scheme).toHaveProperty('name');
        expect(scheme).toHaveProperty('displayName');
        expect(scheme).toHaveProperty('description');
        expect(scheme).toHaveProperty('icon');
        expect(scheme).toHaveProperty('title');
        expect(scheme).toHaveProperty('preview');
    });

    it.each([
        ['default', THEME_SCHEMES.default.preview],
        ['spells', THEME_SCHEMES.spells.preview],
    ])('should have valid preview colors for %s scheme', (_name, preview) => {
        expect(preview.primary).toMatch(/^#[0-9a-f]{6}$/i);
        expect(preview.accent).toMatch(/^#[0-9a-f]{6}$/i);
        expect(preview.background).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have unique display names for schemes', () => {
        const displayNames = Object.values(THEME_SCHEMES).map(s => s.displayName);
        const uniqueDisplayNames = new Set(displayNames);
        expect(displayNames.length).toBe(uniqueDisplayNames.size);
    });

    it('should have descriptive text for all schemes', () => {
        Object.values(THEME_SCHEMES).forEach(scheme => {
            expect(scheme.description.length).toBeGreaterThan(0);
            expect(scheme.displayName.length).toBeGreaterThan(0);
        });
    });

    it('should contain exactly 2 schemes', () => {
        expect(Object.keys(THEME_SCHEMES)).toHaveLength(2);
    });

    it('should have scheme names matching their keys', () => {
        Object.entries(THEME_SCHEMES).forEach(([key, config]) => {
            expect(config.name).toBe(key);
        });
    });
});

describe('applyThemeScheme', () => {
    let mockHtml: ReturnType<typeof createMockHtmlElement>;

    beforeEach(() => {
        mockHtml = createMockHtmlElement();
        vi.stubGlobal('document', {
            documentElement: mockHtml,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should not apply scheme when not in browser', () => {
            applyThemeScheme('default');
            expect(mockHtml.classList.add).not.toHaveBeenCalled();
        });

        it('should not modify DOM when document is undefined', () => {
            vi.stubGlobal('document', undefined);
            applyThemeScheme('spells');
            expect(mockHtml.classList.add).not.toHaveBeenCalled();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should apply default scheme class', () => {
            applyThemeScheme('default');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-default');
        });

        it('should apply spells scheme class', () => {
            applyThemeScheme('spells');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
        });

        it('should remove all existing scheme classes before applying new one', () => {
            applyThemeScheme('default');
            expect(mockHtml.classList.remove).toHaveBeenCalledWith('scheme-default');
            expect(mockHtml.classList.remove).toHaveBeenCalledWith('scheme-spells');
        });

        it('should handle applying same scheme twice', () => {
            applyThemeScheme('default');
            vi.clearAllMocks();

            applyThemeScheme('default');
            expect(mockHtml.classList.remove).toHaveBeenCalled();
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-default');
        });

        it('should remove exactly the number of schemes defined in THEME_SCHEMES', () => {
            applyThemeScheme('default');
            const removeCallCount = mockHtml.classList.remove.mock.calls.length;
            expect(removeCallCount).toBe(Object.keys(THEME_SCHEMES).length);
        });
    });
});

describe('applyFullTheme', () => {
    let mockHtml: ReturnType<typeof createMockHtmlElement>;

    beforeEach(() => {
        mockHtml = createMockHtmlElement();
        vi.stubGlobal('document', {
            documentElement: mockHtml,
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should not apply theme when not in browser', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);
            expect(mockHtml.classList.add).not.toHaveBeenCalled();
        });

        it('should not modify DOM when document is undefined', () => {
            vi.stubGlobal('document', undefined);
            const theme: FullTheme = { base: 'dark', scheme: 'spells' };
            applyFullTheme(theme);
            expect(mockHtml.classList.add).not.toHaveBeenCalled();
        });
    });

    describe('client-side behavior - light theme', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should apply light theme with default scheme', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-light');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-default');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should apply light theme with spells scheme', () => {
            const theme: FullTheme = { base: 'light', scheme: 'spells' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-light');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should remove all existing theme classes before applying light theme', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.remove).toHaveBeenCalledWith(
                'theme-light',
                'theme-dark',
                'theme-system',
                'theme-system-light',
                'theme-system-dark'
            );
            expect(mockHtml.dataset.theme).toBe('light');
        });
    });

    describe('client-side behavior - dark theme', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should apply dark theme with default scheme', () => {
            const theme: FullTheme = { base: 'dark', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-dark');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-default');
            expect(mockHtml.dataset.theme).toBe('dark');
        });

        it('should apply dark theme with spells scheme', () => {
            const theme: FullTheme = { base: 'dark', scheme: 'spells' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-dark');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
            expect(mockHtml.dataset.theme).toBe('dark');
        });
    });

    describe('client-side behavior - system theme', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should apply system theme with system-light when user prefers light', () => {
            mockMatchMedia(false); // prefers-color-scheme: dark = false
            const theme: FullTheme = { base: 'system', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system-light');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should apply system theme with system-dark when user prefers dark', () => {
            mockMatchMedia(true); // prefers-color-scheme: dark = true
            const theme: FullTheme = { base: 'system', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system-dark');
            expect(mockHtml.dataset.theme).toBe('dark');
        });

        it('should query matchMedia with correct prefers-color-scheme query', () => {
            mockMatchMedia(true);
            const theme: FullTheme = { base: 'system', scheme: 'default' };
            applyFullTheme(theme);

            expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
            expect(mockHtml.dataset.theme).toBe('dark');
        });

        it('should apply system theme with spells scheme', () => {
            mockMatchMedia(true);
            const theme: FullTheme = { base: 'system', scheme: 'spells' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system-dark');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
            expect(mockHtml.dataset.theme).toBe('dark');
        });
    });

    describe('client-side behavior - theme switching transitions', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should add theme-switching class at start', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-switching');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should remove theme-switching class after 100ms', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            expect(mockHtml.classList.remove).not.toHaveBeenCalledWith('theme-switching');

            vi.advanceTimersByTime(100);

            expect(mockHtml.classList.remove).toHaveBeenCalledWith('theme-switching');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should not remove theme-switching class before 100ms', () => {
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            vi.advanceTimersByTime(50);

            expect(mockHtml.classList.remove).not.toHaveBeenCalledWith('theme-switching');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should use setTimeout for transition delay', () => {
            const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
            const theme: FullTheme = { base: 'light', scheme: 'default' };
            applyFullTheme(theme);

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
            expect(mockHtml.dataset.theme).toBe('light');
        });
    });

    describe('client-side behavior - theme switching scenarios', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should switch from light to dark theme', () => {
            applyFullTheme({ base: 'light', scheme: 'default' });
            vi.clearAllMocks();

            applyFullTheme({ base: 'dark', scheme: 'default' });

            expect(mockHtml.classList.remove).toHaveBeenCalledWith(
                'theme-light',
                'theme-dark',
                'theme-system',
                'theme-system-light',
                'theme-system-dark'
            );
            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-dark');
            expect(mockHtml.dataset.theme).toBe('dark');
        });

        it('should switch from dark to system theme', () => {
            mockMatchMedia(true);
            applyFullTheme({ base: 'dark', scheme: 'default' });
            vi.clearAllMocks();

            applyFullTheme({ base: 'system', scheme: 'default' });

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-system-dark');
            expect(mockHtml.dataset.theme).toBe('dark');
        });

        it('should switch scheme while maintaining theme base', () => {
            applyFullTheme({ base: 'light', scheme: 'default' });
            vi.clearAllMocks();

            applyFullTheme({ base: 'light', scheme: 'spells' });

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-light');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
            expect(mockHtml.dataset.theme).toBe('light');
        });

        it('should switch both theme and scheme simultaneously', () => {
            applyFullTheme({ base: 'light', scheme: 'default' });
            vi.clearAllMocks();

            applyFullTheme({ base: 'dark', scheme: 'spells' });

            expect(mockHtml.classList.add).toHaveBeenCalledWith('theme-dark');
            expect(mockHtml.classList.add).toHaveBeenCalledWith('scheme-spells');
            expect(mockHtml.dataset.theme).toBe('dark');
        });
    });
});

describe('getCurrentScheme', () => {
    let mockHtml: ReturnType<typeof createMockHtmlElement>;

    beforeEach(() => {
        mockHtml = createMockHtmlElement();
        vi.stubGlobal('document', {
            documentElement: mockHtml,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return default scheme when not in browser', () => {
            const scheme = getCurrentScheme();
            expect(scheme).toBe('default');
        });

        it('should return default scheme when document is undefined', () => {
            vi.stubGlobal('document', undefined);
            const scheme = getCurrentScheme();
            expect(scheme).toBe('default');
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return default scheme when scheme-default class is present', () => {
            mockHtml.classList.contains = vi.fn((token: string) => token === 'scheme-default');
            const scheme = getCurrentScheme();
            expect(scheme).toBe('default');
        });

        it('should return spells scheme when scheme-spells class is present', () => {
            mockHtml.classList.contains = vi.fn((token: string) => token === 'scheme-spells');
            const scheme = getCurrentScheme();
            expect(scheme).toBe('spells');
        });

        it('should return default scheme when no scheme class is present', () => {
            mockHtml.classList.contains = vi.fn(() => false);
            const scheme = getCurrentScheme();
            expect(scheme).toBe('default');
        });

        it('should check for scheme classes in correct format', () => {
            mockHtml.classList.contains = vi.fn((token: string) => token === 'scheme-spells');
            getCurrentScheme();

            expect(mockHtml.classList.contains).toHaveBeenCalledWith('scheme-default');
        });

        it('should return first matching scheme when multiple schemes are present', () => {
            // This shouldn't happen normally, but tests edge case
            mockHtml.classList.contains = vi.fn(() => true);
            const scheme = getCurrentScheme();

            // Should return the first scheme in THEME_SCHEMES iteration order
            expect(['default', 'spells']).toContain(scheme);
        });

        it('should handle empty classList', () => {
            mockHtml.classList.contains = vi.fn(() => false);
            const scheme = getCurrentScheme();
            expect(scheme).toBe('default');
        });
    });

    describe('integration with applyThemeScheme', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return default after applying default scheme', () => {
            const classes = new Set<string>();
            mockHtml.classList.add = vi.fn((token: string) => {
                classes.add(token);
            });
            mockHtml.classList.remove = vi.fn((token: string) => {
                classes.delete(token);
            });
            mockHtml.classList.contains = vi.fn((token: string) => classes.has(token));

            applyThemeScheme('default');
            const scheme = getCurrentScheme();

            expect(scheme).toBe('default');
        });

        it('should return spells after applying spells scheme', () => {
            const classes = new Set<string>();
            mockHtml.classList.add = vi.fn((token: string) => {
                classes.add(token);
            });
            mockHtml.classList.remove = vi.fn((token: string) => {
                classes.delete(token);
            });
            mockHtml.classList.contains = vi.fn((token: string) => classes.has(token));

            applyThemeScheme('spells');
            const scheme = getCurrentScheme();

            expect(scheme).toBe('spells');
        });
    });

    describe('integration with applyFullTheme', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return correct scheme after applyFullTheme', () => {
            const classes = new Set<string>();
            const datasetObj: Record<string, string> = {};
            mockHtml.classList.add = vi.fn((...tokens: string[]) => {
                tokens.forEach(token => classes.add(token));
            });
            mockHtml.classList.remove = vi.fn((...tokens: string[]) => {
                tokens.forEach(token => classes.delete(token));
            });
            mockHtml.classList.contains = vi.fn((token: string) => classes.has(token));
            mockHtml.dataset = datasetObj;

            mockMatchMedia(false);
            applyFullTheme({ base: 'light', scheme: 'spells' });
            const scheme = getCurrentScheme();

            expect(scheme).toBe('spells');
            expect(mockHtml.dataset.theme).toBe('light');
        });
    });
});

describe('edge cases and error conditions', () => {
    beforeEach(async () => {
        await setBrowserMode(true);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should throw when documentElement is missing', () => {
        vi.stubGlobal('document', {});

        expect(() => applyThemeScheme('default')).toThrow();
    });

    it('should handle document without classList', () => {
        vi.stubGlobal('document', {
            documentElement: {},
        });

        expect(() => applyThemeScheme('default')).toThrow();
    });

    it('should throw when document is null', () => {
        vi.stubGlobal('document', null);

        expect(() => applyThemeScheme('default')).toThrow();
    });

    it('should handle matchMedia not available for system theme', () => {
        const mockHtml = createMockHtmlElement();
        vi.stubGlobal('document', {
            documentElement: mockHtml,
        });
        vi.stubGlobal('window', {});

        expect(() => applyFullTheme({ base: 'system', scheme: 'default' })).toThrow();
    });

    it('should handle classList methods being undefined', () => {
        vi.stubGlobal('document', {
            documentElement: {
                classList: {},
            },
        });

        expect(() => applyThemeScheme('default')).toThrow();
    });
});
