import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8')) as {
	name: string;
	exports: Record<string, unknown>;
}
const temporaryRoot = await mkdtemp(join(tmpdir(), 'goobits-themes-package-'))

function run(command: string, args: string[], cwd = packageRoot): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			env: { ...process.env, npm_config_update_notifier: 'false' },
			stdio: [ 'ignore', 'pipe', 'pipe' ]
		})
		let output = ''
		child.stdout.setEncoding('utf8')
		child.stderr.setEncoding('utf8')
		child.stdout.on('data', chunk => (output += chunk))
		child.stderr.on('data', chunk => (output += chunk))
		child.on('error', reject)
		child.on('exit', code => {
			if (code === 0) resolve(output)
			else reject(new Error(`${ command } ${ args.join(' ') } exited with ${ code }\n${ output }`))
		})
	})
}

try {
	await run('pnpm', [ 'pack', '--pack-destination', temporaryRoot ])
	const tarballs = (await readdir(temporaryRoot)).filter(file => file.endsWith('.tgz'))
	assert.equal(tarballs.length, 1, 'package verification must produce exactly one tarball')

	const consumerRoot = join(temporaryRoot, 'consumer')
	const tarball = tarballs[0]
	assert(tarball)
	const tarballReference = relative(consumerRoot, join(temporaryRoot, tarball))
		.split(sep)
		.join('/')
	const loggerFixtureRoot = join(temporaryRoot, 'logger-fixture')
	const loggerFixtureReference = `file:${ relative(consumerRoot, loggerFixtureRoot)
		.split(sep)
		.join('/') }`
	await mkdir(loggerFixtureRoot)
	await writeFile(
		join(loggerFixtureRoot, 'package.json'),
		JSON.stringify({
			name: '@goobits/logger',
			version: '1.1.0',
			type: 'module',
			types: './index.d.ts',
			exports: { '.': { types: './index.d.ts', default: './index.js' } }
		})
	)
	await writeFile(
		join(loggerFixtureRoot, 'index.js'),
		'export const createLogger = () => ({ debug() {}, info() {}, warn() {}, error() {} })\n'
	)
	await writeFile(
		join(loggerFixtureRoot, 'index.d.ts'),
		'export declare function createLogger(name?: string): { debug(...args: unknown[]): void; info(...args: unknown[]): void; warn(...args: unknown[]): void; error(...args: unknown[]): void }\n'
	)
	await mkdir(consumerRoot)
	await writeFile(
		join(consumerRoot, 'package.json'),
		JSON.stringify(
			{
				name: 'goobits-themes-package-smoke',
				private: true,
				type: 'module',
				dependencies: {
					[manifest.name]: `file:${ tarballReference }`,
					'@goobits/logger': loggerFixtureReference
				},
				pnpm: { overrides: { '@goobits/logger': loggerFixtureReference } }
			},
			null,
			2
		)
	)
	await run(
		'pnpm',
		[ 'install', '--prefer-offline', '--ignore-scripts', '--no-frozen-lockfile' ],
		consumerRoot
	)

	const installedRoot = join(consumerRoot, 'node_modules', '@goobits', 'themes')
	const installedManifest = JSON.parse(
		await readFile(join(installedRoot, 'package.json'), 'utf8')
	) as { exports: Record<string, unknown> }
	assert.deepEqual(installedManifest.exports, manifest.exports)

	const runtimeSpecifiers = [
		'@goobits/themes/core/config',
		'@goobits/themes/goo/color/parse',
		'@goobits/themes/server/preferences',
		'@goobits/themes/utils/dom'
	]
	await writeFile(
		join(consumerRoot, 'runtime-smoke.mjs'),
		`for (const specifier of ${ JSON.stringify(runtimeSpecifiers) }) await import(specifier)\n`
	)
	await run(process.execPath, [ 'runtime-smoke.mjs' ], consumerRoot)

	await writeFile(
		join(consumerRoot, 'types-smoke.ts'),
		[
			"import { createThemeConfig } from '@goobits/themes/core/config'",
			"import { parseColor } from '@goobits/themes/goo/color/parse'",
			"import { loadThemePreferences } from '@goobits/themes/server/preferences'",
			"import { getHtmlElement } from '@goobits/themes/utils/dom'",
			"import ThemeToggle from '@goobits/themes/svelte/components/ThemeToggle.svelte'",
			"import { useTheme } from '@goobits/themes/svelte/hooks/useTheme.svelte'",
			"import { createThemeStore } from '@goobits/themes/svelte/stores/theme.svelte'",
			'void [createThemeConfig, parseColor, loadThemePreferences, getHtmlElement, ThemeToggle, useTheme, createThemeStore]'
		].join('\n')
	)
	await writeFile(
		join(consumerRoot, 'tsconfig.json'),
		JSON.stringify(
			{
				compilerOptions: {
					allowJs: true,
					module: 'NodeNext',
					moduleResolution: 'NodeNext',
					noEmit: true,
					skipLibCheck: true,
					strict: true,
					target: 'ES2022'
				},
				files: [ 'types-smoke.ts' ]
			},
			null,
			2
		)
	)
	const typescriptCli = join(packageRoot, 'node_modules', 'typescript', 'bin', 'tsc')
	await access(typescriptCli)
	await run(process.execPath, [ typescriptCli, '-p', 'tsconfig.json' ], consumerRoot)

	console.log('package smoke passed (runtime and TypeScript deep imports)')
} finally {
	await rm(temporaryRoot, { recursive: true, force: true })
}
