import { useRef, useState } from 'react'
import { Button, Picker, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'

import CalendarPicker from '../../components/CalendarPicker'
import CircumferenceTrendChart from '../../components/CircumferenceTrendChart'
import { getCircumferenceTrend } from '../../services/api'
import { formatDisplayDate, getMonthKey } from '../../utils/calendar.mjs'
import {
  capCircumferenceEndDate,
  CIRCUMFERENCE_FIELDS,
  CIRCUMFERENCE_RANGE_DAYS,
  getCircumferenceRangeStart,
  normalizeCircumferencePoints
} from '../../utils/circumference.mjs'
import { getTodayDate } from '../../utils/date'
import './index.scss'

const PRESETS = [
  { key: 'week', label: '近 7 天' },
  { key: 'month', label: '近 30 天' },
  { key: 'year', label: '近一年' }
]

export default function CircumferenceTrend() {
  const router = useRouter()
  const today = getTodayDate()
  const initialEnd = capCircumferenceEndDate(router.params.endDate || today, today)
  const initialTypeIndex = Math.max(
    0,
    CIRCUMFERENCE_FIELDS.findIndex((field) => field.key === (router.params.type || 'waist'))
  )
  const [measurementIndex, setMeasurementIndex] = useState(initialTypeIndex)
  const [preset, setPreset] = useState('week')
  const [endDate, setEndDate] = useState(initialEnd)
  const [firstRecordDate, setFirstRecordDate] = useState(null)
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(getMonthKey(initialEnd))
  const requestRef = useRef(0)

  const loadTrend = async (
    nextTypeIndex = measurementIndex,
    nextPreset = preset,
    nextEndDate = endDate
  ) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    const field = CIRCUMFERENCE_FIELDS[nextTypeIndex]
    const startDate = getCircumferenceRangeStart(
      nextEndDate,
      CIRCUMFERENCE_RANGE_DAYS[nextPreset]
    )
    setLoading(true)
    try {
      const response = await getCircumferenceTrend(field.key, startDate, nextEndDate)
      if (requestId === requestRef.current && response.statusCode === 200 && response.data) {
        setPoints(normalizeCircumferencePoints(response.data.points || []))
        setFirstRecordDate(response.data.firstRecordDate || null)
      }
    } catch (error) {
      if (requestId === requestRef.current) {
        setPoints([])
        setFirstRecordDate(null)
        Taro.showToast({ title: '围度趋势加载失败', icon: 'none' })
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }

  useDidShow(() => { loadTrend() })

  const chooseMeasurement = (event) => {
    const nextIndex = Number(event.detail.value)
    setMeasurementIndex(nextIndex)
    loadTrend(nextIndex, preset, endDate)
  }

  const choosePreset = (key) => {
    setPreset(key)
    loadTrend(measurementIndex, key, endDate)
  }

  const openCalendar = () => {
    if (!firstRecordDate) {
      Taro.showToast({ title: '记录该项围度后即可选择日期', icon: 'none' })
      return
    }
    setDisplayMonth(getMonthKey(endDate))
    setCalendarOpen(true)
  }

  const selectEndDate = (date) => {
    setEndDate(date)
    setCalendarOpen(false)
    loadTrend(measurementIndex, preset, date)
  }

  const selectedField = CIRCUMFERENCE_FIELDS[measurementIndex]
  const rangeStart = getCircumferenceRangeStart(
    endDate,
    CIRCUMFERENCE_RANGE_DAYS[preset]
  )

  return (
    <View className='circumference-trend-page'>
      <View className='circumference-trend-header'>
        <Text className='circumference-trend-kicker'>围度变化</Text>
        <Picker
          mode='selector'
          range={CIRCUMFERENCE_FIELDS.map((field) => field.label)}
          value={measurementIndex}
          onChange={chooseMeasurement}
        >
          <View className='circumference-trend-selector'>
            <Text>{selectedField.label}</Text>
            <Text className='circumference-trend-selector-hint'>切换围度⌄</Text>
          </View>
        </Picker>
        <View className='circumference-trend-date' onClick={openCalendar}>
          <Text>{formatDisplayDate(endDate)}</Text>
          <Text className='circumference-trend-date-hint'>结束日期⌄</Text>
        </View>
        <Text className='circumference-trend-range'>
          {formatDisplayDate(rangeStart)} 至 {formatDisplayDate(endDate)}
        </Text>
      </View>

      <View className='circumference-trend-presets'>
        {PRESETS.map((item) => (
          <Button
            key={item.key}
            className={`circumference-trend-preset ${preset === item.key ? 'is-active' : ''}`}
            onClick={() => choosePreset(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </View>

      <View className='circumference-trend-card'>
        {loading
          ? <View className='circumference-trend-loading'><Text>正在加载趋势…</Text></View>
          : <CircumferenceTrendChart points={points} />}
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
