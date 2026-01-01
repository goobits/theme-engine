/**
 * DOM manipulation utilities for theme management.
 *
 * Provides safe, reusable functions for working with DOM elements,
 * CSS classes, and data attributes in a browser environment. All
 * functions safely handle server-side rendering by checking the
 * browser environment before accessing DOM APIs.
 *
 * @example
 * ```typescript
 * import { getHtmlElement, applyThemeClass } from './utils/dom';
 *
 * const html = getHtmlElement();
 * if (html) {
 *   applyThemeClass(html, 'dark');
 * }
 * ```
 */

import { browser } from '$app/environment';

/**
 * Safely retrieves the document's root HTML element.
 *
 * Returns the `document.documentElement` (HTML tag) when running in a browser
 * environment. Returns `null` in server-side rendering contexts to prevent
 * errors from accessing undefined browser APIs.
 *
 * @returns The HTML root element if in browser, `null` otherwise
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   html.classList.add('theme-dark');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Safe server-side usage
 * const html = getHtmlElement();
 * if (!html) {
 *   console.log('Running on server, skipping DOM manipulation');
 *   return;
 * }
 * ```
 *
 * @remarks
 * Always check if the return value is not `null` before using it to avoid
 * runtime errors in server-side contexts.
 */
export function getHtmlElement(): HTMLElement | null {
    if (!browser || typeof document === 'undefined') return null;
    return document.documentElement;
}

/**
 * Removes scheme-related CSS classes from an HTML element.
 *
 * When `schemeNames` is provided, removes only those specific scheme classes.
 * When `schemeNames` is omitted, removes ALL classes that start with `scheme-`.
 * This is useful for clearing existing scheme classes before applying a new one.
 *
 * @param element - The HTML element to modify (typically `document.documentElement`)
 * @param schemeNames - Optional array of scheme identifiers (e.g., `['default', 'spells']`)
 *                      If provided, removes classes like `scheme-default`, `scheme-spells`, etc.
 *                      If omitted, removes ALL `scheme-*` classes from the element.
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   // Remove specific scheme classes
 *   removeSchemeClasses(html, ['default', 'spells', 'ocean']);
 *
 *   // html element no longer has scheme-default, scheme-spells, or scheme-ocean classes
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Remove ALL scheme classes (recommended for extensibility)
 * const html = getHtmlElement();
 * if (html) {
 *   removeSchemeClasses(html); // Removes any scheme-* class
 *   html.classList.add('scheme-default');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Clean up before applying new scheme
 * const html = getHtmlElement();
 * const availableSchemes = ['default', 'spells'];
 * if (html) {
 *   removeSchemeClasses(html, availableSchemes);
 *   html.classList.add('scheme-default');
 * }
 * ```
 *
 * @remarks
 * This function modifies the element's classList directly and does not return
 * any value. Classes not present on the element are safely ignored.
 */
export function removeSchemeClasses(element: HTMLElement, schemeNames?: string[]): void {
    if (schemeNames) {
        // Remove specific schemes
        schemeNames.forEach(schemeName => {
            element.classList.remove(`scheme-${schemeName}`);
        });
    } else {
        // Remove ALL scheme-* classes
        Array.from(element.classList)
            .filter(cls => cls.startsWith('scheme-'))
            .forEach(cls => element.classList.remove(cls));
    }
}

/**
 * Removes all theme mode CSS classes from an HTML element.
 *
 * Clears the following theme-related classes from the element:
 * - `theme-light` (explicit light mode)
 * - `theme-dark` (explicit dark mode)
 * - `theme-system` (follows OS preference)
 * - `theme-system-light` (resolved system theme in light mode)
 * - `theme-system-dark` (resolved system theme in dark mode)
 *
 * This is typically called before applying a new theme to ensure clean state.
 *
 * @param element - The HTML element to modify (typically `document.documentElement`)
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   // Remove all existing theme classes
 *   removeThemeClasses(html);
 *
 *   // Now element has no theme-* classes
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Clean state before theme change
 * const html = getHtmlElement();
 * if (html) {
 *   removeThemeClasses(html);
 *   html.classList.add('theme-dark');
 * }
 * ```
 *
 * @remarks
 * This function removes all theme-related classes defined in the theme system.
 * It does not affect scheme classes or other CSS classes on the element.
 */
export function removeThemeClasses(element: HTMLElement): void {
    element.classList.remove(
        'theme-light',
        'theme-dark',
        'theme-system',
        'theme-system-light',
        'theme-system-dark'
    );
}

/**
 * Applies a theme mode CSS class to an HTML element.
 *
 * Removes any existing theme mode classes and then applies the specified
 * theme class (`theme-light` or `theme-dark`). This ensures the element
 * always has exactly one theme class active.
 *
 * @param element - The HTML element to modify (typically `document.documentElement`)
 * @param theme - The theme mode to apply: `'light'` or `'dark'`
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   // Apply dark theme
 *   applyThemeClass(html, 'dark');
 *   // Element now has 'theme-dark' class, all other theme classes removed
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Switch from dark to light
 * const html = getHtmlElement();
 * if (html) {
 *   applyThemeClass(html, 'light');
 *   // Element now has only 'theme-light' class
 * }
 * ```
 *
 * @remarks
 * This function automatically calls `removeThemeClasses` before applying the
 * new class to ensure clean state. It does not affect scheme classes or the
 * `data-theme` attribute.
 */
export function applyThemeClass(element: HTMLElement, theme: 'light' | 'dark'): void {
    removeThemeClasses(element);
    element.classList.add(`theme-${theme}`);
}

/**
 * Applies a scheme CSS class to an HTML element.
 *
 * Adds a scheme-specific class (formatted as `scheme-{name}`) to the element.
 * **Important:** This function does NOT remove existing scheme classes. If you
 * want to replace the current scheme, call `removeSchemeClasses` first.
 *
 * @param element - The HTML element to modify (typically `document.documentElement`)
 * @param scheme - The scheme identifier (e.g., `'default'`, `'spells'`, `'ocean'`)
 *                 Will be applied as `scheme-{scheme}` class
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   // Apply spells scheme (adds scheme-spells class)
 *   applySchemeClass(html, 'spells');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Replace existing scheme with new one
 * const html = getHtmlElement();
 * const schemes = ['default', 'spells', 'ocean'];
 * if (html) {
 *   removeSchemeClasses(html, schemes); // Remove all scheme classes
 *   applySchemeClass(html, 'ocean'); // Apply new scheme
 * }
 * ```
 *
 * @remarks
 * - Does NOT automatically remove existing scheme classes
 * - To switch schemes, first call `removeSchemeClasses` then this function
 * - The scheme name is used as-is to form the class name (`scheme-{scheme}`)
 */
export function applySchemeClass(element: HTMLElement, scheme: string): void {
    element.classList.add(`scheme-${scheme}`);
}

/**
 * Sets the `data-theme` attribute on an HTML element.
 *
 * Updates the element's `data-theme` attribute to the specified value.
 * This attribute is typically used for CSS targeting with attribute selectors
 * like `[data-theme="dark"]` and should always be set to the resolved theme
 * value (`"light"` or `"dark"`, never `"system"`).
 *
 * @param element - The HTML element to modify (typically `document.documentElement`)
 * @param theme - The theme value to set in the data attribute (e.g., `'light'`, `'dark'`)
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   // Set data-theme to dark
 *   setDataThemeAttribute(html, 'dark');
 *   // Element now has data-theme="dark"
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Resolve system theme to actual value
 * const html = getHtmlElement();
 * if (html) {
 *   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 *   const resolvedTheme = prefersDark ? 'dark' : 'light';
 *   setDataThemeAttribute(html, resolvedTheme);
 *   // data-theme is always "light" or "dark", never "system"
 * }
 * ```
 *
 * @remarks
 * - The `data-theme` attribute should always contain the resolved theme value
 * - Use `"light"` or `"dark"`, not `"system"`
 * - This attribute is commonly used in CSS selectors: `[data-theme="dark"] { ... }`
 */
export function setDataThemeAttribute(element: HTMLElement, theme: string): void {
    element.dataset.theme = theme;
}

/**
 * Retrieves the current `data-theme` attribute value from an HTML element.
 *
 * Reads the `data-theme` attribute which contains the resolved theme value
 * (typically `"light"` or `"dark"`). Returns `null` if the attribute is not set.
 *
 * @param element - The HTML element to read from (typically `document.documentElement`)
 * @returns The current theme value from the data attribute, or `null` if not set
 *
 * @example
 * ```typescript
 * const html = getHtmlElement();
 * if (html) {
 *   const currentTheme = getDataThemeAttribute(html);
 *   console.log(currentTheme); // "light", "dark", or null
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Check current theme before making changes
 * const html = getHtmlElement();
 * if (html) {
 *   const currentTheme = getDataThemeAttribute(html);
 *   if (currentTheme !== 'dark') {
 *     setDataThemeAttribute(html, 'dark');
 *   }
 * }
 * ```
 *
 * @remarks
 * - Returns `null` if the attribute is not set or doesn't exist
 * - The attribute typically contains `"light"` or `"dark"`, never `"system"`
 * - Use this to read the resolved theme value, not the user's preference
 */
export function getDataThemeAttribute(element: HTMLElement): string | null {
    return element.dataset.theme ?? null;
}
