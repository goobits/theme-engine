import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const packageRoot = new URL('..', import.meta.url)
const styleRoots = [ new URL('src/lib/', packageRoot), new URL('themes/', packageRoot) ]
const BEM_CLASS =
	/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$/
const CLASS_SELECTOR = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g
const failures: string[] = []

for (const styleRoot of styleRoots) {
	for (const filePath of await collectStyleFiles(styleRoot)) {
		const source = await readFile(filePath, 'utf8')
		const styles = (filePath.endsWith('.svelte') ? extractStyleBlocks(source) : source).replace(
			/\/\*[\s\S]*?\*\//g,
			''
		)
		const classes = new Set(
			[ ...styles.matchAll(CLASS_SELECTOR) ].flatMap(match => match[1] ? [ match[1] ] : [])
		)
		for (const className of classes) {
			if (BEM_CLASS.test(className) || isThemeStateClass(className)) continue
			failures.push(
				`${ filePath.replace(packageRoot.pathname, '') }: .${ className } does not use block, block__element, or block--modifier syntax.`
			)
		}
	}
}

if (failures.length > 0) {
	console.error('CSS convention check failed:')
	for (const failure of failures) console.error(`- ${ failure }`)
	process.exitCode = 1
}

// Theme and scheme classes encode public configuration identifiers and act as
// document-level state hooks, rather than component selectors governed by BEM.
function isThemeStateClass(className: string): boolean {
	return className.startsWith('theme-') || className.startsWith('scheme-')
}

function extractStyleBlocks(source: string): string {
	return [ ...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g) ]
		.map(match => match[1])
		.join('\n')
}

async function collectStyleFiles(directoryUrl: URL): Promise<string[]> {
	const entries = await readdir(directoryUrl, { withFileTypes: true })
	const files: string[] = []

	for (const entry of entries) {
		const entryUrl = new URL(`${ entry.name }${ entry.isDirectory() ? '/' : '' }`, directoryUrl)
		if (entry.isDirectory()) {
			files.push(...await collectStyleFiles(entryUrl))
		} else if (entry.name.endsWith('.css') || entry.name.endsWith('.svelte')) {
			files.push(join(directoryUrl.pathname, entry.name))
		}
	}

	return files
}
