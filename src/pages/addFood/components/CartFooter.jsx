import React from 'react'
import { View, Text, Button } from '@tarojs/components'

export default function CartFooter({ cartCount, onSave }) {
  return (
    <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', zIndex: 10 }}>
      <Text style={{ fontSize: '14px', color: '#333' }}>已选 <Text style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '18px' }}>{cartCount}</Text> 项</Text>
      <Button type="primary" size="mini" onClick={onSave} style={{ margin: 0, backgroundColor: '#1890ff' }}>确认保存</Button>
    </View>
  )
}