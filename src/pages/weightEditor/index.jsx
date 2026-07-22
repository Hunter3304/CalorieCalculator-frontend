import { useEffect, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { getWeightSnapshot, saveWeightRecord, updateWeightRecord } from '../../services/api'
import { formatDisplayDate } from '../../utils/calendar.mjs'
import { getTodayDate } from '../../utils/date'
import { isValidWeightInput } from '../../utils/weightTrend.mjs'
import './index.scss'

export default function WeightEditor() {
  const router = useRouter()
  const selectedDate = router.params.date || getTodayDate()
  const recordId = router.params.recordId ? Number(router.params.recordId) : null
  const sourceDate = router.params.sourceDate || selectedDate
  const editing = Boolean(recordId)
  const [weight, setWeight] = useState(router.params.weightKg || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing && selectedDate > getTodayDate()) {
      Taro.showToast({ title: '未来日期不能记录体重', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 600)
      return
    }
    if (!editing) return
    getWeightSnapshot(sourceDate).then((response) => {
      if (response.statusCode === 200 && response.data && response.data.recordedOnSelectedDate) {
        setWeight(String(response.data.weightKg))
      }
    }).catch(() => Taro.showToast({ title: '体重记录加载失败', icon: 'none' }))
  }, [editing, selectedDate, sourceDate])

  const save = async () => {
    if (saving) return
    if (!isValidWeightInput(weight)) {
      Taro.showToast({ title: '请输入大于 0、最多一位小数的体重', icon: 'none' })
      return
    }

    setSaving(true)
    Taro.showLoading({ title: '保存中...', mask: true })
    try {
      if (editing) await updateWeightRecord(recordId, Number(weight))
      else await saveWeightRecord(selectedDate, Number(weight))
      Taro.showToast({ title: editing ? '修改成功' : '记录成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (error) {
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setSaving(false)
    }
  }

  return (
    <View className='weight-editor-page'>
      <View className='weight-editor-card'>
        <Text className='weight-editor-icon'>⚖️</Text>
        <Text className='weight-editor-title'>{editing ? '修改体重' : '记录体重'}</Text>
        <Text className='weight-editor-date'>记录日期：{formatDisplayDate(editing ? sourceDate : selectedDate)}</Text>
        {editing && sourceDate !== selectedDate && (
          <Text className='weight-editor-note'>当前页面显示的是沿用值，本次将修改上一次真实记录。</Text>
        )}

        <View className='weight-editor-input-wrap'>
          <Input
            className='weight-editor-input'
            type='digit'
            focus
            value={weight}
            placeholder='例如 65.5'
            onInput={(event) => setWeight(event.detail.value)}
          />
          <Text className='weight-editor-unit'>kg</Text>
        </View>
        <Text className='weight-editor-help'>体重需大于 0，最多保留一位小数</Text>

        <Button className='weight-editor-save' loading={saving} disabled={saving} onClick={save}>
          {editing ? '保存修改' : '保存记录'}
        </Button>
      </View>
    </View>
  )
}
