import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function DailyList({ records, emptyText = '还没有饮食记录', onDelete, onUpdate }) {

  // 点击修改按钮
  const handleEditClick = (item) => {
    // 微信小程序原生支持带输入框的 Modal
    Taro.showModal({
      title: '修改重量',
      editable: true, // 开启输入框
      placeholderText: `原重量: ${item.weight}g`,
      success: function (res) {
        if (res.confirm && res.content) {
          const newWeight = parseFloat(res.content)
          if (newWeight > 0) {
            onUpdate(item.id, newWeight)
          } else {
            Taro.showToast({ title: '请输入有效数字', icon: 'none' })
          }
        }
      }
    })
  }

  // 点击删除按钮
  const handleDeleteClick = (item) => {
    Taro.showModal({
      title: '提示',
      content: `确定要删除 ${item.nameZh} 吗？`,
      success: function (res) {
        if (res.confirm) {
          onDelete(item.id)
        }
      }
    })
  }

  return (
    <View style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
      <Text style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>📝 已吃清单</Text>
      
      {(!records || records.length === 0) && <Text style={{ color: '#999' }}>{emptyText}</Text>}
      
      {records && records.map((item, index) => (
        <View key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #eee' }}>
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            <Text>{item.nameZh} ({item.weight}g)</Text>
            <Text style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '4px' }}>{item.calories} kcal</Text>
          </View>
          
          {/* 操作按钮区 */}
          <View style={{ display: 'flex', gap: '15px' }}>
            <Text style={{ color: '#1890ff', fontSize: '14px' }} onClick={() => handleEditClick(item)}>修改</Text>
            <Text style={{ color: '#999', fontSize: '14px' }} onClick={() => handleDeleteClick(item)}>删除</Text>
          </View>
        </View>
      ))}
    </View>
  )
}