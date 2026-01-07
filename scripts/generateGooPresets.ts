import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { buildGooPresetFiles } from './_gooPresets.js'

const run = async(): Promise<void> => {
	const files = buildGooPresetFiles()

	for (const [ outputPath, contents ] of Object.entries(files)) {
		await mkdir(dirname(outputPath), { recursive: true })
		await writeFile(outputPath, contents, 'utf8')
	}
}

void run()
