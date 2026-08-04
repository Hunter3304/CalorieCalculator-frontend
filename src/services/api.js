import { apiRequest } from './auth'
import { API_BASE } from './config'
import { ensureSuccessfulResponse } from '../utils/apiResponse.mjs'

// 获取食物基础列表
export const getFoodList = () => {
  return apiRequest({ url: `${API_BASE}/foods`, method: 'GET' })
}

// 获取某一天的饮食汇总记录
export const getDailySummary = (date) => {
  return apiRequest({ url: `${API_BASE}/records/${date}`, method: 'GET' })
}

export const getCalendarMetadata = (month) => {
  return apiRequest({
    url: `${API_BASE}/records/calendar?month=${encodeURIComponent(month)}`,
    method: 'GET'
  })
}

// 添加一条饮食记录
export const addDailyRecord = async (data) => {
  const response = await apiRequest({ url: `${API_BASE}/records`, method: 'POST', data })
  return ensureSuccessfulResponse(response)
}
//修改饮食记录
export const updateDailyRecord = (id, weight) => {
  return apiRequest({ url: `${API_BASE}/records/${id}`, method: 'PUT', data: { weight } })
}

//删除一条饮食记录
export const deleteDailyRecord = (id) => {
  return apiRequest({ url: `${API_BASE}/records/${id}`, method: 'DELETE' })
}

export const getWeightSnapshot = (date) => {
  return apiRequest({ url: `${API_BASE}/weights/${date}`, method: 'GET' })
}

export const saveWeightRecord = async (date, weightKg) => {
  const response = await apiRequest({ url: `${API_BASE}/weights/${date}`, method: 'PUT', data: { weightKg } })
  return ensureSuccessfulResponse(response)
}

export const updateWeightRecord = async (id, weightKg) => {
  const response = await apiRequest({ url: `${API_BASE}/weights/records/${id}`, method: 'PUT', data: { weightKg } })
  return ensureSuccessfulResponse(response)
}

export const deleteWeightRecord = async (id) => {
  const response = await apiRequest({ url: `${API_BASE}/weights/records/${id}`, method: 'DELETE' })
  return ensureSuccessfulResponse(response)
}

export const getWeightTrend = (startDate, endDate) => {
  return apiRequest({
    url: `${API_BASE}/weights/trend?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    method: 'GET'
  })
}
export const getCircumferenceSnapshot = (date) => {
  return apiRequest({ url: `${API_BASE}/circumferences/${date}`, method: 'GET' })
}

export const saveCircumferenceRecord = async (date, data) => {
  const response = await apiRequest({
    url: `${API_BASE}/circumferences/${date}`,
    method: 'PUT',
    data
  })
  return ensureSuccessfulResponse(response)
}

export const deleteCircumferenceRecord = async (id) => {
  const response = await apiRequest({
    url: `${API_BASE}/circumferences/records/${id}`,
    method: 'DELETE'
  })
  return ensureSuccessfulResponse(response)
}

export const getCircumferenceTrend = (type, startDate, endDate) => {
  return apiRequest({
    url: `${API_BASE}/circumferences/trend?type=${encodeURIComponent(type)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    method: 'GET'
  })
}

// 获取分页食物列表
export const getFoodsByPage = (page = 1, size = 10) => {
  return apiRequest({
    url: `${API_BASE}/foods/page?page=${page}&size=${size}`,
    method: 'GET'
  })
}

// 搜索食物
export const searchFoods = (keyword) => {
  return apiRequest({
    url: `${API_BASE}/foods/search?keyword=${encodeURIComponent(keyword)}`,
    method: 'GET'
  })
}

// 添加自定义食物
export const addCustomFood = (foodData) => {
  return apiRequest({
    url: `${API_BASE}/foods/custom`,
    method: 'POST',
    data: foodData
  })
}

// 获取自定义食物列表
export const getCustomFoods = () => {
  return apiRequest({
    url: `${API_BASE}/foods/custom`,
    method: 'GET'
  })
}

// 删除自定义食物
export const deleteCustomFood = (id) => {
  return apiRequest({ url: `${API_BASE}/foods/custom/${id}`, method: 'DELETE' })
}

// 更新自定义食物
export const updateCustomFood = (id, data) => {
  return apiRequest({ url: `${API_BASE}/foods/custom/${id}`, method: 'PUT', data })
}
