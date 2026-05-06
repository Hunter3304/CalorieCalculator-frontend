import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { addCustomFood, updateCustomFood } from '../../../services/api' // 👈 加上了 updateCustomFood

// 新增了 editData 属性，如果有值说明是“编辑模式”，为空说明是“新建模式”
export default function CreateCustomModal({ isOpen, onClose, onSuccess, editData }) {
  const [formData, setFormData] = useState({ nameZh: '', proteinPer100g: '', carbsPer100g: '', fatPer100g: '' })

  // 监听打开状态和 editData，动态填充表单
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 编辑模式：把老数据塞进去
        setFormData({
          nameZh: editData.nameZh || '',
          proteinPer100g: editData.proteinPer100g || '',
          carbsPer100g: editData.carbsPer100g || '',
          fatPer100g: editData.fatPer100g || ''
        })
      } else {
        // 新建模式：清空表单
        setFormData({ nameZh: '', proteinPer100g: '', carbsPer100g: '', fatPer100g: '' })
      }
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleInput = (key, value) => setFormData(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    const { nameZh, proteinPer100g, carbsPer100g, fatPer100g } = formData
    if (!nameZh.trim()) return Taro.showToast({ title: '请输入名称', icon: 'none' })

    Taro.showLoading({ title: '保存中...', mask: true })
    try {
      const payload = {
        nameZh,
        proteinPer100g: parseFloat(proteinPer100g || 0),
        carbsPer100g: parseFloat(carbsPer100g || 0),
        fatPer100g: parseFloat(fatPer100g || 0)
      }

      // 👇 核心判断：是更新还是新建？
      if (editData) {
        await updateCustomFood(editData.id, payload)
        Taro.showToast({ title: '修改成功', icon: 'success' })
      } else {
        await addCustomFood(payload)
        Taro.showToast({ title: '创建成功', icon: 'success' })
      }
      
      onSuccess() // 通知父组件刷新列表
    } catch (e) {
      Taro.hideLoading()
      Taro.showToast({ title: editData ? '修改失败' : '创建失败', icon: 'none' })
    }
  }

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: '12px', padding: '20px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', display: 'block', marginBottom: '20px' }}>
          {editData ? '修改自定义食物' : '添加自定义食物'} 
        </Text>
        
        <Input placeholder="食物名称 (如: 秘制鸡胸肉)" value={formData.nameZh} onInput={(e) => handleInput('nameZh', e.detail.value)} style={{ borderBottom: '1px solid #eee', padding: '10px 0', marginBottom: '15px' }} />
        
        <View style={{ backgroundColor: '#f7f8fa', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
          <Text style={{ fontSize: '12px', color: '#999', marginBottom: '10px', display: 'block' }}>每 100 克营养含量 (g)</Text>
          <View style={{ display: 'flex', marginBottom: '8px' }}><Text style={{ width: '60px' }}>蛋白质</Text><Input type="digit" placeholder="0" value={formData.proteinPer100g} onInput={(e) => handleInput('proteinPer100g', e.detail.value)} style={{ flex: 1, borderBottom: '1px solid #ddd' }} /></View>
          <View style={{ display: 'flex', marginBottom: '8px' }}><Text style={{ width: '60px' }}>碳水</Text><Input type="digit" placeholder="0" value={formData.carbsPer100g} onInput={(e) => handleInput('carbsPer100g', e.detail.value)} style={{ flex: 1, borderBottom: '1px solid #ddd' }} /></View>
          <View style={{ display: 'flex' }}><Text style={{ width: '60px' }}>脂肪</Text><Input type="digit" placeholder="0" value={formData.fatPer100g} onInput={(e) => handleInput('fatPer100g', e.detail.value)} style={{ flex: 1, borderBottom: '1px solid #ddd' }} /></View>
        </View>

        <View style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="mini" onClick={onClose} style={{ width: '45%' }}>取消</Button>
          <Button size="mini" type="primary" onClick={handleSubmit} style={{ width: '45%', backgroundColor: '#1890ff' }}>
            {editData ? '保存修改' : '确定添加'}
          </Button>
        </View>
      </View>
    </View>
  )
}