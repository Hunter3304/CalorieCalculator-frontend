import React, { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

// 导入刚才拆分的模块
import { getDailySummary, addDailyRecord, updateDailyRecord, deleteDailyRecord } from '../../services/api'
import { getTodayDate } from '../../utils/date'
import FoodSelector from '../../components/FoodSelector'
import DailyList from '../../components/DailyList'
import NutritionSummary from '../../components/NutritionSummary'

export default function Index() {
  const [currentDate, setCurrentDate] = useState('')
  const [dailyRecords, setDailyRecords] = useState([])
  const [summary, setSummary] = useState({})

  // 页面初始化
useDidShow(() => {
    const today = getTodayDate()
    setCurrentDate(today)
    fetchSummary(today)
  })


  // 独立出来的拉取汇总方法
  const fetchSummary = async (date) => {
    try {
      const res = await getDailySummary(date)
      if (res.statusCode === 200 && res.data) {
        setDailyRecords(res.data.list || [])
        setSummary(res.data || {})
      }
    } catch (error) {
      console.error('获取今日记录失败')
    }
  }

  // 传递给子组件的添加逻辑
  const handleAddFood = async (foodId, weight) => {
    Taro.showLoading({ title: '添加中...' })
    try {
      const res = await addDailyRecord({ date: currentDate, foodId, weight })
      if (res.statusCode === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' })
        fetchSummary(currentDate) // 重新计算刷新
      }
    } catch (error) {
      Taro.showToast({ title: '添加失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  // 处理删除
  const handleDeleteRecord = async (id) => {
    Taro.showLoading({ title: '删除中...' })
    try {
      const res = await deleteDailyRecord(id)
      if (res.statusCode === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchSummary(currentDate) // 重新拉取最新数据
      }
    } catch (error) {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  // 处理修改
  const handleUpdateRecord = async (id, weight) => {
    Taro.showLoading({ title: '修改中...' })
    try {
      const res = await updateDailyRecord(id, weight)
      if (res.statusCode === 200) {
        Taro.showToast({ title: '修改成功', icon: 'success' })
        fetchSummary(currentDate) // 重新拉取最新数据
      }
    } catch (error) {
      Taro.showToast({ title: '修改失败', icon: 'none' })
    }
  }

  return (
    <View style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', display: 'block', marginBottom: '20px' }}>
        📅 今日记录：{currentDate}
      </Text>

      {/* 像拼积木一样把组件拼起来 */}
      <Button 
        type="primary" 
        style={{ marginBottom: '20px', backgroundColor: '#1890ff', borderRadius: '8px' }}
        onClick={() => Taro.navigateTo({ url: '/pages/addFood/index' })}
      >
        + 添加食物
      </Button>
      <DailyList 
      records={dailyRecords} 
      onDelete={handleDeleteRecord} 
      onUpdate={handleUpdateRecord} 
      />
      <NutritionSummary summary={summary} />
    </View>
  )
}