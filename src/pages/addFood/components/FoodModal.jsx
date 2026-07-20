import { View, Text, Input, Button } from '@tarojs/components'

export default function FoodModal({ isOpen, food, weight, isSaving, onWeightChange, onCancel, onConfirm }) {
  if (!isOpen || !food) return null

  const calPer100g = Math.round(food.proteinPer100g * 4 + food.carbsPer100g * 4 + food.fatPer100g * 9)

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: '10px', padding: '20px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '15px' }}>{food.nameZh}</Text>
        
        <View style={{ backgroundColor: '#f7f8fa', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          <Text style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>每 100 克含量：</Text>
          <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <Text>🔥 卡路里: <Text style={{ color: '#ff4d4f' }}>{calPer100g}</Text> kcal</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '8px' }}>
            <Text>🥚 蛋白: {food.proteinPer100g}g</Text>
            <Text>🍚 碳水: {food.carbsPer100g}g</Text>
            <Text>🥩 脂肪: {food.fatPer100g}g</Text>
          </View>
        </View>

        <View style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1890ff', paddingBottom: '5px', marginBottom: '20px' }}>
          <Input type='digit' placeholder='请输入食用重量' value={weight} onInput={(e) => onWeightChange(e.detail.value)} style={{ flex: 1, fontSize: '16px', textAlign: 'center' }} autoFocus />
          <Text style={{ marginLeft: '10px', color: '#333' }}>克 (g)</Text>
        </View>

        <View style={{ display: 'flex', justifyContent: 'space-around' }}>
          <Button size='mini' onClick={onCancel} disabled={isSaving}>取消</Button>
          <Button size='mini' type='primary' loading={isSaving} disabled={isSaving} onClick={onConfirm}>确定添加</Button>
        </View>
      </View>
    </View>
  )
}