import { Text, View } from '@tarojs/components'
import { formatDisplayDate } from '../utils/calendar.mjs'
import './weight.scss'

export default function WeightSummaryCard({ snapshot, onEdit, onDelete, onOpenTrend }) {
  const hasWeight = snapshot && snapshot.weightKg !== null && snapshot.weightKg !== undefined
  const isRecorded = Boolean(snapshot && snapshot.recordedOnSelectedDate)

  return (
    <View className='weight-card'>
      <View className='weight-card-main' onClick={onOpenTrend}>
        <View>
          <Text className='weight-card-eyebrow'>⚖️ 体重记录</Text>
          {hasWeight ? (
            <>
              <Text className='weight-card-value'>{Number(snapshot.weightKg).toFixed(1)} kg</Text>
              <Text className='weight-card-caption'>
                {isRecorded ? '当前日期的真实记录' : `沿用 ${formatDisplayDate(snapshot.sourceDate)} 的记录`}
              </Text>
            </>
          ) : (
            <Text className='weight-card-empty'>暂无体重记录</Text>
          )}
        </View>
        <Text className='weight-card-trend'>查看趋势 ›</Text>
      </View>

      {hasWeight && (
        <View className='weight-card-actions'>
          <Text className='weight-card-action' onClick={onEdit}>编辑</Text>
          {isRecorded && <Text className='weight-card-action is-delete' onClick={onDelete}>删除</Text>}
        </View>
      )}
    </View>
  )
}
