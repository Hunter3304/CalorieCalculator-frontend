import { Text, View } from '@tarojs/components'
import { CIRCUMFERENCE_FIELDS } from '../utils/circumference.mjs'
import './circumference.scss'

export default function CircumferenceSummaryCard({
  snapshot,
  onEdit,
  onDelete,
  onOpenTrend
}) {
  const hasAnyValue = CIRCUMFERENCE_FIELDS.some((field) => {
    const item = snapshot && snapshot[field.key]
    return item && item.valueCm !== null && item.valueCm !== undefined
  })

  return (
    <View className='circumference-card'>
      <View className='circumference-card-header' onClick={onOpenTrend}>
        <View>
          <Text className='circumference-card-eyebrow'>📏 围度记录</Text>
          <Text className='circumference-card-caption'>
            {hasAnyValue ? '空缺项目自动沿用最近记录' : '还没有围度记录'}
          </Text>
        </View>
        <Text className='circumference-card-trend'>查看趋势 ›</Text>
      </View>

      <View className='circumference-grid'>
        {CIRCUMFERENCE_FIELDS.map((field) => {
          const item = snapshot && snapshot[field.key]
          const hasValue = item && item.valueCm !== null && item.valueCm !== undefined
          return (
            <View
              key={field.key}
              className={`circumference-item ${item && item.recordedOnSelectedDate ? 'is-recorded' : ''}`}
            >
              <Text className='circumference-item-label'>{field.label}</Text>
              <Text className='circumference-item-value'>
                {hasValue ? Number(item.valueCm).toFixed(1) : '--'}
                {hasValue && <Text className='circumference-item-unit'> cm</Text>}
              </Text>
            </View>
          )
        })}
      </View>

      <View className='circumference-card-actions'>
        <Text className='circumference-card-action' onClick={onEdit}>
          {snapshot && snapshot.recordId ? '编辑' : '记录'}
        </Text>
        {snapshot && snapshot.recordId && (
          <Text className='circumference-card-action is-delete' onClick={onDelete}>删除</Text>
        )}
      </View>
    </View>
  )
}
