import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'

// 新增了 isCustomTab, onEdit, onDelete 三个 props
export default function FoodList({ list, currentPage, totalPages, onPrev, onNext, onFoodClick, isCustomTab, onEdit, onDelete }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <ScrollView scrollY style={{ flex: 1, padding: '0 15px' }}>
        {list.map(food => (
          <View 
            key={food.id} 
            onClick={() => onFoodClick(food)} 
            style={{ padding: '15px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            {/* 左侧食物名称 */}
            <Text style={{ fontSize: '15px', color: '#333', flex: 1 }}>{food.nameZh}</Text>

            {/* 👇 中间区域：只有在自定义标签页下，才显示删改按钮 👇 */}
            {isCustomTab && (
              <View style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                <View 
                  onClick={(e) => { 
                    e.stopPropagation(); // 关键：阻止点击事件穿透到父级 View
                    if (onEdit) onEdit(food); 
                  }} 
                  style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#f0f5ff', color: '#1890ff', borderRadius: '4px', marginRight: '8px' }}
                >
                  编辑
                </View>
                <View 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onDelete) onDelete(food.id); 
                  }} 
                  style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#fff1f0', color: '#f5222d', borderRadius: '4px' }}
                >
                  删除
                </View>
              </View>
            )}

            {/* 右侧的添加按钮 */}
            <View style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#e6f7ff', color: '#1890ff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', fontWeight: 'bold' }}>
              +
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 分页控制器（自定义列表通常不需要翻页，如果只有一页可以隐藏） */}
      {!isCustomTab && (
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid #eee' }}>
          <Button size="mini" onClick={onPrev} disabled={currentPage === 1}>上一页</Button>
          <Text style={{ fontSize: '12px', color: '#666' }}>{currentPage} / {totalPages}</Text>
          <Button size="mini" onClick={onNext} disabled={currentPage === totalPages}>下一页</Button>
        </View>
      )}
    </View>
  )
}