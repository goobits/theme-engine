/**
 * Tests for DOM Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getHtmlElement,
    removeSchemeClasses,
    removeThemeClasses,
    applyThemeClass,
    applySchemeClass,
    setDataThemeAttribute,
    getDataThemeAttribute,
} from './dom';

// Mock the $app/environment module
vi.mock('$app/environment', () => ({
    browser: false,
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
    const module = await import('$app/environment');
    vi.mocked(module).browser = isBrowser;
}

// Helper to create a mock HTML element
function createMockElement(): HTMLElement {
    const element = document.createElement('html');
    return element;
}

describe('getHtmlElement', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return null when not in browser', () => {
            const result = getHtmlElement();
            expect(result).toBeNull();
        });

        it('should not throw error on server', () => {
            expect(() => getHtmlElement()).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return document.documentElement in browser', () => {
            const result = getHtmlElement();
            expect(result).toBe(document.documentElement);
        });

        it('should return an HTMLElement', () => {
            const result = getHtmlElement();
            expect(result).toBeInstanceOf(HTMLElement);
        });

        it('should return the same element on multiple calls', () => {
            const result1 = getHtmlElement();
            const result2 = getHtmlElement();
            expect(result1).toBe(result2);
        });
    });
});

describe('removeSchemeClasses', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should remove single scheme class', () => {
        element.classList.add('scheme-default');
        removeSchemeClasses(element, ['default']);

        expect(element.classList.contains('scheme-default')).toBe(false);
    });

    it('should remove multiple scheme classes', () => {
        element.classList.add('scheme-default', 'scheme-spells', 'scheme-ocean');
        removeSchemeClasses(element, ['default', 'spells', 'ocean']);

        expect(element.classList.contains('scheme-default')).toBe(false);
        expect(element.classList.contains('scheme-spells')).toBe(false);
        expect(element.classList.contains('scheme-ocean')).toBe(false);
    });

    it('should only remove specified scheme classes', () => {
        element.classList.add('scheme-default', 'scheme-spells', 'other-class');
        removeSchemeClasses(element, ['default']);

        expect(element.classList.contains('scheme-default')).toBe(false);
        expect(element.classList.contains('scheme-spells')).toBe(true);
        expect(element.classList.contains('other-class')).toBe(true);
    });

    it('should handle empty scheme names array', () => {
        element.classList.add('scheme-default');
        removeSchemeClasses(element, []);

        expect(element.classList.contains('scheme-default')).toBe(true);
    });

    it('should not throw when removing non-existent classes', () => {
        expect(() => removeSchemeClasses(element, ['nonexistent'])).not.toThrow();
    });

    it('should preserve non-scheme classes', () => {
        element.classList.add('scheme-default', 'theme-dark', 'custom-class');
        removeSchemeClasses(element, ['default', 'spells']);

        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('custom-class')).toBe(true);
    });
});

describe('removeThemeClasses', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should remove theme-light class', () => {
        element.classList.add('theme-light');
        removeThemeClasses(element);

        expect(element.classList.contains('theme-light')).toBe(false);
    });

    it('should remove theme-dark class', () => {
        element.classList.add('theme-dark');
        removeThemeClasses(element);

        expect(element.classList.contains('theme-dark')).toBe(false);
    });

    it('should remove theme-system class', () => {
        element.classList.add('theme-system');
        removeThemeClasses(element);

        expect(element.classList.contains('theme-system')).toBe(false);
    });

    it('should remove theme-system-light class', () => {
        element.classList.add('theme-system-light');
        removeThemeClasses(element);

        expect(element.classList.contains('theme-system-light')).toBe(false);
    });

    it('should remove theme-system-dark class', () => {
        element.classList.add('theme-system-dark');
        removeThemeClasses(element);

        expect(element.classList.contains('theme-system-dark')).toBe(false);
    });

    it('should remove all theme classes at once', () => {
        element.classList.add(
            'theme-light',
            'theme-dark',
            'theme-system',
            'theme-system-light',
            'theme-system-dark'
        );
        removeThemeClasses(element);

        expect(element.classList.contains('theme-light')).toBe(false);
        expect(element.classList.contains('theme-dark')).toBe(false);
        expect(element.classList.contains('theme-system')).toBe(false);
        expect(element.classList.contains('theme-system-light')).toBe(false);
        expect(element.classList.contains('theme-system-dark')).toBe(false);
    });

    it('should preserve non-theme classes', () => {
        element.classList.add('theme-dark', 'scheme-default', 'custom-class');
        removeThemeClasses(element);

        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(element.classList.contains('custom-class')).toBe(true);
    });

    it('should not throw when element has no theme classes', () => {
        expect(() => removeThemeClasses(element)).not.toThrow();
    });
});

describe('applyThemeClass', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should apply theme-light class', () => {
        applyThemeClass(element, 'light');

        expect(element.classList.contains('theme-light')).toBe(true);
    });

    it('should apply theme-dark class', () => {
        applyThemeClass(element, 'dark');

        expect(element.classList.contains('theme-dark')).toBe(true);
    });

    it('should remove existing theme classes before applying new one', () => {
        element.classList.add('theme-dark', 'theme-system');
        applyThemeClass(element, 'light');

        expect(element.classList.contains('theme-light')).toBe(true);
        expect(element.classList.contains('theme-dark')).toBe(false);
        expect(element.classList.contains('theme-system')).toBe(false);
    });

    it('should switch from light to dark', () => {
        applyThemeClass(element, 'light');
        expect(element.classList.contains('theme-light')).toBe(true);

        applyThemeClass(element, 'dark');
        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('theme-light')).toBe(false);
    });

    it('should switch from dark to light', () => {
        applyThemeClass(element, 'dark');
        expect(element.classList.contains('theme-dark')).toBe(true);

        applyThemeClass(element, 'light');
        expect(element.classList.contains('theme-light')).toBe(true);
        expect(element.classList.contains('theme-dark')).toBe(false);
    });

    it('should preserve non-theme classes', () => {
        element.classList.add('scheme-default', 'custom-class');
        applyThemeClass(element, 'dark');

        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(element.classList.contains('custom-class')).toBe(true);
    });

    it('should handle applying same theme multiple times', () => {
        applyThemeClass(element, 'dark');
        applyThemeClass(element, 'dark');

        expect(element.classList.contains('theme-dark')).toBe(true);
        // Should still only have one instance of the class
        expect(Array.from(element.classList).filter(c => c === 'theme-dark')).toHaveLength(1);
    });
});

describe('applySchemeClass', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should apply scheme-default class', () => {
        applySchemeClass(element, 'default');

        expect(element.classList.contains('scheme-default')).toBe(true);
    });

    it('should apply scheme-spells class', () => {
        applySchemeClass(element, 'spells');

        expect(element.classList.contains('scheme-spells')).toBe(true);
    });

    it('should apply custom scheme class', () => {
        applySchemeClass(element, 'ocean');

        expect(element.classList.contains('scheme-ocean')).toBe(true);
    });

    it('should NOT remove existing scheme classes', () => {
        element.classList.add('scheme-default');
        applySchemeClass(element, 'spells');

        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(element.classList.contains('scheme-spells')).toBe(true);
    });

    it('should preserve other classes', () => {
        element.classList.add('theme-dark', 'custom-class');
        applySchemeClass(element, 'default');

        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('custom-class')).toBe(true);
    });

    it('should handle applying same scheme multiple times', () => {
        applySchemeClass(element, 'default');
        applySchemeClass(element, 'default');

        expect(element.classList.contains('scheme-default')).toBe(true);
        // Should still only have one instance of the class
        expect(Array.from(element.classList).filter(c => c === 'scheme-default')).toHaveLength(1);
    });

    it('should work with scheme names containing special characters', () => {
        applySchemeClass(element, 'ocean-blue');

        expect(element.classList.contains('scheme-ocean-blue')).toBe(true);
    });
});

describe('setDataThemeAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should set data-theme to light', () => {
        setDataThemeAttribute(element, 'light');

        expect(element.dataset.theme).toBe('light');
        expect(element.getAttribute('data-theme')).toBe('light');
    });

    it('should set data-theme to dark', () => {
        setDataThemeAttribute(element, 'dark');

        expect(element.dataset.theme).toBe('dark');
        expect(element.getAttribute('data-theme')).toBe('dark');
    });

    it('should overwrite existing data-theme value', () => {
        element.dataset.theme = 'light';
        setDataThemeAttribute(element, 'dark');

        expect(element.dataset.theme).toBe('dark');
    });

    it('should handle empty string value', () => {
        setDataThemeAttribute(element, '');

        expect(element.dataset.theme).toBe('');
        expect(element.hasAttribute('data-theme')).toBe(true);
    });

    it('should handle custom theme values', () => {
        setDataThemeAttribute(element, 'custom-theme');

        expect(element.dataset.theme).toBe('custom-theme');
    });

    it('should update data-theme multiple times', () => {
        setDataThemeAttribute(element, 'light');
        expect(element.dataset.theme).toBe('light');

        setDataThemeAttribute(element, 'dark');
        expect(element.dataset.theme).toBe('dark');

        setDataThemeAttribute(element, 'light');
        expect(element.dataset.theme).toBe('light');
    });
});

describe('getDataThemeAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = createMockElement();
    });

    it('should return null when data-theme is not set', () => {
        const result = getDataThemeAttribute(element);

        expect(result).toBeNull();
    });

    it('should return light when data-theme is light', () => {
        element.dataset.theme = 'light';
        const result = getDataThemeAttribute(element);

        expect(result).toBe('light');
    });

    it('should return dark when data-theme is dark', () => {
        element.dataset.theme = 'dark';
        const result = getDataThemeAttribute(element);

        expect(result).toBe('dark');
    });

    it('should return custom theme value', () => {
        element.dataset.theme = 'custom-theme';
        const result = getDataThemeAttribute(element);

        expect(result).toBe('custom-theme');
    });

    it('should return empty string when data-theme is empty', () => {
        element.dataset.theme = '';
        const result = getDataThemeAttribute(element);

        expect(result).toBe('');
    });

    it('should track changes made by setDataThemeAttribute', () => {
        setDataThemeAttribute(element, 'dark');
        const result = getDataThemeAttribute(element);

        expect(result).toBe('dark');
    });
});

describe('integration tests', () => {
    let element: HTMLElement;

    beforeEach(async () => {
        await setBrowserMode(true);
        element = createMockElement();
    });

    it('should apply complete theme setup with scheme and data attribute', () => {
        // Remove existing classes and apply new theme
        removeThemeClasses(element);
        removeSchemeClasses(element, ['default', 'spells']);
        applyThemeClass(element, 'dark');
        applySchemeClass(element, 'spells');
        setDataThemeAttribute(element, 'dark');

        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('scheme-spells')).toBe(true);
        expect(getDataThemeAttribute(element)).toBe('dark');
    });

    it('should switch complete theme configuration', () => {
        // Initial setup
        applyThemeClass(element, 'light');
        applySchemeClass(element, 'default');
        setDataThemeAttribute(element, 'light');

        expect(element.classList.contains('theme-light')).toBe(true);
        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(getDataThemeAttribute(element)).toBe('light');

        // Switch to dark theme with spells scheme
        removeSchemeClasses(element, ['default', 'spells']);
        applyThemeClass(element, 'dark');
        applySchemeClass(element, 'spells');
        setDataThemeAttribute(element, 'dark');

        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('theme-light')).toBe(false);
        expect(element.classList.contains('scheme-spells')).toBe(true);
        expect(element.classList.contains('scheme-default')).toBe(false);
        expect(getDataThemeAttribute(element)).toBe('dark');
    });

    it('should work with document.documentElement in browser', () => {
        const html = getHtmlElement();
        expect(html).not.toBeNull();

        if (html) {
            // Clean slate
            removeThemeClasses(html);
            removeSchemeClasses(html, ['default', 'spells']);

            // Apply theme
            applyThemeClass(html, 'dark');
            applySchemeClass(html, 'default');
            setDataThemeAttribute(html, 'dark');

            expect(html.classList.contains('theme-dark')).toBe(true);
            expect(html.classList.contains('scheme-default')).toBe(true);
            expect(getDataThemeAttribute(html)).toBe('dark');

            // Cleanup
            removeThemeClasses(html);
            removeSchemeClasses(html, ['default', 'spells']);
            html.removeAttribute('data-theme');
        }
    });

    it('should handle rapid theme changes', () => {
        const schemes = ['default', 'spells', 'ocean'];

        // Rapid theme switching
        for (let i = 0; i < 10; i++) {
            const theme = i % 2 === 0 ? 'light' : 'dark';
            const scheme = schemes[i % schemes.length];

            removeSchemeClasses(element, schemes);
            applyThemeClass(element, theme);
            applySchemeClass(element, scheme);
            setDataThemeAttribute(element, theme);
        }

        // Final state should be dark with default scheme (i=9: 9%2=1 => dark, 9%3=0 => default)
        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('theme-light')).toBe(false);
        expect(element.classList.contains('scheme-default')).toBe(true);
        expect(getDataThemeAttribute(element)).toBe('dark');

        // Should not have duplicate classes
        const classList = Array.from(element.classList);
        const themeClasses = classList.filter(c => c.startsWith('theme-'));
        const schemeClasses = classList.filter(c => c.startsWith('scheme-'));

        expect(themeClasses).toHaveLength(1);
        expect(schemeClasses).toHaveLength(1);
    });

    it('should preserve custom classes during theme operations', () => {
        element.classList.add('custom-class-1', 'custom-class-2', 'no-transitions');

        // Apply theme configuration
        applyThemeClass(element, 'dark');
        applySchemeClass(element, 'spells');
        setDataThemeAttribute(element, 'dark');

        // Custom classes should be preserved
        expect(element.classList.contains('custom-class-1')).toBe(true);
        expect(element.classList.contains('custom-class-2')).toBe(true);
        expect(element.classList.contains('no-transitions')).toBe(true);

        // Theme classes should be applied
        expect(element.classList.contains('theme-dark')).toBe(true);
        expect(element.classList.contains('scheme-spells')).toBe(true);
    });
});
