import React from 'react'
import { View, Text } from '@tarojs/components'

export default function NutritionSummary({ summary }) {
  if (!summary) return null;

  return (
    <View style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px' }}>
      <Text style={{ fontWeight: 'bold', fontSize: '18px', display: 'block', marginBottom: '10px' }}>
        🔥 总摄入: {summary.totalCalories || 0} kcal
      </Text>
      
      <Text style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '5px' }}>
        💪 蛋白质: {(summary.totalProteinMass || 0).toFixed(1)}g ({summary.proteinCalories || 0} kcal)
      </Text>
      <Text style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '5px' }}>
        🍚 碳水: {(summary.totalCarbsMass || 0).toFixed(1)}g ({summary.carbsCalories || 0} kcal)
      </Text>
      <Text style={{ display: 'block', color: '#666', fontSize: '14px' }}>
        🥑 脂肪: {(summary.totalFatMass || 0).toFixed(1)}g ({summary.fatCalories || 0} kcal)
      </Text>
    </View>
  )
}