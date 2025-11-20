import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleLogSpy = vi.spyOn(globalThis.console, 'log').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(globalThis.console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('info', () => {
        it('should call console.log with prefix and message', () => {
            logger.info('Test message');
            expect(consoleLogSpy).toHaveBeenCalledWith('[svelte-themes]', 'Test message');
        });

        it('should handle multiple arguments', () => {
            logger.info('Message 1', 'Message 2', 123);
            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[svelte-themes]',
                'Message 1',
                'Message 2',
                123
            );
        });

        it('should handle objects', () => {
            const obj = { key: 'value' };
            logger.info('Object:', obj);
            expect(consoleLogSpy).toHaveBeenCalledWith('[svelte-themes]', 'Object:', obj);
        });
    });

    describe('debug', () => {
        it('should call console.log with prefix and message', () => {
            logger.debug('Debug message');
            expect(consoleLogSpy).toHaveBeenCalledWith('[svelte-themes]', 'Debug message');
        });

        it('should handle multiple arguments', () => {
            logger.debug('Debug 1', 'Debug 2', true);
            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[svelte-themes]',
                'Debug 1',
                'Debug 2',
                true
            );
        });

        it('should handle arrays', () => {
            const arr = [1, 2, 3];
            logger.debug('Array:', arr);
            expect(consoleLogSpy).toHaveBeenCalledWith('[svelte-themes]', 'Array:', arr);
        });
    });

    describe('warn', () => {
        it('should call console.warn with prefix and message', () => {
            logger.warn('Warning message');
            expect(consoleWarnSpy).toHaveBeenCalledWith('[svelte-themes]', 'Warning message');
        });

        it('should handle multiple arguments', () => {
            logger.warn('Warning 1', 'Warning 2', null);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[svelte-themes]',
                'Warning 1',
                'Warning 2',
                null
            );
        });

        it('should handle error objects', () => {
            const error = new Error('Test error');
            logger.warn('Error:', error);
            expect(consoleWarnSpy).toHaveBeenCalledWith('[svelte-themes]', 'Error:', error);
        });
    });

    describe('error', () => {
        it('should call console.error with prefix and message', () => {
            logger.error('Error message');
            expect(consoleErrorSpy).toHaveBeenCalledWith('[svelte-themes]', 'Error message');
        });

        it('should handle multiple arguments', () => {
            logger.error('Error 1', 'Error 2', undefined);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[svelte-themes]',
                'Error 1',
                'Error 2',
                undefined
            );
        });

        it('should handle error objects', () => {
            const error = new Error('Critical error');
            logger.error('Critical:', error);
            expect(consoleErrorSpy).toHaveBeenCalledWith('[svelte-themes]', 'Critical:', error);
        });

        it('should handle stack traces', () => {
            const error = new Error('Stack trace error');
            logger.error('Stack trace:', error.stack);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[svelte-themes]',
                'Stack trace:',
                error.stack
            );
        });
    });

    describe('all methods', () => {
        it('should work with no arguments', () => {
            logger.info();
            logger.debug();
            logger.warn();
            logger.error();

            expect(consoleLogSpy).toHaveBeenCalledWith('[svelte-themes]');
            expect(consoleWarnSpy).toHaveBeenCalledWith('[svelte-themes]');
            expect(consoleErrorSpy).toHaveBeenCalledWith('[svelte-themes]');
        });
    });
});
