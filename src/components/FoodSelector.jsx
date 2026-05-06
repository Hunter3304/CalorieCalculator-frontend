import React, { useState } from 'react'
import { View, Text, Input, Picker, Button } from '@tarojs/components'

export default function FoodSelector({ foodList, onAddFood }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [weight, setWeight] = useState(100)

  const handleAdd = () => {
    if (foodList.length === 0 || weight <= 0) return
    const foodId = foodList[selectedIndex].id
    onAddFood(foodId, weight) // 触发父组件传过来的添加事件
  }

  if (!foodList || foodList.length === 0) return <View><Text>加载中...</Text></View>

  return (
    <View style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
      <Picker mode="selector" range={foodList} rangeKey="nameZh" onChange={(e) => setSelectedIndex(e.detail.value)}>
        <View style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
          🥑 食物: {foodList[selectedIndex]?.nameZh} ▼
        </View>
      </Picker>
      <View style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
        <Text>⚖️ 重量(克): </Text>
        <Input type="digit" value={weight} onInput={(e) => setWeight(parseFloat(e.detail.value) || 0)} style={{ marginLeft: '10px', flex: 1 }} />
      </View>
      <Button type="primary" onClick={handleAdd} style={{ marginTop: '15px', backgroundColor: '#07c160' }}>+ 添 加</Button>
    </View>
  )
}