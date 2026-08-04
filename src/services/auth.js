import Taro from '@tarojs/taro'

import { createAuthSessionManager, createHttpError } from '../utils/authSession.mjs'
import { API_BASE } from './config'

const TOKEN_KEY = 'calorie-calculator-session-token'

const manager = createAuthSessionManager({
  loadToken: () => Taro.getStorageSync(TOKEN_KEY),
  saveToken: (token) => Taro.setStorageSync(TOKEN_KEY, token),
  clearToken: () => Taro.removeStorageSync(TOKEN_KEY),
  login: async () => {
    const result = await Taro.login()
    return result.code
  },
  exchange: async (code) => {
    const response = await Taro.request({
      url: `${API_BASE}/auth/wechat`,
      method: 'POST',
      data: { code }
    })
    if (!response || response.statusCode < 200 || response.statusCode >= 300) {
      throw createHttpError(response)
    }
    return response.data && response.data.token
  },
  request: (options) => Taro.request(options)
})

export const ensureSession = () => manager.ensureSession()
export const apiRequest = (options, retry401 = true) => (
  manager.authenticatedRequest(options, retry401)
)

export const getAccount = () => apiRequest({ url: `${API_BASE}/account`, method: 'GET' })

export const logoutSession = async () => {
  try {
    await apiRequest({ url: `${API_BASE}/auth/session`, method: 'DELETE' }, false)
  } finally {
    manager.clearSession()
  }
}

export const deleteAccount = async () => {
  const response = await apiRequest({ url: `${API_BASE}/account`, method: 'DELETE' })
  manager.clearSession()
  return response
}
