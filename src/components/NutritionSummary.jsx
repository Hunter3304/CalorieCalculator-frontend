import { Text, View } from '@tarojs/components'
import './contentCards.scss'

export default function NutritionSummary({ summary }) {
  if (!summary) return null
  return (
    <View className='content-card'>
      <Text className='nutrition-total'>🔥 总摄入：{summary.totalCalories || 0} kcal</Text>
      <Text className='nutrition-line'>💪 蛋白质：{(summary.totalProteinMass || 0).toFixed(1)}g（{summary.proteinCalories || 0} kcal）</Text>
      <Text className='nutrition-line'>🍚 碳水：{(summary.totalCarbsMass || 0).toFixed(1)}g（{summary.carbsCalories || 0} kcal）</Text>
      <Text className='nutrition-line'>🥑 脂肪：{(summary.totalFatMass || 0).toFixed(1)}g（{summary.fatCalories || 0} kcal）</Text>
    </View>
  )
}
