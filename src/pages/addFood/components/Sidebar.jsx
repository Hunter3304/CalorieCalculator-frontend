import React from 'react'
import { View } from '@tarojs/components'

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <View style={{ width: '90px', backgroundColor: '#f2f2f2', height: '100%' }}>
      <View 
        onClick={() => onTabChange('recent')}
        style={{ padding: '15px 0', textAlign: 'center', fontSize: '14px', backgroundColor: activeTab === 'recent' ? '#fff' : 'transparent', borderLeft: activeTab === 'recent' ? '4px solid #1890ff' : '4px solid transparent', fontWeight: activeTab === 'recent' ? 'bold' : 'normal' }}
      >
        全部/最近
      </View>
      <View 
        onClick={() => onTabChange('custom')}
        style={{ padding: '15px 0', textAlign: 'center', fontSize: '14px', color: '#999' }}
      >
        自定义
      </View>
    </View>
  )
}