import Taro from '@tarojs/taro'

const API_BASE = 'https://caloriecalculator-backend-production.up.railway.app/api'
//const API_BASE = 'http://localhost:8080/api'
//const API_BASE = 'http://127.0.0.1:8080/api'

// 获取食物基础列表
export const getFoodList = () => {
  return Taro.request({ url: `${API_BASE}/foods`, method: 'GET' })
}

// 获取某一天的饮食汇总记录
export const getDailySummary = (date) => {
  return Taro.request({ url: `${API_BASE}/records/${date}`, method: 'GET' })
}

// 添加一条饮食记录
export const addDailyRecord = (data) => {
  return Taro.request({ url: `${API_BASE}/records`, method: 'POST', data })
}

//修改饮食记录
export const updateDailyRecord = (id, weight) => {
  return Taro.request({ url: `${API_BASE}/records/${id}`, method: 'PUT', data: { weight } })
}

//删除一条饮食记录
export const deleteDailyRecord = (id) => {
  return Taro.request({ url: `${API_BASE}/records/${id}`, method: 'DELETE' })
}

// 获取分页食物列表
export const getFoodsByPage = (page = 1, size = 10) => {
  return Taro.request({
    url: `${API_BASE}/foods/page?page=${page}&size=${size}`,
    method: 'GET'
  })
}

// 搜索食物
export const searchFoods = (keyword) => {
  return Taro.request({
    url: `${API_BASE}/foods/search?keyword=${encodeURIComponent(keyword)}`,
    method: 'GET'
  })
}

// 添加自定义食物
export const addCustomFood = (foodData) => {
  return Taro.request({
    url: `${API_BASE}/foods/custom`,
    method: 'POST',
    data: foodData
  })
}

// 获取自定义食物列表
export const getCustomFoods = () => {
  return Taro.request({
    url: `${API_BASE}/foods/custom`,
    method: 'GET'
  })
}

// 删除自定义食物
export const deleteCustomFood = (id) => {
  return Taro.request({ url: `${API_BASE}/foods/custom/${id}`, method: 'DELETE' })
}

// 更新自定义食物
export const updateCustomFood = (id, data) => {
  return Taro.request({ url: `${API_BASE}/foods/custom/${id}`, method: 'PUT', data })
}