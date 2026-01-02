/**
 * Blocking Script for Theme Initialization
 *
 * This script should be included in the <head> of your app.html before any stylesheets.
 * It synchronously detects the user's theme preference and applies classes to prevent
 * flash of unstyled content (FOUC) when using theme='system'.
 *
 * @module server/blocking-script
 *
 * @example
 * ```html
 * <!-- In app.html -->
 * <head>
 *   <script>
 *     // Paste the themeBlockingScript content here
 *   </script>
 *   %sveltekit.head%
 * </head>
 * ```
 *
 * @example
 * ```typescript
 * // Or import and use programmatically
 * import { themeBlockingScriptTag } from '@goobits/themes/server';
 * ```
 */

/**
 * Minified blocking script that detects theme preference before page render.
 *
 * This script:
 * 1. Reads theme from localStorage (theme-preferences key)
 * 2. Falls back to cookies if localStorage unavailable
 * 3. Detects system preference via matchMedia for 'system' theme
 * 4. Applies appropriate classes and data-theme attribute to <html>
 */
export const themeBlockingScript = `(function(){try{var d=document.documentElement,s=localStorage.getItem('theme-preferences'),p=s?JSON.parse(s):{},t=p.theme||(document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/)||[])[1]||'system',c=p.themeScheme||(document.cookie.match(/(?:^|;\\s*)themeScheme=([^;]*)/)||[])[1]||'default',r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}d.setAttribute('data-theme',r);d.className='theme-'+t+' scheme-'+c+(t==='system'?' theme-system-'+r:'')}catch(e){}})();`;

/**
 * Ready-to-use script tag containing the blocking script.
 * Can be injected directly into HTML.
 */
export const themeBlockingScriptTag = `<script>${themeBlockingScript}</script>`;

/**
 * Unminified version of the blocking script for debugging.
 * Use themeBlockingScript for production.
 */
export const themeBlockingScriptReadable = `
(function() {
  try {
    var html = document.documentElement;

    // Try localStorage first
    var stored = localStorage.getItem('theme-preferences');
    var prefs = stored ? JSON.parse(stored) : {};

    // Get theme from localStorage or cookies
    var theme = prefs.theme ||
      (document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/) || [])[1] ||
      'system';
    var scheme = prefs.themeScheme ||
      (document.cookie.match(/(?:^|;\\s*)themeScheme=([^;]*)/) || [])[1] ||
      'default';

    // Resolve system theme
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply to HTML element
    html.setAttribute('data-theme', resolved);
    html.className = 'theme-' + theme + ' scheme-' + scheme +
      (theme === 'system' ? ' theme-system-' + resolved : '');
  } catch(e) {
    // Fail silently - SSR classes will be used
  }
})();
`;
