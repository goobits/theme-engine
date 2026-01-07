import { readFile } from 'node:fs/promises'

import { buildGooPresetFiles } from './_gooPresets.js'

const run = async(): Promise<void> => {
	const files = buildGooPresetFiles()
	const mismatches: string[] = []

	for (const [ outputPath, contents ] of Object.entries(files)) {
		const existing = await readFile(outputPath, 'utf8')
		if (existing !== contents) {
			mismatches.push(outputPath)
		}
	}

	if (mismatches.length > 0) {
		throw new Error(`Goo preset outputs are out of date:\n${ mismatches.join('\n') }`)
	}
}

void run()
