/**
 * Tests for Theme Configuration Factory
 *
 * Tests validation, normalization, and default application for theme configurations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createThemeConfig } from './config';
import type { ThemeConfig } from './config';

// Mock esm-env to enable DEV mode for testing
vi.mock('esm-env', () => ({
    DEV: true,
}));

describe('createThemeConfig', () => {
    let consoleWarnSpy: any;

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it('should return config with all fields when fully specified', () => {
        const config: ThemeConfig = {
            schemes: {
                default: {
                    name: 'default',
                    displayName: 'Default',
                    description: 'Default theme',
                    preview: {
                        primary: '#3b82f6',
                        accent: '#8b5cf6',
                        background: '#ffffff',
                    },
                },
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.default).toEqual({
            name: 'default',
            displayName: 'Default',
            description: 'Default theme',
            preview: {
                primary: '#3b82f6',
                accent: '#8b5cf6',
                background: '#ffffff',
            },
        });
    });

    it('should apply defaults for minimal config with empty object', () => {
        const config: ThemeConfig = {
            schemes: {
                default: {} as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.default).toEqual({
            name: 'default',
            displayName: 'Default', // Capitalized name
            description: '', // Empty string
            preview: {
                primary: '#3b82f6', // Default blue theme
                accent: '#8b5cf6',
                background: '#ffffff',
            },
        });
    });

    it('should capitalize scheme name for displayName default', () => {
        const config: ThemeConfig = {
            schemes: {
                ocean: {} as any,
                darkMode: {} as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.ocean.displayName).toBe('Ocean');
        expect(result.schemes.darkMode.displayName).toBe('DarkMode');
    });

    it('should use provided displayName when specified', () => {
        const config: ThemeConfig = {
            schemes: {
                ocean: {
                    displayName: 'Ocean Theme',
                } as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.ocean.displayName).toBe('Ocean Theme');
    });

    it('should use provided description when specified', () => {
        const config: ThemeConfig = {
            schemes: {
                ocean: {
                    description: 'A calming ocean theme',
                } as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.ocean.description).toBe('A calming ocean theme');
    });

    it('should use provided preview colors when specified', () => {
        const config: ThemeConfig = {
            schemes: {
                ocean: {
                    preview: {
                        primary: '#0ea5e9',
                        accent: '#06b6d4',
                        background: '#f0f9ff',
                    },
                } as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.ocean.preview).toEqual({
            primary: '#0ea5e9',
            accent: '#06b6d4',
            background: '#f0f9ff',
        });
    });

    it('should preserve optional fields when provided', () => {
        const config: ThemeConfig = {
            schemes: {
                spells: {
                    icon: '✨',
                    title: 'Magical Theme',
                    cssFile: '/themes/spells.css',
                } as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.spells.icon).toBe('✨');
        expect(result.schemes.spells.title).toBe('Magical Theme');
        expect(result.schemes.spells.cssFile).toBe('/themes/spells.css');
    });

    it('should use key as source of truth when name field differs', () => {
        const config: ThemeConfig = {
            schemes: {
                ocean: {
                    name: 'sea', // Different from key
                } as any,
            },
        };

        const result = createThemeConfig(config);

        expect(result.schemes.ocean.name).toBe('ocean'); // Uses key, not provided name
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            '[svelte-themes]',
            expect.stringContaining("doesn't match scheme.name")
        );
    });

    it('should handle multiple schemes with mixed configurations', () => {
        const config: ThemeConfig = {
            schemes: {
                default: {} as any,
                custom: {
                    displayName: 'Custom Theme',
                    preview: {
                        primary: '#ec4899',
                        accent: '#f472b6',
                        background: '#fce7f3',
                    },
                } as any,
                full: {
                    name: 'full',
                    displayName: 'Full Theme',
                    description: 'Complete configuration',
                    preview: {
                        primary: '#10b981',
                        accent: '#34d399',
                        background: '#ecfdf5',
                    },
                    icon: '🌟',
                },
            },
        };

        const result = createThemeConfig(config);

        // Minimal scheme with all defaults
        expect(result.schemes.default.displayName).toBe('Default');
        expect(result.schemes.default.description).toBe('');

        // Partial scheme with some customization
        expect(result.schemes.custom.displayName).toBe('Custom Theme');
        expect(result.schemes.custom.description).toBe(''); // Default
        expect(result.schemes.custom.preview.primary).toBe('#ec4899');

        // Full scheme with everything specified
        expect(result.schemes.full.displayName).toBe('Full Theme');
        expect(result.schemes.full.description).toBe('Complete configuration');
        expect(result.schemes.full.icon).toBe('🌟');
    });

    it('should preserve routeThemes unchanged', () => {
        const config: ThemeConfig = {
            schemes: {
                default: {} as any,
            },
            routeThemes: {
                '/dashboard': {
                    theme: { base: 'dark', scheme: 'default' },
                    override: true,
                },
            },
        };

        const result = createThemeConfig(config);

        expect(result.routeThemes).toEqual(config.routeThemes);
    });

    it('should warn about invalid preview colors but use defaults', () => {
        const config: ThemeConfig = {
            schemes: {
                invalid: {
                    preview: {
                        primary: '#fff', // Invalid 3-digit hex
                        accent: 'blue', // Invalid format
                        background: '#ffffff',
                    },
                } as any,
            },
        };

        const result = createThemeConfig(config);

        // Should use defaults when colors are invalid
        expect(result.schemes.invalid.preview).toEqual({
            primary: '#3b82f6',
            accent: '#8b5cf6',
            background: '#ffffff',
        });

        expect(consoleWarnSpy).toHaveBeenCalled();
    });
});
