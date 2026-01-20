const { execSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const root = globalThis.process.cwd()
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

execSync(`git commit -m "chore(release): v${ pkg.version }"`, {
	cwd: root,
	stdio: 'inherit'
})
