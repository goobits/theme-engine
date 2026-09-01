import { readdir, rm } from 'node:fs/promises'
import { join,resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const outputRoot = process.argv[2] ? resolve(process.argv[2]) : join(packageRoot, 'dist')
const testArtifactPattern = /\.(?:spec|test)\./

async function pruneTestArtifacts(directory: string): Promise<number> {
	let removed = 0
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) {
			removed += await pruneTestArtifacts(path)
		} else if (entry.isFile() && testArtifactPattern.test(entry.name)) {
			await rm(path)
			removed += 1
		}
	}
	return removed
}

const removed = await pruneTestArtifacts(outputRoot)
console.log(`Removed ${ removed } test artifact${ removed === 1 ? '' : 's' } from dist.`)
