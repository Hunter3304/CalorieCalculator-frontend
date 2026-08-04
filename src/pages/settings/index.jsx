import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'

import { deleteAccount, getAccount, logoutSession } from '../../services/auth'
import './index.scss'

export default function Settings() {
  const [createdAt, setCreatedAt] = useState('')
  const [signedOut, setSignedOut] = useState(false)
  const [deleted, setDeleted] = useState(false)

  useDidShow(() => {
    if (signedOut || deleted) return
    getAccount()
      .then((response) => setCreatedAt((response.data && response.data.createdAt) || ''))
      .catch(() => Taro.showToast({ title: '账号信息加载失败', icon: 'none' }))
  })

  const logout = async () => {
    Taro.showLoading({ title: '退出中...' })
    try {
      await logoutSession()
      setSignedOut(true)
      Taro.showToast({ title: '已退出登录', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '退出失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const confirmDelete = () => {
    Taro.showModal({
      title: '删除账号及全部数据',
      content: '此操作将永久删除饮食、体重、围度和自定义食物记录，且无法恢复。确定继续吗？',
      confirmText: '永久删除',
      confirmColor: '#c43d3d',
      success: async (result) => {
        if (!result.confirm) return
        Taro.showLoading({ title: '删除中...' })
        try {
          await deleteAccount()
          setDeleted(true)
          Taro.showToast({ title: '账号及数据已删除', icon: 'success' })
        } catch (error) {
          Taro.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
        } finally {
          Taro.hideLoading()
        }
      }
    })
  }

  if (signedOut || deleted) {
    return (
      <View className='settings-page'>
        <View className='settings-card result-card'>
          <Text className='settings-title'>{deleted ? '账号及个人数据已删除' : '已退出登录'}</Text>
          <Text className='settings-copy'>再次使用记录功能时，小程序会通过微信自动创建新的安全会话。</Text>
          <Button className='primary-button' onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>
            返回首页
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className='settings-page'>
      <View className='settings-card'>
        <Text className='settings-title'>账号</Text>
        <Text className='settings-copy'>当前账号通过微信小程序登录标识建立，不读取微信昵称、头像或手机号。</Text>
        {createdAt && <Text className='account-date'>创建时间：{createdAt.slice(0, 10)}</Text>}
      </View>

      <View className='settings-card'>
        <Text className='settings-title'>我们保存的数据</Text>
        <Text className='settings-copy'>饮食记录、自定义食物、体重和身体围度仅用于本小程序的记录、汇总和趋势展示。</Text>
        <Text className='settings-copy'>每次请求都由服务端根据安全会话识别当前用户；客户端不会保存或展示 OpenID，也不会携带可伪造的用户编号。</Text>
      </View>

      <View className='settings-card'>
        <Text className='settings-title'>数据控制</Text>
        <Text className='settings-copy'>退出登录会撤销当前会话。删除账号会永久删除全部个人记录和自定义食物。</Text>
        <Button className='secondary-button' onClick={logout}>退出登录</Button>
        <Button className='danger-button' onClick={confirmDelete}>删除账号及全部数据</Button>
      </View>
    </View>
  )
}
