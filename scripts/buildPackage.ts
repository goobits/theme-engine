import { type ChildProcess,spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import {
	closeSync,
	cpSync,
	existsSync,
	mkdtempSync,
	openSync,
	readFileSync,
	realpathSync,
	renameSync,
	rmSync,
	unlinkSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const checkoutKey = createHash('sha256').update(realpathSync(packageRoot)).digest('hex').slice(0, 16)
const lockPath = join(tmpdir(), `goobits-themes-package-${ checkoutKey }.lock`)
const token = randomUUID()
const waitDeadline = Date.now() + 120_000
const stagingRoot = mkdtempSync(join(tmpdir(), `goobits-themes-build-${ checkoutKey }-`))
const stagingOutput = join(stagingRoot, 'dist')
const incomingOutput = join(packageRoot, `.dist.incoming-${ token }`)
const previousOutput = join(packageRoot, `.dist.previous-${ token }`)
const publishedOutput = join(packageRoot, 'dist')
let activeChild: ChildProcess | null = null
let interruptedSignal: 'SIGINT' | 'SIGTERM' | null = null

for (const signal of [ 'SIGINT', 'SIGTERM' ] as const) {
	process.once(signal, () => {
		interruptedSignal = signal
		activeChild?.kill(signal)
	})
}

const release = await acquireBuildLock()
try {
	await runPackageBinary('svelte-package', [ '--output', stagingOutput ], {
		GOOBITS_THEMES_SVELTEKIT_OUT_DIR: join(stagingRoot, 'svelte-kit')
	})
	await runPackageBinary('tsx', [ 'scripts/prunePackageOutput.ts', stagingOutput ])
	publishOutput()
} finally {
	rmSync(stagingRoot, { force: true, recursive: true })
	rmSync(incomingOutput, { force: true, recursive: true })
	rmSync(previousOutput, { force: true, recursive: true })
	release()
}

function publishOutput(): void {
	cpSync(stagingOutput, incomingOutput, { recursive: true })
	if (existsSync(publishedOutput)) renameSync(publishedOutput, previousOutput)
	try {
		renameSync(incomingOutput, publishedOutput)
		rmSync(previousOutput, { force: true, recursive: true })
	} catch(error) {
		if (!existsSync(publishedOutput) && existsSync(previousOutput)) {
			renameSync(previousOutput, publishedOutput)
		}
		throw error
	}
}

async function acquireBuildLock(): Promise<() => void> {
	while (Date.now() < waitDeadline) {
		let descriptor: number | null = null
		try {
			descriptor = openSync(lockPath, 'wx', 0o600)
			writeFileSync(descriptor, JSON.stringify({ pid: process.pid, token }), 'utf8')
			closeSync(descriptor)
			return releaseOwnedLock
		} catch(error) {
			if (descriptor !== null) closeSync(descriptor)
			if (!isNodeError(error, 'EEXIST')) throw error
			recoverStaleLock()
			await new Promise(resolve => setTimeout(resolve, 100))
		}
	}
	throw new Error(`Timed out waiting for the package build lock at ${ lockPath }`)
}

function recoverStaleLock(): void {
	const owner = readOwner()
	if (owner && processIsAlive(owner.pid)) return
	removeLockWithToken(owner?.token ?? null)
}

function releaseOwnedLock(): void {
	removeLockWithToken(token)
}

function removeLockWithToken(expectedToken: string | null): void {
	const current = readOwner()
	if (expectedToken === null ? current !== null : current?.token !== expectedToken) return
	try {
		unlinkSync(lockPath)
	} catch(error) {
		if (!isNodeError(error, 'ENOENT')) throw error
	}
}

function readOwner(): { readonly pid: number; readonly token: string } | null {
	try {
		const parsed: unknown = JSON.parse(readFileSync(lockPath, 'utf8'))
		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			'pid' in parsed &&
			typeof parsed.pid === 'number' &&
			Number.isSafeInteger(parsed.pid) &&
			'token' in parsed &&
			typeof parsed.token === 'string'
		) {
			return { pid: parsed.pid as number, token: parsed.token }
		}
		return null
	} catch(error) {
		if (isNodeError(error, 'ENOENT')) return null
		return null
	}
}

function processIsAlive(pid: number): boolean {
	try {
		process.kill(pid, 0)
		return true
	} catch(error) {
		return isNodeError(error, 'EPERM')
	}
}

function runPackageBinary(
	name: string,
	arguments_: readonly string[] = [],
	environment: Readonly<Record<string, string>> = {}
): Promise<void> {
	const executable = join(packageRoot, 'node_modules', '.bin', `${ name }${ process.platform === 'win32' ? '.cmd' : '' }`)
	return run(executable, arguments_, name, environment)
}

async function run(
	command: string,
	arguments_: readonly string[],
	displayName: string,
	environment: Readonly<Record<string, string>>
): Promise<void> {
	if (interruptedSignal) throw new Error(`Package build interrupted by ${ interruptedSignal }`)
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, arguments_, {
			cwd: packageRoot,
			env: { ...process.env, ...environment },
			stdio: 'inherit'
		})
		activeChild = child
		child.once('error', reject)
		child.once('exit', (code, signal) => {
			activeChild = null
			if (code === 0) resolve()
			else reject(new Error(`${ displayName } exited with ${ signal ?? code ?? 'unknown status' }`))
		})
	})
}

function isNodeError(error: unknown, code: string): boolean {
	return error instanceof Error && 'code' in error && error.code === code
}
