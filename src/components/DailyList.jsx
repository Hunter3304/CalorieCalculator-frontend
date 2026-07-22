import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './contentCards.scss'

export default function DailyList({ records, emptyText = '还没有饮食记录', onDelete, onUpdate }) {
  const edit = (item) => {
    Taro.showModal({
      title: '修改重量',
      editable: true,
      placeholderText: `原重量: ${item.weight}g`,
      success: (result) => {
        if (!result.confirm || !result.content) return
        const weight = Number(result.content)
        if (weight > 0) onUpdate(item.id, weight)
        else Taro.showToast({ title: '请输入有效数字', icon: 'none' })
      }
    })
  }

  const remove = (item) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除 ${item.nameZh} 吗？`,
      success: (result) => { if (result.confirm) onDelete(item.id) }
    })
  }

  return (
    <View className='content-card'>
      <Text className='content-card-title'>📝 已吃清单</Text>
      {(!records || records.length === 0) && <Text className='daily-empty'>{emptyText}</Text>}
      {(records || []).map((item) => (
        <View key={item.id} className='daily-row'>
          <View>
            <Text className='daily-name'>{item.nameZh} ({item.weight}g)</Text>
            <Text className='daily-calories'>{item.calories} kcal</Text>
          </View>
          <View className='daily-actions'>
            <Text className='daily-action' onClick={() => edit(item)}>修改</Text>
            <Text className='daily-action is-delete' onClick={() => remove(item)}>删除</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
