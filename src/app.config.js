export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/addFood/index',
    'pages/weightEditor/index',
    'pages/weightTrend/index',
    'pages/circumferenceEditor/index',
    'pages/circumferenceTrend/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#eff8f1',
    navigationBarTitleText: '卡路里计算器',
    navigationBarTextStyle: 'black'
  }
})
