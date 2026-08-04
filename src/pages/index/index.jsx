import { useRef, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'

import {
  deleteCircumferenceRecord,
  deleteDailyRecord,
  deleteWeightRecord,
  getCalendarMetadata,
  getCircumferenceSnapshot,
  getDailySummary,
  getWeightSnapshot,
  updateDailyRecord
} from '../../services/api'
import { getTodayDate } from '../../utils/date'
import { addDays, formatDisplayDate, getMonthKey, isDateInRange } from '../../utils/calendar.mjs'
import { createEmptyCircumferenceSnapshot } from '../../utils/circumference.mjs'
import CalendarPicker from '../../components/CalendarPicker'
import CircumferenceSummaryCard from '../../components/CircumferenceSummaryCard'
import DailyList from '../../components/DailyList'
import NutritionSummary from '../../components/NutritionSummary'
import WeightSummaryCard from '../../components/WeightSummaryCard'
import './index.scss'

const emptyWeight = (date) => ({
  selectedDate: date,
  recordId: null,
  sourceDate: null,
  weightKg: null,
  recordedOnSelectedDate: false,
  firstRecordDate: null
})

export default function Index() {
  const today = getTodayDate()
  const [currentDate, setCurrentDate] = useState(today)
  const [dailyRecords, setDailyRecords] = useState([])
  const [summary, setSummary] = useState({ date: today })
  const [weightSnapshot, setWeightSnapshot] = useState(emptyWeight(today))
  const [circumferenceSnapshot, setCircumferenceSnapshot] = useState(
    createEmptyCircumferenceSnapshot(today)
  )
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(getMonthKey(today))
  const [metadata, setMetadata] = useState({ minDate: today, maxDate: addDays(today, 7), recordedDates: [] })
  const summaryRequest = useRef(0)
  const metadataRequest = useRef(0)
  const weightRequest = useRef(0)
  const circumferenceRequest = useRef(0)

  const fetchSummary = async (date) => {
    const requestId = ++summaryRequest.current
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

  const fetchWeight = async (date) => {
    const requestId = ++weightRequest.current
    try {
      const response = await getWeightSnapshot(date)
      if (requestId === weightRequest.current && response.statusCode === 200 && response.data) {
        setWeightSnapshot(response.data)
      }
    } catch (error) {
      if (requestId === weightRequest.current) {
        setWeightSnapshot(emptyWeight(date))
        Taro.showToast({ title: '体重记录加载失败', icon: 'none' })
      }
    }
  }

  const fetchCircumference = async (date) => {
    const requestId = ++circumferenceRequest.current
    try {
      const response = await getCircumferenceSnapshot(date)
      if (
        requestId === circumferenceRequest.current
        && response.statusCode === 200
        && response.data
      ) {
        setCircumferenceSnapshot(response.data)
      }
    } catch (error) {
      if (requestId === circumferenceRequest.current) {
        setCircumferenceSnapshot(createEmptyCircumferenceSnapshot(date))
        Taro.showToast({ title: '围度记录加载失败', icon: 'none' })
      }
    }
  }
  const fetchMetadata = async (month) => {
    const requestId = ++metadataRequest.current
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
      if (requestId === metadataRequest.current) Taro.showToast({ title: '日历加载失败', icon: 'none' })
    }
  }

  const refreshDate = (date) => {
    setCurrentDate(date)
    const month = getMonthKey(date)
    setDisplayMonth(month)
    fetchSummary(date)
    fetchWeight(date)
    fetchCircumference(date)
    fetchMetadata(month)
  }

  useDidShow(() => { refreshDate(currentDate) })

  const changeDay = (amount) => {
    const nextDate = addDays(currentDate, amount)
    if (isDateInRange(nextDate, metadata.minDate, metadata.maxDate)) refreshDate(nextDate)
  }

  const openCalendar = () => {
    setDisplayMonth(getMonthKey(currentDate))
    fetchMetadata(getMonthKey(currentDate))
    setCalendarOpen(true)
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
    } finally { Taro.hideLoading() }
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
    } finally { Taro.hideLoading() }
  }

  const weightEditorUrl = ({ recordId, sourceDate, weightKg } = {}) => {
    const params = [`date=${currentDate}`]
    if (recordId) params.push(`recordId=${recordId}`, `sourceDate=${sourceDate}`, `weightKg=${weightKg}`)
    return `/pages/weightEditor/index?${params.join('&')}`
  }

  const recordWeight = () => {
    if (currentDate > today) {
      Taro.showToast({ title: '未来日期不能记录体重', icon: 'none' })
      return
    }
    if (weightSnapshot.recordedOnSelectedDate) Taro.navigateTo({ url: weightEditorUrl(weightSnapshot) })
    else Taro.navigateTo({ url: weightEditorUrl() })
  }

  const editDisplayedWeight = () => {
    if (!weightSnapshot.recordId) return
    Taro.navigateTo({ url: weightEditorUrl(weightSnapshot) })
  }

  const deleteSelectedWeight = () => {
    if (!weightSnapshot.recordedOnSelectedDate) return
    Taro.showModal({
      title: '删除体重记录',
      content: `确定删除 ${formatDisplayDate(currentDate)} 的体重记录吗？`,
      success: async (result) => {
        if (!result.confirm) return
        Taro.showLoading({ title: '删除中...' })
        try {
          await deleteWeightRecord(weightSnapshot.recordId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          fetchWeight(currentDate)
        } catch (error) {
          Taro.showToast({ title: '删除失败', icon: 'none' })
        } finally { Taro.hideLoading() }
      }
    })
  }

  const openWeightTrend = () => {
    const first = weightSnapshot.firstRecordDate ? `&firstRecordDate=${weightSnapshot.firstRecordDate}` : ''
    Taro.navigateTo({ url: `/pages/weightTrend/index?endDate=${currentDate}${first}` })
  }

  const recordCircumference = () => {
    if (currentDate > today) {
      Taro.showToast({ title: '未来日期不能记录围度', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/circumferenceEditor/index?date=${currentDate}` })
  }

  const deleteSelectedCircumference = () => {
    if (!circumferenceSnapshot.recordId) return
    Taro.showModal({
      title: '删除围度记录',
      content: `确定删除 ${formatDisplayDate(currentDate)} 的围度记录吗？`,
      success: async (result) => {
        if (!result.confirm) return
        Taro.showLoading({ title: '删除中...' })
        try {
          await deleteCircumferenceRecord(circumferenceSnapshot.recordId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          fetchCircumference(currentDate)
        } catch (error) {
          Taro.showToast({ title: '删除失败', icon: 'none' })
        } finally { Taro.hideLoading() }
      }
    })
  }

  const openCircumferenceTrend = () => {
    Taro.navigateTo({
      url: `/pages/circumferenceTrend/index?endDate=${currentDate}&type=waist`
    })
  }
  const previousDisabled = currentDate <= metadata.minDate
  const nextDisabled = currentDate >= metadata.maxDate

  return (
    <View className='index-page'>
      <Button
        className='settings-entry'
        onClick={() => Taro.navigateTo({ url: '/pages/settings/index' })}
      >
        隐私与账号
      </Button>
      <View className='date-navigation'>
        <Button className={`date-arrow ${previousDisabled ? 'is-disabled' : ''}`} disabled={previousDisabled} onClick={() => changeDay(-1)}>‹</Button>
        <View className='date-trigger' onClick={openCalendar}>
          <Text className='date-title'>📅 {formatDisplayDate(currentDate)}</Text>
          <Text className='date-hint'>点击打开日历</Text>
        </View>
        <Button className={`date-arrow ${nextDisabled ? 'is-disabled' : ''}`} disabled={nextDisabled} onClick={() => changeDay(1)}>›</Button>
      </View>

      <View className='quick-actions'>
        <Button className='quick-action' onClick={() => Taro.navigateTo({ url: `/pages/addFood/index?date=${currentDate}` })}>
          <Text className='quick-action-icon'>＋</Text><Text className='quick-action-label'>添加食物</Text>
        </Button>
        <Button className='quick-action is-weight' onClick={recordWeight}>
          <Text className='quick-action-icon'>⚖</Text><Text className='quick-action-label'>记录体重</Text>
        </Button>        <Button className='quick-action is-circumference' onClick={recordCircumference}>
          <Text className='quick-action-icon'>📏</Text><Text className='quick-action-label'>记录围度</Text>
        </Button>
      </View>

      <DailyList records={dailyRecords} emptyText='这个日期还没有饮食记录' onDelete={handleDeleteRecord} onUpdate={handleUpdateRecord} />
      <WeightSummaryCard snapshot={weightSnapshot} onEdit={editDisplayedWeight} onDelete={deleteSelectedWeight} onOpenTrend={openWeightTrend} />
      <CircumferenceSummaryCard
        snapshot={circumferenceSnapshot}
        onEdit={recordCircumference}
        onDelete={deleteSelectedCircumference}
        onOpenTrend={openCircumferenceTrend}
      />
      <NutritionSummary summary={summary} />

      <CalendarPicker
        isOpen={calendarOpen}
        selectedDate={currentDate}
        displayMonth={displayMonth}
        metadata={metadata}
        onMonthChange={(month) => { setDisplayMonth(month); fetchMetadata(month) }}
        onSelect={(date) => { setCalendarOpen(false); refreshDate(date) }}
        onClose={() => setCalendarOpen(false)}
      />
    </View>
  )
}
