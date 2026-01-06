import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
    // JavaScript recommended rules
    js.configs.recommended,

    // Shared stylistic rules (no Prettier)
    {
        plugins: {
            '@stylistic': stylistic,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/comma-dangle': ['error', 'never'],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/array-bracket-spacing': ['error', 'always'],
            '@stylistic/template-curly-spacing': ['error', 'always'],
            '@stylistic/arrow-parens': ['error', 'as-needed'],
            '@stylistic/space-before-function-paren': ['error', 'never'],
            '@stylistic/lines-around-comment': [
                'error',
                {
                    beforeLineComment: true,
                    allowBlockStart: true,
                    allowClassStart: true,
                    allowObjectStart: true,
                    allowArrayStart: true,
                },
            ],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },

    // TypeScript files configuration
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 2022,
                sourceType: 'module',
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Event: 'readonly',
                // Svelte 5 runes (for .svelte.ts files)
                $state: 'readonly',
                $derived: 'readonly',
                $effect: 'readonly',
                $props: 'readonly',
                $bindable: 'readonly',
                $inspect: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
        },
    },

    // Svelte files configuration
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.svelte'],
                ecmaVersion: 2022,
                sourceType: 'module',
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Event: 'readonly',
                // Svelte 5 runes
                $state: 'readonly',
                $derived: 'readonly',
                $effect: 'readonly',
                $props: 'readonly',
                $bindable: 'readonly',
                $inspect: 'readonly',
            },
        },
        plugins: {
            svelte: sveltePlugin,
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules,
            'svelte/no-at-html-tags': 'error',
            'svelte/no-target-blank': 'error',
            'svelte/valid-compile': 'error',
        },
    },

    // Test files - relax some rules
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },

    // Logger utility - allow any types for console wrapper
    {
        files: ['utils/logger.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    // Global ignores
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            '.svelte-kit/',
            'coverage/',
            '**/*.config.js',
            '**/*.config.ts',
            'demo/',
            'test/mocks/',
        ],
    },
];
