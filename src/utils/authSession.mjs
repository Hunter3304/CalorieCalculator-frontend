export const createHttpError = (response) => {
  const error = new Error(`Request failed with status ${response && typeof response.statusCode === 'number' ? response.statusCode : 'unknown'}`)
  error.statusCode = response && response.statusCode
  error.response = response
  return error
}

export const createAuthSessionManager = ({
  loadToken,
  saveToken,
  clearToken,
  login,
  exchange,
  request
}) => {
  let loginPromise = null

  const ensureSession = async (force = false) => {
    if (!force) {
      const stored = loadToken()
      if (stored) return stored
    }
    if (loginPromise) return loginPromise

    loginPromise = (async () => {
      const code = await login()
      if (!code) throw new Error('WeChat login did not return a code')
      const token = await exchange(code)
      if (!token) throw new Error('Backend login did not return a session token')
      saveToken(token)
      return token
    })()

    try {
      return await loginPromise
    } finally {
      loginPromise = null
    }
  }

  const authenticatedRequest = async (options, retry401 = true) => {
    let token = await ensureSession()
    const send = () => request({
      ...options,
      header: { ...(options.header || {}), Authorization: `Bearer ${token}` }
    })

    let response = await send()
    if (response && response.statusCode === 401 && retry401) {
      clearToken()
      token = await ensureSession(true)
      response = await send()
    }
    if (!response || response.statusCode < 200 || response.statusCode >= 300) {
      throw createHttpError(response)
    }
    return response
  }

  return {
    ensureSession,
    authenticatedRequest,
    clearSession: clearToken
  }
}
