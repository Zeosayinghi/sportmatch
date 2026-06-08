import { useState, useEffect, useCallback } from 'react'
import { fetchCourts } from '../services/iplayApi.js'
import { supabase } from '../lib/supabase.js'

/**
 * 球場資料 hook
 * - 自動嘗試 iPlay OData API（透過 Vite proxy）
 * - 失敗時自動 fallback 至本地 mock data
 * - 支援使用者定位，定位後重新計算距離
 */
export function useCourts() {
  const [courts,     setCourts]   = useState([])
  const [loading,    setLoading]  = useState(true)
  const [error,      setError]    = useState(null)
  const [dataSource, setSource]   = useState(null)  // 'iplay' | 'fallback'
  const [userPos,    setUserPos]  = useState(null)  // { lat, lng }

  // Convert a Supabase venue record to the same shape as iPlay courts
  function venueToCourtShape(v) {
    return {
      id: `venue_${v.id}`,
      name: v.venue_name || '未命名球場',
      city: v.address ? v.address.slice(0, 3) : '未知',
      district: v.address ? v.address.slice(3, 6) : '',
      address: v.address || '',
      lat: null,
      lng: null,
      sports: v.sports || [],
      price: 0,
      phone: '',
      hours: v.open_time && v.close_time ? `${v.open_time}-${v.close_time}` : '洽詢球場',
      rating: 5.0,
      totalCourts: 1,
      freeCourts: v.is_open ? 1 : 0,
      occupancy: 0,
      status: v.is_open ? 'free' : 'closed',
      distance: 9999,
      isVenueAccount: true,
    }
  }

  const load = useCallback(async (lat = null, lng = null) => {
    setLoading(true)
    setError(null)
    try {
      const [{ courts: data, source, error: apiError }, venueRes] = await Promise.all([
        fetchCourts(lat, lng),
        supabase.from('venues').select('*').eq('is_open', true),
      ])
      const venueCourts = (venueRes.data || []).map(venueToCourtShape)
      setCourts([...venueCourts, ...data])
      setSource(source)
      if (apiError) setError(apiError)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始載入
  useEffect(() => { load() }, [load])

  // 定位使用者，定位成功後重新載入（帶座標計算距離）
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        setUserPos(pos)
        load(pos.lat, pos.lng)
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [load])

  // 更新單一球場（預約後更新狀態）
  const updateCourt = useCallback((id, patch) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  return { courts, setCourts, loading, error, dataSource, userPos, locateUser, updateCourt }
}
