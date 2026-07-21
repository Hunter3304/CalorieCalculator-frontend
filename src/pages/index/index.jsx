import React, { useRef, useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import {
  deleteDailyRecord,
  getCalendarMetadata,
  getDailySummary,
  updateDailyRecord
} from '../../services/api'
import { getTodayDate } from '../../utils/date'
import {
  addDays,
  formatDisplayDate,
  getMonthKey,
  isDateInRange
} from '../../utils/calendar.mjs'
import CalendarPicker from '../../components/CalendarPicker'
import DailyList from '../../components/DailyList'
import NutritionSummary from '../../components/NutritionSummary'
import './index.scss'

export default function Index() {
  const today = getTodayDate()
  const [currentDate, setCurrentDate] = useState(today)
  const [dailyRecords, setDailyRecords] = useState([])
  const [summary, setSummary] = useState({ date: today })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(getMonthKey(today))
  const [metadata, setMetadata] = useState({
    minDate: today,
    maxDate: addDays(today, 7),
    recordedDates: []
  })
  const summaryRequest = useRef(0)
  const metadataRequest = useRef(0)

  const fetchSummary = async (date) => {
    const requestId = summaryRequest.current + 1
    summaryRequest.current = requestId
    try {
      const response = await getDailySummary(date)
      if (requestId === summaryRequest.current && response.statusCode === 200 && response.data) {
        setDailyRecords(response.data.list || [])
        setSummary(response.data)
      }
    } catch (error) {
      if (requestId === summaryRequest.current) {
        setDailyRecords([])
        setSummary({ date })
        Taro.showToast({ title: '该日期记录加载失败', icon: 'none' })
      }
    }
  }

  const fetchMetadata = async (month) => {
    const requestId = metadataRequest.current + 1
    metadataRequest.current = requestId
    try {
      const response = await getCalendarMetadata(month)
      if (requestId === metadataRequest.current && response.statusCode === 200 && response.data) {
        setMetadata({
          minDate: response.data.minDate,
          maxDate: response.data.maxDate,
          recordedDates: response.data.recordedDates || []
        })
      }
    } catch (error) {
      if (requestId === metadataRequest.current) {
        Taro.showToast({ title: '日历加载失败', icon: 'none' })
      }
    }
  }

  const refreshDate = (date) => {
    setCurrentDate(date)
    const month = getMonthKey(date)
    setDisplayMonth(month)
    fetchSummary(date)
    fetchMetadata(month)
  }

  useDidShow(() => {
    refreshDate(currentDate)
  })

  const changeDay = (amount) => {
    const nextDate = addDays(currentDate, amount)
    if (isDateInRange(nextDate, metadata.minDate, metadata.maxDate)) refreshDate(nextDate)
  }

  const openCalendar = () => {
    const month = getMonthKey(currentDate)
    setDisplayMonth(month)
    fetchMetadata(month)
    setCalendarOpen(true)
  }

  const changeCalendarMonth = (month) => {
    setDisplayMonth(month)
    fetchMetadata(month)
  }

  const selectCalendarDate = (date) => {
    setCalendarOpen(false)
    refreshDate(date)
  }

  const handleDeleteRecord = async (id) => {
    Taro.showLoading({ title: '删除中...' })
    try {
      const response = await deleteDailyRecord(id)
      if (response.statusCode === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchSummary(currentDate)
        fetchMetadata(getMonthKey(currentDate))
      }
    } catch (error) {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleUpdateRecord = async (id, weight) => {
    Taro.showLoading({ title: '修改中...' })
    try {
      const response = await updateDailyRecord(id, weight)
      if (response.statusCode === 200) {
        Taro.showToast({ title: '修改成功', icon: 'success' })
        fetchSummary(currentDate)
      }
    } catch (error) {
      Taro.showToast({ title: '修改失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const previousDisabled = currentDate <= metadata.minDate
  const nextDisabled = currentDate >= metadata.maxDate

  return (
    <View className='index-page'>
      <View className='date-navigation'>
        <Button
          className={`date-arrow ${previousDisabled ? 'is-disabled' : ''}`}
          disabled={previousDisabled}
          onClick={() => changeDay(-1)}
        >‹</Button>
        <View className='date-trigger' onClick={openCalendar}>
          <Text className='date-title'>📅 {formatDisplayDate(currentDate)}</Text>
          <Text className='date-hint'>点击打开日历</Text>
        </View>
        <Button
          className={`date-arrow ${nextDisabled ? 'is-disabled' : ''}`}
          disabled={nextDisabled}
          onClick={() => changeDay(1)}
        >›</Button>
      </View>

      <Button
        type='primary'
        className='add-food-button'
        onClick={() => Taro.navigateTo({ url: `/pages/addFood/index?date=${currentDate}` })}
      >+ 添加食物</Button>

      <DailyList
        records={dailyRecords}
        emptyText='这个日期还没有饮食记录'
        onDelete={handleDeleteRecord}
        onUpdate={handleUpdateRecord}
      />
      <NutritionSummary summary={summary} />

      <CalendarPicker
        isOpen={calendarOpen}
        selectedDate={currentDate}
        displayMonth={displayMonth}
        metadata={metadata}
        onMonthChange={changeCalendarMonth}
        onSelect={selectCalendarDate}
        onClose={() => setCalendarOpen(false)}
      />
    </View>
  )
}
