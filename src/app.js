
import Taro, { useLaunch } from '@tarojs/taro'

import './app.scss'
import { ensureSession } from './services/auth'

function App({ children }) {
  useLaunch(() => {
    ensureSession().catch(() => {
      Taro.showToast({ title: '登录失败，请检查网络后重试', icon: 'none' })
    })
  })

  // children 是将要会渲染的页面
  return children
}
  


export default App
