import { useEffect, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { getCircumferenceSnapshot, saveCircumferenceRecord } from '../../services/api'
import { formatDisplayDate } from '../../utils/calendar.mjs'
import {
  buildCircumferencePayload,
  CIRCUMFERENCE_FIELDS,
  createCircumferenceInputs,
  createEmptyCircumferenceSnapshot,
  isValidCircumferenceInput
} from '../../utils/circumference.mjs'
import { getTodayDate } from '../../utils/date'
import './index.scss'

const emptyInputs = () => createCircumferenceInputs(null)

export default function CircumferenceEditor() {
  const router = useRouter()
  const selectedDate = router.params.date || getTodayDate()
  const [snapshot, setSnapshot] = useState(createEmptyCircumferenceSnapshot(selectedDate))
  const [inputs, setInputs] = useState(emptyInputs())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedDate > getTodayDate()) {
      Taro.showToast({ title: '未来日期不能记录围度', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 600)
      return
    }

    getCircumferenceSnapshot(selectedDate).then((response) => {
      if (response.statusCode === 200 && response.data) {
        setSnapshot(response.data)
        setInputs(createCircumferenceInputs(response.data))
      }
    }).catch(() => {
      Taro.showToast({ title: '围度记录加载失败', icon: 'none' })
    }).finally(() => setLoading(false))
  }, [selectedDate])

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }))
  }

  const save = async () => {
    if (saving || loading) return
    const invalid = CIRCUMFERENCE_FIELDS.some(
      (field) => !isValidCircumferenceInput(inputs[field.key])
    )
    if (invalid) {
      Taro.showToast({ title: '围度需大于 0，最多一位小数', icon: 'none' })
      return
    }

    const payload = buildCircumferencePayload(inputs, snapshot)
    setSaving(true)
    Taro.showLoading({ title: '保存中...', mask: true })
    try {
      await saveCircumferenceRecord(selectedDate, payload)
      const noChange = Object.keys(payload).length === 0
      Taro.showToast({ title: noChange ? '已沿用最近记录' : '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (error) {
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setSaving(false)
    }
  }

  return (
    <View className='circumference-editor-page'>
      <View className='circumference-editor-card'>
        <Text className='circumference-editor-icon'>📏</Text>
        <Text className='circumference-editor-title'>记录围度</Text>
        <Text className='circumference-editor-date'>记录日期：{formatDisplayDate(selectedDate)}</Text>
        <Text className='circumference-editor-note'>
          可只填写本次测量的项目。留空会沿用该项目最近一次记录；从未记录则显示 --。
        </Text>

        <View className='circumference-editor-grid'>
          {CIRCUMFERENCE_FIELDS.map((field) => {
            const effective = snapshot[field.key]
            const inherited = effective
              && !effective.recordedOnSelectedDate
              && effective.valueCm !== null
              && effective.valueCm !== undefined
            return (
              <View key={field.key} className='circumference-editor-field'>
                <View className='circumference-editor-field-header'>
                  <Text className='circumference-editor-label'>{field.label}</Text>
                  {inherited && (
                    <Text className='circumference-editor-inherited'>
                      沿用 {Number(effective.valueCm).toFixed(1)}
                    </Text>
                  )}
                </View>
                <View className='circumference-editor-input-wrap'>
                  <Input
                    className='circumference-editor-input'
                    type='digit'
                    value={inputs[field.key]}
                    placeholder='--'
                    onInput={(event) => updateInput(field.key, event.detail.value)}
                  />
                  <Text className='circumference-editor-unit'>cm</Text>
                </View>
              </View>
            )
          })}
        </View>

        <Text className='circumference-editor-help'>
          清空当前日期已有的数值后保存，该项目将恢复沿用更早记录。
        </Text>
        <Button
          className='circumference-editor-save'
          loading={saving}
          disabled={saving || loading}
          onClick={save}
        >
          保存围度
        </Button>
      </View>
    </View>
  )
}
