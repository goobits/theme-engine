export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeScheme = 'default' | 'spells';

export interface FullTheme {
    base: ThemeMode;
    scheme: ThemeScheme;
}

export interface SchemeConfig {
    name: string;
    displayName: string;
    description: string;
    icon?: string;
    title?: string;
    preview: {
        primary: string;
        accent: string;
        background: string;
    };
    cssFile?: string;
}
