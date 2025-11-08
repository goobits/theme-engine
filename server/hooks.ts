import type { Handle } from "@sveltejs/kit";
import { loadThemePreferences } from "./preferences";
import type { ThemeConfig } from "../core/config";

export function createThemeHooks(config: ThemeConfig): { transform: Handle } {
  const themeTransform: Handle = async ({ event, resolve }) => {
    const preferences = loadThemePreferences(event.cookies, config);

    const response = await resolve(event, {
      transformPageChunk: ({ html }) => {
        let themeClasses = `theme-${preferences.theme} scheme-${preferences.themeScheme}`;

        if (preferences.theme === 'system') {
          const prefersColorScheme = event.request.headers.get('sec-ch-prefers-color-scheme');
          const userAgent = event.request.headers.get('user-agent')?.toLowerCase() || '';

          const likelyDarkMode = prefersColorScheme === 'dark' ||
                                 userAgent.includes('dark') ||
                                 false;

          themeClasses += likelyDarkMode ? ' theme-system-dark' : ' theme-system-light';
        }

        return html.replace('%sveltekit.theme%', themeClasses);
      }
    });

    return response;
  };

  return {
    transform: themeTransform,
  };
}
