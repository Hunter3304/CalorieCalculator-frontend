import assert from 'node:assert/strict'
import test from 'node:test'

import { ensureSuccessfulResponse } from '../src/utils/apiResponse.mjs'

test('returns successful 2xx responses unchanged', () => {
  const response = { statusCode: 200, data: 'ok' }
  assert.equal(ensureSuccessfulResponse(response), response)
})

test('throws for non-2xx responses', () => {
  assert.throws(
    () => ensureSuccessfulResponse({ statusCode: 500, data: 'failed' }),
    (error) => error.statusCode === 500
  )
})

test('throws when no valid response is provided', () => {
  assert.throws(() => ensureSuccessfulResponse(undefined), /unknown/)
})