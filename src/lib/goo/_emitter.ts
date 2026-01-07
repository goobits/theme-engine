/**
 * Lightweight event emitter for GooTheme.
 */

export type Handler = (...args: unknown[]) => void

export function createEmitter(onError?: (error: unknown) => void): {
	on: (event: string, handler: Handler) => () => void
	off: (event: string, handler: Handler) => void
	emit: (event: string, ...args: unknown[]) => void
} {
	const handlers = new Map<string, Set<Handler>>()

	const on = (event: string, handler: Handler): (() => void) => {
		const bucket = handlers.get(event) ?? new Set<Handler>()
		bucket.add(handler)
		handlers.set(event, bucket)
		return () => off(event, handler)
	}

	const off = (event: string, handler: Handler): void => {
		const bucket = handlers.get(event)
		if (!bucket) return
		bucket.delete(handler)
		if (bucket.size === 0) {
			handlers.delete(event)
		}
	}

	const emit = (event: string, ...args: unknown[]): void => {
		const bucket = handlers.get(event)
		if (!bucket) return
		for (const handler of bucket) {
			try {
				handler(...args)
			} catch(error) {
				onError?.(error)
			}
		}
	}

	return { on, off, emit }
}
