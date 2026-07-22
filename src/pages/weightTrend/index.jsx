import { useRef, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'

import CalendarPicker from '../../components/CalendarPicker'
import WeightTrendChart from '../../components/WeightTrendChart'
import { getWeightTrend } from '../../services/api'
import { formatDisplayDate, getMonthKey } from '../../utils/calendar.mjs'
import { getTodayDate } from '../../utils/date'
import {
  capWeightEndDate,
  getWeightRangeStart,
  normalizeWeightPoints,
  WEIGHT_RANGE_DAYS
} from '../../utils/weightTrend.mjs'
import './index.scss'

const PRESETS = [
  { key: 'week', label: '近 7 天' },
  { key: 'month', label: '近 30 天' },
  { key: 'year', label: '近一年' }
]

export default function WeightTrend() {
  const router = useRouter()
  const today = getTodayDate()
  const initialEnd = capWeightEndDate(router.params.endDate || today, today)
  const [preset, setPreset] = useState('week')
  const [endDate, setEndDate] = useState(initialEnd)
  const [firstRecordDate, setFirstRecordDate] = useState(router.params.firstRecordDate || null)
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(getMonthKey(initialEnd))
  const requestRef = useRef(0)

  const loadTrend = async (nextPreset = preset, nextEndDate = endDate) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    const startDate = getWeightRangeStart(nextEndDate, WEIGHT_RANGE_DAYS[nextPreset])
    setLoading(true)
    try {
      const response = await getWeightTrend(startDate, nextEndDate)
      if (requestId === requestRef.current && response.statusCode === 200 && response.data) {
        setPoints(normalizeWeightPoints(response.data.points || []))
        setFirstRecordDate(response.data.firstRecordDate || null)
      }
    } catch (error) {
      if (requestId === requestRef.current) {
        setPoints([])
        Taro.showToast({ title: '体重趋势加载失败', icon: 'none' })
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }

  useDidShow(() => { loadTrend() })

  const choosePreset = (key) => {
    setPreset(key)
    loadTrend(key, endDate)
  }

  const openCalendar = () => {
    if (!firstRecordDate) {
      Taro.showToast({ title: '记录体重后即可选择日期', icon: 'none' })
      return
    }
    setDisplayMonth(getMonthKey(endDate))
    setCalendarOpen(true)
  }

  const selectEndDate = (date) => {
    setEndDate(date)
    setCalendarOpen(false)
    loadTrend(preset, date)
  }

  const rangeStart = getWeightRangeStart(endDate, WEIGHT_RANGE_DAYS[preset])

  return (
    <View className='weight-trend-page'>
      <View className='weight-trend-header'>
        <Text className='weight-trend-kicker'>体重变化</Text>
        <View className='weight-trend-date' onClick={openCalendar}>
          <Text>{formatDisplayDate(endDate)}</Text>
          <Text className='weight-trend-date-hint'>结束日期⌄</Text>
        </View>
        <Text className='weight-trend-range'>{formatDisplayDate(rangeStart)} 至 {formatDisplayDate(endDate)}</Text>
      </View>

      <View className='weight-trend-presets'>
        {PRESETS.map((item) => (
          <Button
            key={item.key}
            className={`weight-trend-preset ${preset === item.key ? 'is-active' : ''}`}
            onClick={() => choosePreset(item.key)}
          >{item.label}</Button>
        ))}
      </View>

      <View className='weight-trend-card'>
        {loading ? <View className='weight-trend-loading'><Text>正在加载趋势…</Text></View> : <WeightTrendChart points={points} />}
      </View>

      <CalendarPicker
        isOpen={calendarOpen}
        selectedDate={endDate}
        displayMonth={displayMonth}
        metadata={{ minDate: firstRecordDate || today, maxDate: today, recordedDates: [] }}
        onMonthChange={setDisplayMonth}
        onSelect={selectEndDate}
        onClose={() => setCalendarOpen(false)}
      />
    </View>
  )
}
