import { useState, useEffect, useRef } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
// 确保 api.js 中已导出 deleteCustomFood
import { getFoodsByPage, addDailyRecord, searchFoods, getCustomFoods, deleteCustomFood } from '../../services/api'
import { getTodayDate } from '../../utils/date'

import Sidebar from './components/Sidebar'
import FoodList from './components/FoodList'
import FoodModal from './components/FoodModal'
import CreateCustomModal from './components/CreateCustomModal'

export default function AddFood() {
  const router = useRouter()
  const selectedDate = router.params.date || getTodayDate()
  // --- 1. 状态管理 ---
  const [activeTab, setActiveTab] = useState('recent')
  const [foodList, setFoodList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  
  const [customList, setCustomList] = useState([]) 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false) 
  const [editingCustomFood, setEditingCustomFood] = useState(null) // 👇 新增：记录当前编辑对象

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFood, setCurrentFood] = useState(null)
  const [weightInput, setWeightInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // --- 2. 生命周期与 API 逻辑 ---
  useEffect(() => {
    fetchFoodPage(1)
  }, [])

  useEffect(() => {
    if (activeTab === 'custom') {
      fetchCustomFoods()
    }
  }, [activeTab])

  const fetchFoodPage = async (page) => {
    Taro.showLoading({ title: '加载中...' })
    try {
      const res = await getFoodsByPage(page, 10)
      if (res.statusCode === 200) {
        setFoodList(res.data.list)
        setCurrentPage(res.data.page)
        setTotalPages(res.data.totalPages)
      }
    } catch (e) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const fetchCustomFoods = async () => {
    try {
      const res = await getCustomFoods()
      if (res.statusCode === 200) setCustomList(res.data || [])
    } catch (e) {
      console.log('获取自定义食物失败')
    }
  }

  // --- 3. 交互事件处理 ---
  // 删除自定义食物
  const handleDeleteCustom = (id) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义食物吗？',
      success: async (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '删除中...' })
          try {
            await deleteCustomFood(id)
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchCustomFoods() // 刷新列表
          } catch (e) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 编辑自定义食物
  const handleEditCustom = (food) => {
    setEditingCustomFood(food)
    setIsCreateModalOpen(true)
  }

  const openModal = (food) => {
    setCurrentFood(food)
    setWeightInput('')
    setIsModalOpen(true)
  }

  const handleConfirmAdd = async () => {
    if (isSaving) return

    const weight = parseFloat(weightInput)
    if (!weight || weight <= 0) {
      Taro.showToast({ title: '请输入有效克数', icon: 'none' })
      return
    }

    setIsSaving(true)
    Taro.showLoading({ title: '保存中...', mask: true })
    try {
      await addDailyRecord({ foodId: currentFood.id, weight, date: selectedDate })
      setIsModalOpen(false)
      Taro.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 600)
    } catch (error) {
      console.error('Failed to add daily record', error)
      Taro.showToast({ title: '添加失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSaving(false)
    }
  }
  // --- 4. 实时搜索逻辑 (带防抖) ---
  const searchTimer = useRef(null)
  const performSearch = async (keyword) => {
    Taro.showLoading({ title: '搜索中...' })
    try {
      const res = await searchFoods(keyword)
      if (res.statusCode === 200) {
        setFoodList(res.data || [])
        setCurrentPage(1)
        setTotalPages(1)
      }
    } catch (e) {
      Taro.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleInput = (e) => {
    const val = e.detail.value
    setSearchKeyword(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!val.trim()) {
      fetchFoodPage(1)
      return
    }
    searchTimer.current = setTimeout(() => { performSearch(val) }, 500)
  }

  // --- 5. 视图组装 ---
  return (
    <View style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f7f8fa', position: 'relative' }}>
      <View style={{ padding: '10px 15px', backgroundColor: '#fff', zIndex: 5 }}>
        <Text style={{ display: 'block', marginBottom: '8px', color: '#475467', fontSize: '13px' }}>记录日期：{selectedDate}</Text>
        <View style={{ backgroundColor: '#f2f2f2', borderRadius: '20px', padding: '8px 15px', display: 'flex', alignItems: 'center' }}>
          <Text style={{ marginRight: '10px', color: '#999' }}>🔍</Text>
          <Input 
            placeholder='搜索食物 (如: 苹果, 鸡胸肉)'
            style={{ flex: 1, fontSize: '14px' }} 
            value={searchKeyword}
            onInput={handleInput}
          />
        </View>
      </View>

      <View style={{ flex: 1, display: 'flex', overflow: 'hidden', marginBottom: '60px' }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'recent' ? (
          <FoodList 
            list={foodList} 
            currentPage={currentPage} 
            totalPages={totalPages}
            onPrev={() => fetchFoodPage(currentPage - 1)}
            onNext={() => fetchFoodPage(currentPage + 1)}
            onFoodClick={openModal}
          />
        ) : (
          <View style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
            <View style={{ padding: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <Button 
                style={{ backgroundColor: '#1890ff', color: '#fff', borderRadius: '20px', fontSize: '14px' }}
                onClick={() => {
                  setEditingCustomFood(null); // 清空编辑状态，进入新建模式
                  setIsCreateModalOpen(true);
                }}
              >
                + 新建自定义食物
              </Button>
            </View>
            
            <View style={{ flex: 1, overflow: 'hidden' }}>
              {customList.length > 0 ? (
                <FoodList 
                  list={customList} 
                  onFoodClick={openModal}
                  isCustomTab           // 👇 开启管理按钮
                  onEdit={handleEditCustom}    // 👇 挂载编辑
                  onDelete={handleDeleteCustom}// 👇 挂载删除
                />
              ) : (
                <View style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>还没有自定义食物</View>
              )}
            </View>
          </View>
        )}
      </View>

      <FoodModal 
        isOpen={isModalOpen} 
        food={currentFood} 
        weight={weightInput} 
        isSaving={isSaving}
        onWeightChange={setWeightInput}
        onCancel={() => {
          if (!isSaving) setIsModalOpen(false)
        }}
        onConfirm={handleConfirmAdd} 
      />

      <CreateCustomModal 
        isOpen={isCreateModalOpen} 
        editData={editingCustomFood} // 👇 传入编辑数据
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingCustomFood(null)
        }}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          setEditingCustomFood(null)
          fetchCustomFoods()
        }}
      />
    </View>
  )
}