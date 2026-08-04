import assert from 'node:assert/strict'
import test from 'node:test'

import { createAuthSessionManager } from '../src/utils/authSession.mjs'

test('concurrent requests share one login and attach the bearer token', async () => {
  let stored = ''
  let logins = 0
  const headers = []
  const manager = createAuthSessionManager({
    loadToken: () => stored,
    saveToken: (token) => { stored = token },
    clearToken: () => { stored = '' },
    login: async () => { logins += 1; return 'code' },
    exchange: async () => 'token-one',
    request: async (options) => { headers.push(options.header.Authorization); return { statusCode: 200 } }
  })

  await Promise.all([
    manager.authenticatedRequest({ url: '/one' }),
    manager.authenticatedRequest({ url: '/two' })
  ])

  assert.equal(logins, 1)
  assert.deepEqual(headers, ['Bearer token-one', 'Bearer token-one'])
})

test('a 401 clears the session, logs in once, and retries once', async () => {
  let stored = 'expired'
  let requests = 0
  let logins = 0
  const manager = createAuthSessionManager({
    loadToken: () => stored,
    saveToken: (token) => { stored = token },
    clearToken: () => { stored = '' },
    login: async () => { logins += 1; return 'fresh-code' },
    exchange: async () => 'fresh-token',
    request: async () => ({ statusCode: ++requests === 1 ? 401 : 200 })
  })

  const response = await manager.authenticatedRequest({ url: '/records' })

  assert.equal(response.statusCode, 200)
  assert.equal(logins, 1)
  assert.equal(requests, 2)
})

test('a second 401 is returned as an error without another retry', async () => {
  let stored = 'expired'
  let requests = 0
  const manager = createAuthSessionManager({
    loadToken: () => stored,
    saveToken: (token) => { stored = token },
    clearToken: () => { stored = '' },
    login: async () => 'fresh-code',
    exchange: async () => 'fresh-token',
    request: async () => { requests += 1; return { statusCode: 401 } }
  })

  await assert.rejects(
    manager.authenticatedRequest({ url: '/records' }),
    (error) => error.statusCode === 401
  )
  assert.equal(requests, 2)
})
