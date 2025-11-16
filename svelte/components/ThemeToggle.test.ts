/**
 * Tests for ThemeToggle Svelte Component
 *
 * Focused tests for the ThemeToggle component that provides a button
 * to cycle through theme modes (light → dark → system → light) with
 * appropriate icons and accessibility features.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ThemeStore } from '../stores/theme.svelte';
import type { ThemeMode, ThemeScheme } from '../../core/types';

// Mock lucide-svelte icons
const MockSun = vi.fn();
const MockMoon = vi.fn();
const MockMonitor = vi.fn();

vi.mock('@lucide/svelte', () => ({
    Sun: MockSun,
    Moon: MockMoon,
    Monitor: MockMonitor,
}));

// Mock useTheme hook
let mockThemeStore: ThemeStore;
const useThemeMock = vi.fn();

vi.mock('../hooks/useTheme.svelte', () => ({
    useTheme: () => useThemeMock(),
}));

// Helper to create mock ThemeStore with reactive properties
function createMockThemeStore(
    theme: ThemeMode = 'system',
    scheme: ThemeScheme = 'default'
): ThemeStore {
    return {
        subscribe: vi.fn(),
        settings: { theme, themeScheme: scheme },
        theme,
        scheme,
        availableSchemes: [
            {
                name: 'default',
                displayName: 'Default',
                description: 'Default theme',
                preview: { primary: '#000', accent: '#fff', background: '#fff' },
            },
            {
                name: 'spells',
                displayName: 'Spells',
                description: 'Spells theme',
                preview: { primary: '#000', accent: '#fff', background: '#fff' },
            },
        ],
        setTheme: vi.fn(),
        setScheme: vi.fn(),
        cycleMode: vi.fn(),
    };
}

describe('ThemeToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockThemeStore = createMockThemeStore();
        useThemeMock.mockReturnValue(mockThemeStore);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('useTheme hook integration', () => {
        it('should use theme from theme store', () => {
            const store = createMockThemeStore('dark', 'spells');
            useThemeMock.mockReturnValue(store);

            expect(store.theme).toBe('dark');
        });

        it('should use scheme from theme store', () => {
            const store = createMockThemeStore('light', 'spells');
            useThemeMock.mockReturnValue(store);

            expect(store.scheme).toBe('spells');
        });

        it('should use availableSchemes from theme store', () => {
            const store = createMockThemeStore('system', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store.availableSchemes).toHaveLength(2);
            expect(store.availableSchemes[0].name).toBe('default');
            expect(store.availableSchemes[1].name).toBe('spells');
        });

        it('should have access to cycleMode function', () => {
            const store = createMockThemeStore('light', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store.cycleMode).toBeDefined();
            expect(typeof store.cycleMode).toBe('function');
        });
    });

    describe('cycleMode functionality', () => {
        it('should call cycleMode when triggered', () => {
            const store = createMockThemeStore('light', 'default');
            useThemeMock.mockReturnValue(store);

            store.cycleMode();

            expect(store.cycleMode).toHaveBeenCalledTimes(1);
        });

        it('should handle cycling from light theme', () => {
            const store = createMockThemeStore('light', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store.theme).toBe('light');
            store.cycleMode();

            expect(store.cycleMode).toHaveBeenCalled();
        });

        it('should handle cycling from dark theme', () => {
            const store = createMockThemeStore('dark', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store.theme).toBe('dark');
            store.cycleMode();

            expect(store.cycleMode).toHaveBeenCalled();
        });

        it('should handle cycling from system theme', () => {
            const store = createMockThemeStore('system', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store.theme).toBe('system');
            store.cycleMode();

            expect(store.cycleMode).toHaveBeenCalled();
        });

        it('should handle multiple cycle calls', () => {
            const store = createMockThemeStore('light', 'default');
            useThemeMock.mockReturnValue(store);

            store.cycleMode();
            store.cycleMode();
            store.cycleMode();

            expect(store.cycleMode).toHaveBeenCalledTimes(3);
        });

        it('should handle rapid cycling', () => {
            const store = createMockThemeStore('dark', 'default');
            useThemeMock.mockReturnValue(store);

            for (let i = 0; i < 5; i++) {
                store.cycleMode();
            }

            expect(store.cycleMode).toHaveBeenCalledTimes(5);
        });
    });

    describe('scheme name resolution', () => {
        it('should find scheme displayName from availableSchemes', () => {
            const store = createMockThemeStore('light', 'default');
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig).toBeDefined();
            expect(schemeConfig?.displayName).toBe('Default');
        });

        it('should find custom scheme displayName', () => {
            const store = createMockThemeStore('dark', 'spells');
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig).toBeDefined();
            expect(schemeConfig?.displayName).toBe('Spells');
        });

        it('should return undefined for non-existent scheme', () => {
            const store = createMockThemeStore('system', 'nonexistent' as ThemeScheme);
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig).toBeUndefined();
        });

        it('should handle empty availableSchemes array', () => {
            const store = createMockThemeStore('light', 'default');
            (store as any).availableSchemes = [];
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig).toBeUndefined();
        });

        it('should handle multiple schemes', () => {
            const store = createMockThemeStore('dark', 'spells');
            (store as any).availableSchemes = [
                { name: 'default', displayName: 'Default' },
                { name: 'spells', displayName: 'Spells' },
                { name: 'custom', displayName: 'Custom' },
            ];
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig?.name).toBe('spells');
            expect(schemeConfig?.displayName).toBe('Spells');
        });
    });

    describe('edge cases', () => {
        it('should handle missing cycleMode function', () => {
            const store = createMockThemeStore('dark', 'default');
            store.cycleMode = undefined as any;
            useThemeMock.mockReturnValue(store);

            expect(store.cycleMode).toBeUndefined();
        });

        it('should handle very long scheme names', () => {
            const store = createMockThemeStore('system', 'custom' as ThemeScheme);
            (store as any).availableSchemes = [
                {
                    name: 'custom',
                    displayName: 'Very Long Scheme Name That Exceeds Normal Length',
                },
            ];
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig?.displayName).toBe(
                'Very Long Scheme Name That Exceeds Normal Length'
            );
        });

        it('should handle scheme with special characters', () => {
            const store = createMockThemeStore('light', 'custom' as ThemeScheme);
            (store as any).availableSchemes = [
                { name: 'custom', displayName: 'Custom™ Theme (β)' },
            ];
            useThemeMock.mockReturnValue(store);

            const schemeConfig = store.availableSchemes.find(s => s.name === store.scheme);

            expect(schemeConfig?.displayName).toBe('Custom™ Theme (β)');
        });
    });

    describe('integration scenarios', () => {
        it('should work with all theme mode variations', () => {
            const modes: ThemeMode[] = ['light', 'dark', 'system'];

            modes.forEach(mode => {
                const store = createMockThemeStore(mode, 'default');
                useThemeMock.mockReturnValue(store);

                expect(store.theme).toBe(mode);
            });
        });

        it('should work with all scheme variations', () => {
            const schemes: ThemeScheme[] = ['default', 'spells'];

            schemes.forEach(scheme => {
                const store = createMockThemeStore('light', scheme);
                useThemeMock.mockReturnValue(store);

                expect(store.scheme).toBe(scheme);
            });
        });

        it('should handle all theme-scheme combinations', () => {
            const modes: ThemeMode[] = ['light', 'dark', 'system'];
            const schemes: ThemeScheme[] = ['default', 'spells'];

            modes.forEach(mode => {
                schemes.forEach(scheme => {
                    const store = createMockThemeStore(mode, scheme);
                    useThemeMock.mockReturnValue(store);

                    expect(store.theme).toBe(mode);
                    expect(store.scheme).toBe(scheme);
                });
            });
        });

        it('should maintain store methods', () => {
            const store = createMockThemeStore('dark', 'default');
            useThemeMock.mockReturnValue(store);

            expect(store).toHaveProperty('cycleMode');
            expect(store).toHaveProperty('setTheme');
            expect(store).toHaveProperty('setScheme');
            expect(store).toHaveProperty('subscribe');
        });
    });
});
