import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const bundlePath = new URL('../dist/common.js', import.meta.url)

test('WeChat production bundle avoids unsupported modern syntax', async () => {
  const bundle = await readFile(bundlePath, 'utf8')

  assert.doesNotMatch(bundle, /\?\./, 'optional chaining must be transpiled')
  assert.doesNotMatch(bundle, /\?\?/, 'nullish coalescing must be transpiled')
})