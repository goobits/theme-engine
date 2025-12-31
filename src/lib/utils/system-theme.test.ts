/**
 * Tests for System Theme Detection Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    DARK_MODE_MEDIA_QUERY,
    getDarkModeMediaQuery,
    prefersDarkMode,
    getSystemThemePreference,
    resolveThemeMode,
    watchSystemTheme,
} from './system-theme';

// Mock the $app/environment module
vi.mock('$app/environment', () => ({
    browser: false,
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
    const module = await import('$app/environment');
    vi.mocked(module).browser = isBrowser;
}

// Setup window.matchMedia mock
function setupMatchMedia() {
    if (!window.matchMedia) {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: vi.fn(),
        });
    }
}

// Helper to create mock MediaQueryList
function createMockMediaQueryList(matches: boolean): MediaQueryList {
    const listeners: Array<(e: MediaQueryListEvent | MediaQueryList) => void> = [];

    const mql = {
        matches,
        media: DARK_MODE_MEDIA_QUERY,
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
            if (event === 'change') {
                listeners.push(handler);
            }
        }),
        removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
            if (event === 'change') {
                const index = listeners.indexOf(handler);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }),
        addListener: vi.fn((handler: (e: MediaQueryList) => void) => {
            listeners.push(handler);
        }),
        removeListener: vi.fn((handler: (e: MediaQueryList) => void) => {
            const index = listeners.indexOf(handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }),
        dispatchEvent: vi.fn(),
        onchange: null,
        // Trigger change for testing
        _triggerChange: (newMatches: boolean) => {
            mql.matches = newMatches;
            listeners.forEach(listener => {
                listener({ matches: newMatches } as MediaQueryListEvent);
            });
        },
    } as MediaQueryList & { _triggerChange: (matches: boolean) => void };

    return mql;
}

describe('DARK_MODE_MEDIA_QUERY', () => {
    it('should be the correct media query string', () => {
        expect(DARK_MODE_MEDIA_QUERY).toBe('(prefers-color-scheme: dark)');
    });

    it('should be a non-empty string', () => {
        expect(DARK_MODE_MEDIA_QUERY).toBeTruthy();
        expect(typeof DARK_MODE_MEDIA_QUERY).toBe('string');
    });
});

describe('getDarkModeMediaQuery', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return null when not in browser', () => {
            const result = getDarkModeMediaQuery();
            expect(result).toBeNull();
        });

        it('should not attempt to access window on server', () => {
            const windowSpy = vi.spyOn(globalThis, 'window', 'get');
            getDarkModeMediaQuery();
            // Function should return early without accessing window
            expect(windowSpy).not.toHaveBeenCalled();
            windowSpy.mockRestore();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should return MediaQueryList when in browser', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = getDarkModeMediaQuery();

            expect(result).not.toBeNull();
            expect(result).toBe(mockMQL);
            expect(window.matchMedia).toHaveBeenCalledWith(DARK_MODE_MEDIA_QUERY);
        });

        it('should call window.matchMedia with correct query', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            getDarkModeMediaQuery();

            expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
        });

        it('should return MediaQueryList with matches property', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = getDarkModeMediaQuery();

            expect(result).toHaveProperty('matches');
            expect(typeof result?.matches).toBe('boolean');
        });
    });
});

describe('prefersDarkMode', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
            setupMatchMedia();
            vi.mocked(window.matchMedia).mockClear();
        });

        it('should return false when not in browser', () => {
            const result = prefersDarkMode();
            expect(result).toBe(false);
        });

        it('should not access window.matchMedia on server', () => {
            const matchMediaSpy = vi.mocked(window.matchMedia);
            prefersDarkMode();
            expect(matchMediaSpy).not.toHaveBeenCalled();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should return true when dark mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = prefersDarkMode();

            expect(result).toBe(true);
        });

        it('should return false when light mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = prefersDarkMode();

            expect(result).toBe(false);
        });

        it('should query the correct media query', () => {
            const mockMQL = createMockMediaQueryList(false);
            const matchMediaSpy = vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            prefersDarkMode();

            expect(matchMediaSpy).toHaveBeenCalledWith(DARK_MODE_MEDIA_QUERY);
        });
    });
});

describe('getSystemThemePreference', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
            setupMatchMedia();
            vi.mocked(window.matchMedia).mockClear();
        });

        it('should return "light" when not in browser', () => {
            const result = getSystemThemePreference();
            expect(result).toBe('light');
        });

        it('should not access window on server', () => {
            const matchMediaSpy = vi.mocked(window.matchMedia);
            getSystemThemePreference();
            expect(matchMediaSpy).not.toHaveBeenCalled();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should return "dark" when dark mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = getSystemThemePreference();

            expect(result).toBe('dark');
        });

        it('should return "light" when light mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = getSystemThemePreference();

            expect(result).toBe('light');
        });

        it('should always return either "light" or "dark"', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = getSystemThemePreference();

            expect(['light', 'dark']).toContain(result);
        });
    });
});

describe('resolveThemeMode', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should resolve "system" to "light" on server', () => {
            const result = resolveThemeMode('system');
            expect(result).toBe('light');
        });

        it('should pass through "light" unchanged', () => {
            const result = resolveThemeMode('light');
            expect(result).toBe('light');
        });

        it('should pass through "dark" unchanged', () => {
            const result = resolveThemeMode('dark');
            expect(result).toBe('dark');
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should pass through "light" unchanged', () => {
            const result = resolveThemeMode('light');
            expect(result).toBe('light');
        });

        it('should pass through "dark" unchanged', () => {
            const result = resolveThemeMode('dark');
            expect(result).toBe('dark');
        });

        it('should resolve "system" to "dark" when dark mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = resolveThemeMode('system');

            expect(result).toBe('dark');
        });

        it('should resolve "system" to "light" when light mode is preferred', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const result = resolveThemeMode('system');

            expect(result).toBe('light');
        });

        it('should always return either "light" or "dark"', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
            modes.forEach(mode => {
                const result = resolveThemeMode(mode);
                expect(['light', 'dark']).toContain(result);
            });
        });
    });
});

describe('watchSystemTheme', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
            setupMatchMedia();
            vi.mocked(window.matchMedia).mockClear();
        });

        it('should return a no-op function when not in browser', () => {
            const callback = vi.fn();
            const cleanup = watchSystemTheme(callback);

            expect(typeof cleanup).toBe('function');
            cleanup(); // Should not throw
            expect(callback).not.toHaveBeenCalled();
        });

        it('should not access window.matchMedia on server', () => {
            const callback = vi.fn();
            const matchMediaSpy = vi.mocked(window.matchMedia);

            watchSystemTheme(callback);

            expect(matchMediaSpy).not.toHaveBeenCalled();
        });

        it('should not invoke callback on server', () => {
            const callback = vi.fn();
            watchSystemTheme(callback);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('client-side behavior with modern API', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should set up event listener when in browser', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);

            expect(mockMQL.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });

        it('should call callback when system theme changes to dark', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);

            // Simulate system theme change to dark
            mockMQL._triggerChange(true);

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should call callback when system theme changes to light', () => {
            const mockMQL = createMockMediaQueryList(true);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);

            // Simulate system theme change to light
            mockMQL._triggerChange(false);

            expect(callback).toHaveBeenCalledWith(false);
        });

        it('should call callback multiple times for multiple changes', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);

            mockMQL._triggerChange(true);
            mockMQL._triggerChange(false);
            mockMQL._triggerChange(true);

            expect(callback).toHaveBeenCalledTimes(3);
            expect(callback).toHaveBeenNthCalledWith(1, true);
            expect(callback).toHaveBeenNthCalledWith(2, false);
            expect(callback).toHaveBeenNthCalledWith(3, true);
        });

        it('should remove event listener when cleanup is called', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            const cleanup = watchSystemTheme(callback);
            cleanup();

            expect(mockMQL.removeEventListener).toHaveBeenCalledWith(
                'change',
                expect.any(Function)
            );
        });

        it('should not call callback after cleanup', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            const cleanup = watchSystemTheme(callback);
            cleanup();

            callback.mockClear();
            mockMQL._triggerChange(true);

            expect(callback).not.toHaveBeenCalled();
        });

        it('should be safe to call cleanup multiple times', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            const cleanup = watchSystemTheme(callback);
            cleanup();
            cleanup();
            cleanup();

            // Should not throw
            expect(mockMQL.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('client-side behavior with legacy API', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should use addListener when addEventListener is not available', () => {
            const mockMQL = {
                matches: false,
                media: DARK_MODE_MEDIA_QUERY,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: undefined,
                removeEventListener: undefined,
                dispatchEvent: vi.fn(),
                onchange: null,
            } as unknown as MediaQueryList;

            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);

            expect(mockMQL.addListener).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should use removeListener for cleanup when using legacy API', () => {
            const mockMQL = {
                matches: false,
                media: DARK_MODE_MEDIA_QUERY,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: undefined,
                removeEventListener: undefined,
                dispatchEvent: vi.fn(),
                onchange: null,
            } as unknown as MediaQueryList;

            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            const cleanup = watchSystemTheme(callback);
            cleanup();

            expect(mockMQL.removeListener).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should return no-op when neither API is available', () => {
            const mockMQL = {
                matches: false,
                media: DARK_MODE_MEDIA_QUERY,
                addEventListener: undefined,
                removeEventListener: undefined,
                addListener: undefined,
                removeListener: undefined,
                dispatchEvent: vi.fn(),
                onchange: null,
            } as unknown as MediaQueryList;

            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            const cleanup = watchSystemTheme(callback);

            expect(typeof cleanup).toBe('function');
            cleanup(); // Should not throw
        });
    });

    describe('edge cases', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
            setupMatchMedia();
        });

        it('should handle multiple watchers independently', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const cleanup1 = watchSystemTheme(callback1);
            const cleanup2 = watchSystemTheme(callback2);

            mockMQL._triggerChange(true);

            expect(callback1).toHaveBeenCalledWith(true);
            expect(callback2).toHaveBeenCalledWith(true);

            cleanup1();
            callback1.mockClear();
            callback2.mockClear();

            mockMQL._triggerChange(false);

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledWith(false);

            cleanup2();
        });

        it('should pass boolean value to callback', () => {
            const mockMQL = createMockMediaQueryList(false);
            vi.mocked(window.matchMedia).mockReturnValue(mockMQL);
            const callback = vi.fn();

            watchSystemTheme(callback);
            mockMQL._triggerChange(true);

            const callArg = callback.mock.calls[0][0];
            expect(typeof callArg).toBe('boolean');
            expect(callArg).toBe(true);
        });
    });
});

describe('integration tests', () => {
    beforeEach(async () => {
        await setBrowserMode(true);
        setupMatchMedia();
    });

    it('should provide consistent results across all functions', () => {
        const mockMQL = createMockMediaQueryList(true);
        vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

        const mql = getDarkModeMediaQuery();
        const prefers = prefersDarkMode();
        const theme = getSystemThemePreference();
        const resolved = resolveThemeMode('system');

        expect(mql?.matches).toBe(true);
        expect(prefers).toBe(true);
        expect(theme).toBe('dark');
        expect(resolved).toBe('dark');
    });

    it('should handle theme mode resolution correctly', () => {
        const mockMQL = createMockMediaQueryList(false);
        vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

        expect(resolveThemeMode('light')).toBe('light');
        expect(resolveThemeMode('dark')).toBe('dark');
        expect(resolveThemeMode('system')).toBe('light');

        // Change system preference
        mockMQL.matches = true;
        expect(resolveThemeMode('system')).toBe('dark');
    });

    it('should properly sync watcher with preference check', () => {
        const mockMQL = createMockMediaQueryList(false);
        vi.mocked(window.matchMedia).mockReturnValue(mockMQL);

        const callback = vi.fn();
        watchSystemTheme(callback);

        expect(prefersDarkMode()).toBe(false);

        mockMQL._triggerChange(true);

        expect(callback).toHaveBeenCalledWith(true);
        expect(prefersDarkMode()).toBe(true);
    });
});
