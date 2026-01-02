/**
 * Tests for Browser Environment Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    isBrowser,
    safeWindow,
    safeDocument,
    getHtmlElement,
    runInBrowser,
    requireBrowser,
} from './browser';

// Mock the $app/environment module
vi.mock('$app/environment', () => ({
    browser: false,
}));

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
    const module = await import('$app/environment');
    vi.mocked(module).browser = isBrowser;
}

describe('isBrowser', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return false when not in browser', () => {
            const result = isBrowser();
            expect(result).toBe(false);
        });

        it('should return false even if window is defined', () => {
            // window exists in test environment, but browser flag is false
            expect(typeof window).not.toBe('undefined');
            expect(isBrowser()).toBe(false);
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return true when in browser', () => {
            const result = isBrowser();
            expect(result).toBe(true);
        });

        it('should return true when both browser flag and window are available', () => {
            expect(typeof window).not.toBe('undefined');
            expect(isBrowser()).toBe(true);
        });
    });
});

describe('safeWindow', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return undefined when not in browser', () => {
            const result = safeWindow();
            expect(result).toBeUndefined();
        });

        it('should not throw error when called on server', () => {
            expect(() => safeWindow()).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return window object when in browser', () => {
            const result = safeWindow();
            expect(result).toBe(window);
        });

        it('should return object with window properties', () => {
            const result = safeWindow();
            expect(result).toBeDefined();
            expect(result).toHaveProperty('document');
            expect(result).toHaveProperty('location');
            expect(result).toHaveProperty('navigator');
        });

        it('should allow access to window methods', () => {
            const result = safeWindow();
            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.addEventListener).toBe('function');
                expect(typeof result.removeEventListener).toBe('function');
            }
        });
    });
});

describe('safeDocument', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return undefined when not in browser', () => {
            const result = safeDocument();
            expect(result).toBeUndefined();
        });

        it('should not throw error when called on server', () => {
            expect(() => safeDocument()).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return document object when in browser', () => {
            const result = safeDocument();
            expect(result).toBe(document);
        });

        it('should return object with document properties', () => {
            const result = safeDocument();
            expect(result).toBeDefined();
            expect(result).toHaveProperty('body');
            expect(result).toHaveProperty('documentElement');
            expect(result).toHaveProperty('cookie');
        });

        it('should allow access to document methods', () => {
            const result = safeDocument();
            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.querySelector).toBe('function');
                expect(typeof result.getElementById).toBe('function');
                expect(typeof result.createElement).toBe('function');
            }
        });
    });
});

describe('getHtmlElement', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return undefined when not in browser', () => {
            const result = getHtmlElement();
            expect(result).toBeUndefined();
        });

        it('should not throw error when called on server', () => {
            expect(() => getHtmlElement()).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return documentElement when in browser', () => {
            const result = getHtmlElement();
            expect(result).toBe(document.documentElement);
        });

        it('should return html element', () => {
            const result = getHtmlElement();
            expect(result).toBeDefined();
            expect(result?.tagName).toBe('HTML');
        });

        it('should allow access to html element methods', () => {
            const result = getHtmlElement();
            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.setAttribute).toBe('function');
                expect(typeof result.getAttribute).toBe('function');
                expect(typeof result.classList.add).toBe('function');
            }
        });

        it('should allow setting attributes on html element', () => {
            const result = getHtmlElement();
            expect(result).toBeDefined();
            if (result) {
                result.setAttribute('data-test', 'value');
                expect(result.getAttribute('data-test')).toBe('value');
            }
        });
    });
});

describe('runInBrowser', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return undefined when not in browser', () => {
            const result = runInBrowser(() => 'test');
            expect(result).toBeUndefined();
        });

        it('should not execute callback when not in browser', () => {
            const callback = vi.fn(() => 'test');
            runInBrowser(callback);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should not execute side effects when not in browser', () => {
            let sideEffect = false;
            runInBrowser(() => {
                sideEffect = true;
            });
            expect(sideEffect).toBe(false);
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should execute callback when in browser', () => {
            const callback = vi.fn(() => 'test');
            runInBrowser(callback);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should return callback result when in browser', () => {
            const result = runInBrowser(() => 'test value');
            expect(result).toBe('test value');
        });

        it('should handle callbacks returning numbers', () => {
            const result = runInBrowser(() => 42);
            expect(result).toBe(42);
        });

        it('should handle callbacks returning objects', () => {
            const obj = { theme: 'dark', mode: 'system' };
            const result = runInBrowser(() => obj);
            expect(result).toEqual(obj);
        });

        it('should handle callbacks returning arrays', () => {
            const arr = [1, 2, 3];
            const result = runInBrowser(() => arr);
            expect(result).toEqual(arr);
        });

        it('should handle callbacks returning boolean', () => {
            const resultTrue = runInBrowser(() => true);
            const resultFalse = runInBrowser(() => false);
            expect(resultTrue).toBe(true);
            expect(resultFalse).toBe(false);
        });

        it('should handle callbacks returning null', () => {
            const result = runInBrowser(() => null);
            expect(result).toBeNull();
        });

        it('should handle callbacks with no return value', () => {
            const result = runInBrowser(() => {
                // Side effect only, no return
            });
            expect(result).toBeUndefined();
        });

        it('should execute side effects in callback', () => {
            let sideEffect = 0;
            runInBrowser(() => {
                sideEffect = 42;
            });
            expect(sideEffect).toBe(42);
        });

        it('should handle callbacks that access window', () => {
            const result = runInBrowser(() => window.location.href);
            expect(typeof result).toBe('string');
        });

        it('should handle callbacks that access document', () => {
            const result = runInBrowser(() => document.documentElement.tagName);
            expect(result).toBe('HTML');
        });

        it('should preserve callback context', () => {
            const context = {
                value: 'test',
                getValue() {
                    return this.value;
                },
            };
            const result = runInBrowser(() => context.getValue());
            expect(result).toBe('test');
        });
    });

    describe('edge cases', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should handle callbacks that throw errors', () => {
            expect(() => {
                runInBrowser(() => {
                    throw new Error('Test error');
                });
            }).toThrow('Test error');
        });

        it('should handle async-looking callbacks (but not awaited)', () => {
            const result = runInBrowser(() => Promise.resolve('value'));
            expect(result).toBeInstanceOf(Promise);
        });
    });
});

describe('requireBrowser', () => {
    describe('server-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(false);
        });

        it('should return fallback when not in browser', () => {
            const fallback = 'default value';
            const result = requireBrowser(fallback);
            expect(result).toBe(fallback);
        });

        it('should return fallback object when not in browser', () => {
            const fallback = { theme: 'system', lang: 'en' };
            const result = requireBrowser(fallback);
            expect(result).toEqual(fallback);
        });

        it('should return fallback null when not in browser', () => {
            const result = requireBrowser(null);
            expect(result).toBeNull();
        });

        it('should return fallback undefined when not in browser', () => {
            const result = requireBrowser(undefined);
            expect(result).toBeUndefined();
        });

        it('should return fallback number when not in browser', () => {
            const result = requireBrowser(42);
            expect(result).toBe(42);
        });

        it('should return fallback boolean when not in browser', () => {
            const resultTrue = requireBrowser(true);
            const resultFalse = requireBrowser(false);
            expect(resultTrue).toBe(true);
            expect(resultFalse).toBe(false);
        });

        it('should return fallback array when not in browser', () => {
            const fallback = [1, 2, 3];
            const result = requireBrowser(fallback);
            expect(result).toEqual(fallback);
        });
    });

    describe('client-side behavior', () => {
        beforeEach(async () => {
            await setBrowserMode(true);
        });

        it('should return null when in browser', () => {
            const result = requireBrowser('fallback');
            expect(result).toBeNull();
        });

        it('should return null regardless of fallback type', () => {
            expect(requireBrowser('string')).toBeNull();
            expect(requireBrowser(42)).toBeNull();
            expect(requireBrowser(true)).toBeNull();
            expect(requireBrowser({ key: 'value' })).toBeNull();
            expect(requireBrowser([1, 2, 3])).toBeNull();
        });
    });

    describe('guard pattern usage', () => {
        it('should enable early return pattern on server', async () => {
            await setBrowserMode(false);

            function getTheme(): string {
                const guard = requireBrowser('system');
                if (guard !== null) return guard;
                // Browser-only code would continue here
                return 'dark';
            }

            const result = getTheme();
            expect(result).toBe('system');
        });

        it('should allow continuation in browser', async () => {
            await setBrowserMode(true);

            function getTheme(): string {
                const guard = requireBrowser('system');
                if (guard !== null) return guard;
                // Browser code continues
                return 'dark';
            }

            const result = getTheme();
            expect(result).toBe('dark');
        });

        it('should work with object fallbacks', async () => {
            await setBrowserMode(false);

            function getPrefs(): { theme: string; lang: string } {
                const guard = requireBrowser({ theme: 'system', lang: 'en' });
                if (guard !== null) return guard;
                // Browser code would read from localStorage
                return { theme: 'dark', lang: 'fr' };
            }

            const result = getPrefs();
            expect(result).toEqual({ theme: 'system', lang: 'en' });
        });

        it('should work with empty string fallbacks', async () => {
            await setBrowserMode(false);

            function getValue(): string {
                const guard = requireBrowser('');
                if (guard !== null) return guard;
                // Browser code continues
                return 'value';
            }

            const result = getValue();
            expect(result).toBe('');
        });
    });
});

describe('integration tests', () => {
    beforeEach(async () => {
        await setBrowserMode(true);
    });

    it('should work together for safe DOM access', () => {
        if (isBrowser()) {
            const win = safeWindow();
            const doc = safeDocument();
            const html = getHtmlElement();

            expect(win).toBeDefined();
            expect(doc).toBeDefined();
            expect(html).toBeDefined();
        }
    });

    it('should work together in a typical theme utility function', () => {
        function setThemeAttribute(theme: string): void {
            const guard = requireBrowser(undefined);
            if (guard !== null) return;

            const html = getHtmlElement();
            if (html) {
                html.setAttribute('data-theme', theme);
            }
        }

        setThemeAttribute('dark');
        const html = getHtmlElement();
        expect(html?.getAttribute('data-theme')).toBe('dark');
    });

    it('should work together for localStorage access', () => {
        const value = runInBrowser(() => {
            const doc = safeDocument();
            if (doc) {
                return doc.documentElement.tagName;
            }
            return null;
        });

        expect(value).toBe('HTML');
    });

    it('should provide consistent browser detection', () => {
        const check1 = isBrowser();
        const check2 = safeWindow() !== undefined;
        const check3 = safeDocument() !== undefined;
        const check4 = getHtmlElement() !== undefined;
        const check5 = requireBrowser('fallback') === null;

        // All should agree on browser state
        expect(check1).toBe(check2);
        expect(check2).toBe(check3);
        expect(check3).toBe(check4);
        expect(check4).toBe(check5);
    });
});

describe('type safety', () => {
    beforeEach(async () => {
        await setBrowserMode(true);
    });

    it('should preserve return types in runInBrowser', () => {
        const stringResult = runInBrowser(() => 'string');
        const numberResult = runInBrowser(() => 42);
        const booleanResult = runInBrowser(() => true);
        const objectResult = runInBrowser(() => ({ key: 'value' }));
        const arrayResult = runInBrowser(() => [1, 2, 3]);

        // TypeScript should infer correct types (testing runtime values)
        expect(typeof stringResult).toBe('string');
        expect(typeof numberResult).toBe('number');
        expect(typeof booleanResult).toBe('boolean');
        expect(typeof objectResult).toBe('object');
        expect(Array.isArray(arrayResult)).toBe(true);
    });

    it('should handle complex generic types in runInBrowser', () => {
        interface Theme {
            mode: 'light' | 'dark' | 'system';
            scheme: string;
        }

        const theme = runInBrowser(
            (): Theme => ({
                mode: 'dark',
                scheme: 'default',
            })
        );

        expect(theme).toEqual({ mode: 'dark', scheme: 'default' });
    });

    it('should preserve fallback types in requireBrowser', () => {
        interface Config {
            theme: string;
            lang: string;
        }

        const config: Config = { theme: 'system', lang: 'en' };
        const result = requireBrowser(config);

        // Result is either Config or null
        if (result !== null) {
            expect(result).toEqual(config);
        }
    });
});
