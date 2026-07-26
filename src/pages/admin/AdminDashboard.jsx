import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ShoppingBag, DollarSign, Package, AlertTriangle, TrendingUp, Clock, Video, Upload, Loader2, ImagePlus, X, GripVertical } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatINR } from '../../utils/format'
import { getSetting, setSetting } from '../../services/settingsService'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const GOLD_COLORS = ['#C8A23A', '#A88422', '#8B5E3C', '#2C241B', '#D4AF37', '#6F655A', '#E4C55A', '#B8860B']

// Hero Images Manager — admin can upload/paste up to 5 carousel images for the homepage hero
function HeroImagesManager() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  useEffect(() => {
    getSetting('hero_images').then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length) setImages(p) } catch {} }
    }).catch(() => {})
  }, [])

  const persist = async (updated) => {
    setSaving(true)
    try {
      await setSetting('hero_images', JSON.stringify(updated))
      setImages(updated)
      toast.success('Hero images saved!')
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - images.length)
    if (!files.length) { toast.error('Max 5 images allowed'); return }
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); continue }
        if (file.size > 8 * 1024 * 1024) { toast.error(`${file.name} is over 8MB`); continue }
        const ext = file.name.split('.').pop()
        const path = `hero/img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true, contentType: file.type })
        if (error) throw error
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      const updated = [...images, ...urls].slice(0, 5)
      await persist(updated)
    } catch (e) {
      toast.error(e.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const addUrl = async () => {
    const url = urlInput.trim()
    if (!url) return
    if (images.length >= 5) { toast.error('Max 5 images allowed'); return }
    const updated = [...images, url]
    setUrlInput('')
    await persist(updated)
  }

  const remove = async (idx) => {
    await persist(images.filter((_, i) => i !== idx))
  }

  const moveUp = async (idx) => {
    if (idx === 0) return
    const u = [...images];[u[idx - 1], u[idx]] = [u[idx], u[idx - 1]]
    await persist(u)
  }

  const moveDown = async (idx) => {
    if (idx === images.length - 1) return
    const u = [...images];[u[idx], u[idx + 1]] = [u[idx + 1], u[idx]]
    await persist(u)
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ImagePlus size={14} style={{ color: '#C8A23A', flexShrink: 0 }} /> Hero Carousel Images
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '3px 0 0' }}>Up to 5 images for the homepage slider. Recommended: 1200×900px.</p>
        </div>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 20, padding: '2px 9px', flexShrink: 0 }}>{images.length}/5</span>
      </div>

      {/* Current images */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8F5F0', borderRadius: 10, padding: '8px 12px', border: '1px solid #E7DED1' }}>
              <img src={url} alt={`Hero ${idx + 1}`} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #E7DED1' }} onError={e => { e.target.style.opacity = 0.3 }} />
              <span style={{ flex: 1, fontSize: 11, color: '#6F655A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url.length > 50 ? url.slice(0, 50) + '…' : url}</span>
              <span style={{ fontSize: 10, color: '#C8A23A', fontWeight: 700, background: 'rgba(200,162,58,0.1)', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>#{idx + 1}</span>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => moveUp(idx)} disabled={idx === 0 || saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 2, opacity: idx === 0 ? 0.3 : 1 }} title="Move up">▲</button>
                <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1 || saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 2, opacity: idx === images.length - 1 ? 0.3 : 1 }} title="Move down">▼</button>
                <button onClick={() => remove(idx)} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D9534F', padding: 2, display: 'flex', alignItems: 'center' }} title="Remove">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0 16px', color: '#8F857A', fontSize: 13 }}>
          No hero images set — using default images from code.
        </div>
      )}

      {/* Upload */}
      {images.length < 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1px dashed rgba(200,162,58,0.4)', borderRadius: 10, cursor: 'pointer', background: '#FAF8F3', transition: 'border-color 0.2s' }}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
            {uploading
              ? <><Loader2 size={15} style={{ color: '#C8A23A' }} className="animate-spin" /><span style={{ fontSize: 13, color: '#8F857A' }}>Uploading...</span></>
              : <><Upload size={15} style={{ color: '#C8A23A' }} /><span style={{ fontSize: 13, color: '#8F857A' }}>Upload images from device (max 8MB each)</span></>
            }
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUrl()}
              placeholder="Or paste image URL and press Enter..."
              style={{ flex: 1, background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#2C241B', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,162,58,0.12)' }}
              onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.boxShadow = 'none' }}
            />
            <button onClick={addUrl} disabled={!urlInput.trim() || saving || images.length >= 5}
              style={{ padding: '9px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', color: '#FFFFFF', fontWeight: 600, borderRadius: 10, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0, opacity: (!urlInput.trim() || saving) ? 0.6 : 1 }}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Hero Video Manager component
function HeroVideoManager() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [manualUrl, setManualUrl] = useState('')

  useEffect(() => {
    getSetting('hero_video_url').then(url => {
      if (url) { setCurrentUrl(url); setManualUrl(url) }
    }).catch(() => {})
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return }
    if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50MB'); return }
    setUploading(true)
    try {
      const fileName = `hero_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`hero/${fileName}`, file, { cacheControl: '3600', upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('product-images').getPublicUrl(`hero/${fileName}`)
      await setSetting('hero_video_url', data.publicUrl)
      setCurrentUrl(data.publicUrl)
      setManualUrl(data.publicUrl)
      toast.success('Hero video updated!')
    } catch (e) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveUrl = async () => {
    if (!manualUrl.trim()) return
    setSaving(true)
    try {
      await setSetting('hero_video_url', manualUrl.trim())
      setCurrentUrl(manualUrl.trim())
      toast.success('Hero video URL saved!')
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
      <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Video size={14} style={{ color: '#C8A23A' }} /> Hero Video
      </p>
      {currentUrl && (
        <video src={currentUrl} className="w-full h-32 object-cover rounded-lg mb-4 bg-[#F8F5F0]" muted />
      )}
      <div className="space-y-3">
        {/* Upload from device */}
        <div>
          <label className="text-xs text-[#8F857A] mb-1 block">Upload from device (max 50MB)</label>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#C8A23A]/30 rounded-lg cursor-pointer hover:border-[#C8A23A]/60 transition-all">
            <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            {uploading
              ? <><Loader2 size={15} className="text-[#2C241B] animate-spin" /><span className="text-[#8F857A] text-sm">Uploading...</span></>
              : <><Upload size={15} className="text-[#2C241B]" /><span className="text-[#8F857A] text-sm">Choose video file</span></>
            }
          </label>
        </div>
        {/* Or paste URL */}
        <div>
          <label className="text-xs text-[#8F857A] mb-1 block">Or paste video URL</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 min-w-0 bg-[#F8F5F0] border border-[#E7DED1] rounded-lg px-3 py-2 text-sm text-[#2C241B] placeholder-[#8F857A] focus:outline-none focus:border-[#C8A23A]"
              style={{ maxWidth: "100%" }}
            />
            <button onClick={handleSaveUrl} disabled={saving || !manualUrl.trim()}
              className="px-4 py-2 bg-[#C8A23A] text-white text-sm font-medium rounded-lg hover:bg-[#A88422] disabled:opacity-60 flex items-center gap-1 flex-shrink-0">
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, sub, color = 'gold', to }) => (
  <Link to={to || '#'} style={{ textDecoration: 'none', display: 'block' }}>
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(44,36,27,0.1)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E7DED1',
        borderRadius: 12,
        padding: '12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 2px 10px rgba(44,36,27,0.05)',
        height: '100%',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color === 'green' ? 'rgba(46,125,50,0.1)' : color === 'red' ? 'rgba(217,83,79,0.1)' : 'rgba(200,162,58,0.12)',
      }}>
        <Icon size={15} style={{ color: color === 'green' ? '#2E7D32' : color === 'red' ? '#D9534F' : '#C8A23A' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 'clamp(14px,2.5vw,20px)', color: '#2C241B', margin: '0 0 2px', lineHeight: 1.1, wordBreak: 'break-word' }}>{value}</p>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
        {sub && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: '#C8A23A', margin: '2px 0 0', fontWeight: 600 }}>{sub}</p>}
      </div>
    </motion.div>
  </Link>
)

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#F8F5F0] border border-[#E7DED1] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#8F857A] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? formatINR(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { stats, orders, products, loadOrders, loadProducts, computeStats, addNotification, notifications, startupNotified } = useAdminStore()

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).then(() => {
      computeStats()
    })
  }, [])

  useEffect(() => {
    if (!stats || startupNotified) return
    useAdminStore.setState({ startupNotified: true })
    if (stats.lowStockCount > 0) {
      addNotification(`${stats.lowStockCount} products have low stock (< 10 items)`, 'warning')
    }
    if (stats.todayOrdersCount > 0) {
      addNotification(`${stats.todayOrdersCount} new orders today`, 'info')
    }
  }, [stats])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#C8A23A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2vw,22px)', maxWidth: '100%', minWidth: 0 }}>

      {/* ── Page title ── */}
      <div style={{ paddingBottom: 12, borderBottom: '1px solid #E7DED1' }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>Dashboard</h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '4px 0 0' }}>Welcome back. Here's what's happening.</p>
      </div>

      {/* ── Stat Cards: 2 col on mobile → 3 col sm → 5 col lg ── */}
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(2,1fr)' }}
        className="sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={ShoppingBag}   label="Total Orders"   value={stats.totalOrders}            sub={`${stats.paidOrders} paid`} color="gold"  to="/admin/orders" />
        <StatCard icon={DollarSign}    label="Total Revenue"  value={formatINR(stats.totalRevenue)} sub="from paid orders"           color="green" to="/admin/analytics" />
        <StatCard icon={Package}       label="Products"       value={stats.totalProducts}                                            color="gold"  to="/admin/products" />
        <StatCard icon={AlertTriangle} label="Low Stock"      value={stats.lowStockCount}           sub="< 10 items"                 color="red"   to="/admin/products" />
        {/* 5th card spans full width on mobile (2-col grid) so it doesn't sit alone */}
        <div className="col-span-2 sm:col-span-1">
          <StatCard icon={Clock} label="Today's Orders" value={stats.todayOrdersCount} color="gold" to="/admin/orders?filter=today" />
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gap: 'clamp(10px,1.8vw,16px)', gridTemplateColumns: '1fr' }}
        className="lg:grid-cols-2">
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: '#C8A23A' }} /> Orders — Last 14 Days
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.last14Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
              <XAxis dataKey="date" tick={{ fill: '#8F857A', fontSize: 9 }} />
              <YAxis tick={{ fill: '#8F857A', fontSize: 9 }} width={28} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="orders" stroke="#C8A23A" strokeWidth={2} dot={{ fill: '#C8A23A', r: 3 }} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px' }}>Revenue — Last 14 Days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.last14Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
              <XAxis dataKey="date" tick={{ fill: '#8F857A', fontSize: 9 }} />
              <YAxis tick={{ fill: '#8F857A', fontSize: 9 }} width={36} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" fill="#C8A23A" radius={[3,3,0,0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gap: 'clamp(10px,1.8vw,16px)', gridTemplateColumns: '1fr' }}
        className="sm:grid-cols-2 lg:grid-cols-3">
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px' }}>Category Sales</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={stats.categorySales} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" nameKey="name">
                {stats.categorySales.map((_, i) => <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: '#8F857A' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px' }}>Orders by City</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
              <XAxis type="number" tick={{ fill: '#8F857A', fontSize: 9 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8F857A', fontSize: 9 }} width={65} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#A88422" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', minWidth: 0 }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 14px' }}>Top Products</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.topProducts.slice(0, 6).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#C8A23A', width: 16, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#6F655A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 3px' }}>{p.name}</p>
                  <div style={{ height: 4, background: '#F3EEE6', borderRadius: 3 }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#C8A23A,#A88422)', borderRadius: 3, width: `${(p.qty / stats.topProducts[0].qty) * 100}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#8F857A', flexShrink: 0 }}>{p.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert ── */}
      {stats.lowStockProducts?.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(217,83,79,0.2)', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} style={{ color: '#D9534F' }} /> Low Stock Alert
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }} className="sm:grid-cols-4">
            {stats.lowStockProducts.slice(0, 8).map(p => (
              <div key={p.id} style={{ background: '#FFF5F5', border: '1px solid rgba(217,83,79,0.12)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: '#2C241B', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#D9534F', margin: 0 }}>{p.stock} left</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Settings Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: '#E7DED1' }} />
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8F857A', whiteSpace: 'nowrap' }}>Homepage Settings</span>
        <div style={{ flex: 1, height: 1, background: '#E7DED1' }} />
      </div>

      {/* ── Settings: Images + Video side-by-side ── */}
      <div style={{ display: 'grid', gap: 'clamp(10px,1.8vw,16px)', gridTemplateColumns: '1fr' }}
        className="lg:grid-cols-2">
        <HeroImagesManager />
        <HeroVideoManager />
      </div>

      {/* ── Settings: Badges + Banner + Per-page ── */}
      <div style={{ display: 'grid', gap: 'clamp(10px,1.8vw,16px)', gridTemplateColumns: '1fr' }}
        className="sm:grid-cols-2 lg:grid-cols-3">
        <FeaturesBarManager />
        <OfferBannerManager />
        <ProductsPerPageManager />
      </div>

      {/* ── Recent Orders ── */}
      {(() => {
        const days = []
        for (let i = 0; i < 3; i++) {
          const d = new Date(); d.setDate(d.getDate() - i)
          const ds = d.toDateString()
          const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
          days.push({ label, orders: orders.filter(o => new Date(o.created_at).toDateString() === ds) })
        }
        const hasAny = days.some(d => d.orders.length > 0)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: '#2C241B', margin: 0 }}>
                Recent Orders <span style={{ fontWeight: 400, fontSize: 12, color: '#8F857A' }}>({orders.length} total)</span>
              </p>
              <Link to="/admin/orders" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#C8A23A', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>
            {!hasAny && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 32, textAlign: 'center', fontFamily: "'Inter',sans-serif", color: '#8F857A', fontSize: 13 }}>
                No orders in the last 3 days
              </div>
            )}
            {days.map(({ label, orders: dayOrders }) => dayOrders.length === 0 ? null : (
              <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#F8F5F0', borderBottom: '1px solid #E7DED1' }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#2C241B' }}>{label}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A' }}>
                    {dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''} · {formatINR(dayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount || 0), 0))} revenue
                  </span>
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F3EEE6' }}>
                        {['Order ID','Customer','Amount','Status','Time'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: '#8F857A', padding: '8px 14px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayOrders.map(o => {
                        const addr = (() => { try { return typeof o.address === 'object' ? o.address : JSON.parse(o.address || '{}') } catch { return {} } })()
                        const paid = o.payment_status === 'paid'
                        const statusStyle =
                          paid && o.order_status === 'delivered'    ? { label: 'Delivered',  bg: '#dcfce7', color: '#15803d' } :
                          paid && o.order_status === 'shipping'     ? { label: 'Shipped',    bg: '#fef9c3', color: '#ca8a04' } :
                          paid                                       ? { label: 'Confirmed',  bg: '#dcfce7', color: '#15803d' } :
                          o.payment_status === 'pending_verification'? { label: 'Verify',    bg: '#ffedd5', color: '#ea580c' } :
                          o.payment_status === 'failed'              ? { label: 'Failed',     bg: '#fee2e2', color: '#dc2626' } :
                                                                       { label: 'Pending',    bg: '#fef9c3', color: '#ca8a04' }
                        return (
                          <tr key={o.id} style={{ borderBottom: '1px solid #F8F5F0', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAF8F3'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '10px 14px', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#2C241B', whiteSpace: 'nowrap' }}>{o.display_order_id || '#' + String(o.id).slice(-6).toUpperCase()}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#6F655A', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.full_name || o.users?.email || 'Guest'}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#2C241B', whiteSpace: 'nowrap' }}>{formatINR(o.total_amount)}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                            </td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', paddingTop: 4 }}>
              <Link to="/admin/orders" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', textDecoration: 'none' }}>View all {orders.length} orders →</Link>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// Features Bar Manager - edit the 4 trust badges shown on homepage
function FeaturesBarManager() {
  const DEFAULT_FEATURES = [
    { id: 1, title: 'Handcrafted Quality', desc: 'Artisan made gifts' },
    { id: 2, title: 'Easy Personalization', desc: 'Custom orders welcome' },
    { id: 3, title: 'Secure Checkout', desc: '100% safe payments' },
    { id: 4, title: 'Fast Shipping', desc: 'Across India' },
  ]
  const [features, setFeatures] = useState(DEFAULT_FEATURES)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSetting('features_bar').then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length) setFeatures(p) } catch {} }
    }).catch(() => {})
  }, [])

  const save = async (updated) => {
    setSaving(true)
    try { await setSetting('features_bar', JSON.stringify(updated)); toast.success('Features bar updated!') }
    catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const update = (id, field, value) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
      <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: 0 }}>✦ Homepage Trust Badges</p>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '4px 0 14px' }}>Edit the 4 feature badges shown below the hero.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 10, marginBottom: 14 }} className="sm:grid-cols-2">
        {features.map(f => (
          <div key={f.id} style={{ background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input value={f.title} onChange={e => update(f.id, 'title', e.target.value)}
              placeholder="Title e.g. Fast Shipping"
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#2C241B', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#C8A23A'}
              onBlur={e => e.target.style.borderColor = '#E7DED1'} />
            <input value={f.desc} onChange={e => update(f.id, 'desc', e.target.value)}
              placeholder="Description e.g. Across India"
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#8F857A', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#C8A23A'}
              onBlur={e => e.target.style.borderColor = '#E7DED1'} />
          </div>
        ))}
      </div>
      <button onClick={() => save(features)} disabled={saving}
        style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#FFFFFF', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

// Offer Banner Manager - add/edit/remove scrolling offers
function OfferBannerManager() {
  const [offers, setOffers] = useState([
    { id: 1, text: '🚚 Free Shipping on all orders across India!', link: '/products' },
    { id: 2, text: '🎁 New Personalized Gifts Collection - Shop Now', link: '/products?tags=gifting' },
    { id: 3, text: '✨ Use code VR10 for 10% off on first order', link: '/products' },
  ])
  const [saving, setSaving] = useState(false)
  const [newText, setNewText] = useState('')
  const [newLink, setNewLink] = useState('/products')

  useEffect(() => {
    getSetting('offer_banner').then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length) setOffers(p) } catch {} }
    }).catch(() => {})
  }, [])

  const save = async (updated) => {
    setSaving(true)
    try { await setSetting('offer_banner', JSON.stringify(updated)); toast.success('Banner updated!') }
    catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const addOffer = () => {
    if (!newText.trim()) return
    const updated = [...offers, { id: Date.now(), text: newText.trim(), link: newLink || '/products' }]
    setOffers(updated)
    save(updated)
    setNewText('')
    setNewLink('/products')
  }

  const removeOffer = (id) => {
    const updated = offers.filter(o => o.id !== id)
    setOffers(updated)
    save(updated)
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
      <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: '#2C241B', margin: '0 0 4px' }}>🏷️ Offer Banner</p>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '0 0 14px' }}>Scrolling banner below the navbar.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {offers.map(o => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 9, padding: '8px 10px' }}>
            <span style={{ flex: 1, fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#6F655A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.text}</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.link}</span>
            <button onClick={() => removeOffer(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', flexShrink: 0, fontSize: 16, lineHeight: 1, padding: '0 2px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D9534F'}
              onMouseLeave={e => e.currentTarget.style.color = '#8F857A'}>×</button>
          </div>
        ))}
        {offers.length === 0 && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: 0 }}>No offers. Add one below.</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={newText} onChange={e => setNewText(e.target.value)}
          placeholder="Offer text e.g. Free Shipping on all orders!"
          style={{ width: '100%', background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#2C241B', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#C8A23A'}
          onBlur={e => e.target.style.borderColor = '#E7DED1'} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="/products"
            style={{ flex: 1, minWidth: 0, background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#2C241B', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#C8A23A'}
            onBlur={e => e.target.style.borderColor = '#E7DED1'} />
          <button onClick={addOffer} disabled={saving || !newText.trim()}
            style={{ padding: '8px 14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#FFFFFF', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0, opacity: (!newText.trim() || saving) ? 0.6 : 1 }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}

// Products Per Page Manager - controls how many products users see per page on /products
function ProductsPerPageManager() {
  const PAGE_SIZE_OPTIONS = [8, 12, 24, 48]
  const [value, setValue] = useState(12)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSetting('products_per_page').then(val => {
      const n = parseInt(val)
      if (n && PAGE_SIZE_OPTIONS.includes(n)) setValue(n)
    }).catch(() => {})
  }, [])

  const save = async (n) => {
    setSaving(true)
    try {
      await setSetting('products_per_page', String(n))
      setValue(n)
      toast.success(`Products per page set to ${n}`)
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-[#E7DED1] rounded-2xl p-4">
      <h3 className="text-[#2C241B] font-medium mb-1 flex items-center gap-2 text-sm">
        <Package size={14} /> Products Per Page
        <span className="text-xs text-[#8F857A] font-normal ml-1">- controls user-facing /products page</span>
      </h3>
      <p className="text-[#8F857A] text-xs mb-3">Choose how many products are shown per page on the shop.</p>
      <div className="flex items-center gap-2 flex-wrap">
        {PAGE_SIZE_OPTIONS.map(n => (
          <button
            key={n}
            onClick={() => save(n)}
            disabled={saving}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              value === n
                ? 'text-white border-[#C8A23A]'
                : 'bg-[#F8F5F0] text-[#6F655A] border-[#E7DED1] hover:border-[#C8A23A] hover:text-[#2C241B]'
            } disabled:opacity-60`}
            style={value === n ? { background: 'linear-gradient(135deg, #D4AF37, #B8860B)' } : {}}
          >
            {n}
          </button>
        ))}
        {saving && <span className="text-xs text-[#8F857A]">Saving...</span>}
      </div>
      <p className="text-[#8F857A] text-xs mt-2">Current: <span className="text-[#2C241B] font-semibold">{value} products per page</span></p>
    </div>
  )
}



