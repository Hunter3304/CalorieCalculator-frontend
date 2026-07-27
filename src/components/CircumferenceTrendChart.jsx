import { useEffect } from 'react'
import { Canvas, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './circumference.scss'

const CANVAS_ID = 'body-circumference-trend-chart'

export default function CircumferenceTrendChart({ points = [] }) {
  const windowWidth = Taro.getSystemInfoSync().windowWidth
  const width = Math.max(240, Math.min(335, windowWidth - 52))
  const hasData = points.some((point) => point.valueCm !== null && point.valueCm !== undefined)

  useEffect(() => {
    const context = Taro.createCanvasContext(CANVAS_ID)
    const height = 210
    const padding = { top: 24, right: 16, bottom: 34, left: 42 }
    context.clearRect(0, 0, width, height)
    if (!hasData) {
      context.draw()
      return
    }

    const values = points
      .filter((point) => point.valueCm !== null && point.valueCm !== undefined)
      .map((point) => Number(point.valueCm))
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const min = rawMin === rawMax ? rawMin - 1 : rawMin
    const max = rawMin === rawMax ? rawMax + 1 : rawMax
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom
    const xFor = (index) => padding.left + (
      points.length === 1 ? plotWidth / 2 : index * plotWidth / (points.length - 1)
    )
    const yFor = (value) => padding.top + (max - value) * plotHeight / (max - min)

    context.setStrokeStyle('#d8eadc')
    context.setLineWidth(1)
    for (let line = 0; line <= 3; line += 1) {
      const y = padding.top + line * plotHeight / 3
      context.beginPath()
      context.moveTo(padding.left, y)
      context.lineTo(width - padding.right, y)
      context.stroke()
    }

    context.setFillStyle('#78927e')
    context.setFontSize(11)
    context.fillText(`${rawMax.toFixed(1)}`, 4, padding.top + 4)
    context.fillText(`${rawMin.toFixed(1)}`, 4, padding.top + plotHeight + 4)

    context.setStrokeStyle('#4f9f68')
    context.setLineWidth(3)
    context.setLineJoin('round')
    context.beginPath()
    let started = false
    points.forEach((point, index) => {
      if (point.valueCm === null || point.valueCm === undefined) return
      const x = xFor(index)
      const y = yFor(Number(point.valueCm))
      if (!started) {
        context.moveTo(x, y)
        started = true
      } else {
        context.lineTo(x, y)
      }
    })
    context.stroke()

    points.forEach((point, index) => {
      if (!point.recorded || point.valueCm === null || point.valueCm === undefined) return
      context.setFillStyle('#2f7d4a')
      context.beginPath()
      context.arc(xFor(index), yFor(Number(point.valueCm)), 4, 0, Math.PI * 2)
      context.fill()
    })

    context.setFillStyle('#78927e')
    context.setFontSize(10)
    context.fillText(points[0].date.slice(5), padding.left, height - 10)
    const endLabel = points[points.length - 1].date.slice(5)
    context.fillText(endLabel, width - padding.right - 32, height - 10)
    context.draw()
  }, [hasData, points, width])

  if (!hasData) {
    return <View className='circumference-chart-empty'><Text>这个区间还没有该项围度数据</Text></View>
  }

  return (
    <View className='circumference-chart-wrap'>
      <Canvas canvasId={CANVAS_ID} style={{ width: `${width}px`, height: '210px' }} />
      <View className='circumference-chart-legend'>
        <View className='circumference-chart-dot' />
        <Text>圆点为真实记录，连线区间为沿用围度</Text>
      </View>
    </View>
  )
}
