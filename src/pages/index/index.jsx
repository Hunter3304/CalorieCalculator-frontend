import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function Index() {
  const [foodList, setFoodList] = useState([]) 
  const [selectedIndex, setSelectedIndex] = useState(0) 
  const [weight, setWeight] = useState(100) 
  
  // 原本分开存的卡路里等状态，现在统一用后端返回的 result 对象
  const [calcResult, setCalcResult] = useState({
    protein: 0, carbs: 0, fat: 0, totalCalories: 0
  })

  // 1. 页面加载获取列表
  useEffect(() => {
    fetchFoodList()
  }, [])

  const fetchFoodList = async () => {
    try {
      const res = await Taro.request({ url: 'http://localhost:8080/api/foods', method: 'GET' })
      if (res.statusCode === 200 && res.data.length > 0) {
        setFoodList(res.data)
        // 拿到列表后，立刻让后端算一下第一个食物的 100g 热量
        fetchCalculation(res.data[0].id, 100) 
      }
    } catch (error) {
      Taro.showToast({ title: '网络请求失败', icon: 'none' })
    }
  }

  // 2. 核心大变动：不再自己算，而是去请求后端的计算接口！
  const fetchCalculation = async (foodId, currentWeight) => {
    if (!foodId || currentWeight <= 0) return

    try {
      // 这里的 URL 拼接了我们要计算的食物 ID 和 重量参数
      const res = await Taro.request({
        url: `http://localhost:8080/api/foods/${foodId}/calculate?weight=${currentWeight}`,
        method: 'GET'
      })
      if (res.statusCode === 200) {
        setCalcResult(res.data) // 直接把后端算好的结果塞进状态里！
      }
    } catch (error) {
      console.error('计算请求失败', error)
    }
  }

  // --- 事件处理 ---
  const handleFoodChange = (e) => {
    const idx = e.detail.value
    setSelectedIndex(idx)
    fetchCalculation(foodList[idx].id, weight) // 选完食物，找后端算
  }

  // 注意：为了防止每输入一个数字就狂发请求轰炸后端，我们改用 onBlur (输入框失去焦点时才请求)
  const handleWeightBlur = (e) => {
    const val = parseFloat(e.detail.value) || 0
    setWeight(val)
    if (foodList.length > 0) {
      fetchCalculation(foodList[selectedIndex].id, val) // 填完重量，找后端算
    }
  }

  if (foodList.length === 0) return <View><Text>加载中...</Text></View>
  const currentFood = foodList[selectedIndex]

  // --- 界面渲染 ---
  return (
    <View style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '20px' }}>
        卡路里计算器 (后端计算版)
      </Text>

      <View style={{ marginBottom: '20px' }}>
        <Text style={{ display: 'block', marginBottom: '8px' }}>1. 选择食物:</Text>
        <Picker mode="selector" range={foodList} rangeKey="nameZh" onChange={handleFoodChange}>
          <View style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}>
            {currentFood.nameZh} / {currentFood.nameEn} ▼
          </View>
        </Picker>
      </View>

      <View style={{ marginBottom: '30px' }}>
        <Text style={{ display: 'block', marginBottom: '8px' }}>2. 摄入重量 (克):</Text>
        <Input 
          type="digit" 
          defaultValue={weight} 
          onBlur={handleWeightBlur} // <--- 注意这里改成了 onBlur
          style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}
        />
        <Text style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>* 输入完成后点击空白处，后端将进行计算</Text>
      </View>

      <View style={{ padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '12px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>营养素分析:</Text>
        <Text style={{ display: 'block' }}>💪 蛋白质: {calcResult.protein?.toFixed(1)} g</Text>
        <Text style={{ display: 'block' }}>🍚 碳水: {calcResult.carbs?.toFixed(1)} g</Text>
        <Text style={{ display: 'block' }}>🥑 脂肪: {calcResult.fat?.toFixed(1)} g</Text>
        <View style={{ borderTop: '1px dashed #ccc', marginTop: '15px', paddingTop: '15px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>🔥 总热量: <Text style={{ color: '#ff4d4f', fontSize: '28px' }}>{calcResult.totalCalories} kcal</Text></Text>
        </View>
      </View>
    </View>
  )
}