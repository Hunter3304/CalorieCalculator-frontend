import React from 'react'
import { Button, Picker, Text, View } from '@tarojs/components'
import {
  formatMonth,
  getCalendarCells,
  getMonthKey,
  isDateInRange,
  shiftMonth
} from '../utils/calendar.mjs'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarPicker({
  isOpen,
  selectedDate,
  displayMonth,
  metadata,
  onMonthChange,
  onSelect,
  onClose
}) {
  if (!isOpen) return null

  const cells = getCalendarCells(displayMonth)
  const recordedDates = new Set(metadata.recordedDates || [])
  const minMonth = getMonthKey(metadata.minDate)
  const maxMonth = getMonthKey(metadata.maxDate)
  const canGoPrevious = displayMonth > minMonth
  const canGoNext = displayMonth < maxMonth

  const changeMonth = (amount) => {
    const nextMonth = shiftMonth(displayMonth, amount)
    if (nextMonth >= minMonth && nextMonth <= maxMonth) onMonthChange(nextMonth)
  }

  return (
    <View className='calendar-overlay' onClick={onClose}>
      <View className='calendar-panel' onClick={(event) => event.stopPropagation()}>
        <View className='calendar-handle' />
        <View className='calendar-header'>
          <Button
            className={`calendar-month-button ${canGoPrevious ? '' : 'is-disabled'}`}
            disabled={!canGoPrevious}
            onClick={() => changeMonth(-1)}
          >‹</Button>
          <Picker
            mode='date'
            fields='month'
            value={`${displayMonth}-01`}
            start={metadata.minDate}
            end={metadata.maxDate}
            onChange={(event) => onMonthChange(event.detail.value.slice(0, 7))}
          >
            <View className='calendar-month-label'>{formatMonth(displayMonth)}⌄</View>
          </Picker>
          <Button
            className={`calendar-month-button ${canGoNext ? '' : 'is-disabled'}`}
            disabled={!canGoNext}
            onClick={() => changeMonth(1)}
          >›</Button>
        </View>

        <View className='calendar-weekdays'>
          {WEEKDAYS.map((weekday) => <Text key={weekday}>{weekday}</Text>)}
        </View>
        <View className='calendar-grid'>
          {cells.map((dateText, index) => {
            if (!dateText) return <View key={`empty-${index}`} className='calendar-cell is-empty' />
            const disabled = !isDateInRange(dateText, metadata.minDate, metadata.maxDate)
            const selected = dateText === selectedDate
            const recorded = recordedDates.has(dateText)
            const classNames = [
              'calendar-cell',
              disabled ? 'is-disabled' : '',
              selected ? 'is-selected' : '',
              recorded ? 'has-record' : ''
            ].filter(Boolean).join(' ')

            return (
              <View
                key={dateText}
                className={classNames}
                onClick={() => { if (!disabled) onSelect(dateText) }}
              >
                <Text className='calendar-day-number'>{Number(dateText.slice(-2))}</Text>
                {recorded && <View className='calendar-record-marker' />}
              </View>
            )
          })}
        </View>
        <Button className='calendar-close-button' onClick={onClose}>关闭</Button>
      </View>
    </View>
  )
}
