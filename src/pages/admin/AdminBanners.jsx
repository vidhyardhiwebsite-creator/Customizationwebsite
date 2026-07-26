import { useState, useEffect, useRef } from "react"
import { useAdminStore } from "../../store/adminStore"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit2, Save, ChevronUp, ChevronDown, Loader2, ImagePlus } from "lucide-react"
import { getSetting, setSetting } from "../../services/settingsService"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const COLORS = [
  { label: "Gold",   bg: "from-[#1a0a00] to-[#3d1f00]", accent: "#D4AF37" },
  { label: "Purple", bg: "from-[#0a001a] to-[#1f003d]", accent: "#C084FC" },
  { label: "Green",  bg: "from-[#001a0a] to-[#003d1f]", accent: "#4ADE80" },
  { label: "Red",    bg: "from-[#1a0a0a] to-[#3d0000]", accent: "#F87171" },
  { label: "Blue",   bg: "from-[#000a1a] to-[#00203d]", accent: "#60A5FA" },
  { label: "Pink",   bg: "from-[#1a000a] to-[#3d001f]", accent: "#F472B6" },
]

const LINK_OPTIONS = [
  { label: "All Products",      value: "/products" },
  { label: "Photo Gifts",       value: "/products?category=Photo+Cubes" },
  { label: "Mugs",              value: "/products?category=Mugs" },
  { label: "Pillows",           value: "/products?category=Pillows" },
  { label: "T-Shirts",          value: "/products?category=T-Shirts" },
  { label: "Keychains",         value: "/products?category=Keychains" },
  { label: "Photo Frames",      value: "/products?category=Photo+Frames" },
  { label: "Engraved Wood",     value: "/products?category=Wood+Engraving+Photo+Frames" },
  { label: "Custom Gifts",      value: "/products?tags=gifting" },
  { label: "Premium Collection",value: "/products?tags=premium" },
  { label: "New Arrivals",      value: "/products?sort=newest" },
]

const EMPTY = {
  id: null, badge: "", title: "", subtitle: "", desc: "",
  price: "", originalPrice: "",
  cta: "Shop Now", link: "/products", productId: "",
  bg: COLORS[0].bg, accent: COLORS[0].accent, image: ""
}

/* ── shared input/label styles ── */
const inp = {
  width: '100%', boxSizing: 'border-box',
  background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 10,
  padding: '9px 12px', fontSize: 13, color: '#2C241B',
  fontFamily: "'Inter',sans-serif", outline: 'none',
}
const lbl = {
  fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600,
  color: '#8F857A', display: 'block', marginBottom: 5,
}

/* ── Banner preview card ── */
function BannerPreview({ banner }) {
  return (
    <div
      className={`bg-gradient-to-r ${banner.bg}`}
      style={{ borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: 12, minHeight: 90 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, marginBottom: 4,
          background: banner.accent + '25', color: banner.accent, border: `1px solid ${banner.accent}50`,
        }}>
          {banner.badge || "BADGE"}
        </span>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: '#FFFFFF', margin: '0 0 2px', lineHeight: 1.3 }}>{banner.title || "Title"}</p>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: banner.accent, margin: '0 0 4px' }}>{banner.subtitle || "Subtitle"}</p>
        {(banner.price || banner.originalPrice) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {banner.price && <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>₹{banner.price}</span>}
            {banner.originalPrice && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{banner.originalPrice}</span>}
          </div>
        )}
        <span style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: banner.accent, color: '#000',
        }}>
          {banner.cta || "Shop Now"}
        </span>
      </div>
      {banner.image && (
        <div style={{ width: 72, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: `1px solid ${banner.accent}40` }}>
          <img src={banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }} />
        </div>
      )}
    </div>
  )
}

/* ── Product selector ── */
function ProductSelector({ form, setForm }) {
  const { products, loadProducts } = useAdminStore()
  useEffect(() => { if (!products.length) loadProducts() }, [])
  return (
    <select
      value={form.productId || ""}
      onChange={e => {
        const id = e.target.value
        setForm(f => ({ ...f, productId: id, link: id ? `/products/${id}` : f.link }))
      }}
      style={{ ...inp }}
      onFocus={e => e.target.style.borderColor = '#C8A23A'}
      onBlur={e => e.target.style.borderColor = '#E7DED1'}
    >
      <option value="">— None (use link above) —</option>
      {products.map(p => (
        <option key={p.id} value={p.id}>
          {p.custom_id ? `[${p.custom_id}] ` : ""}{p.name} — ₹{p.price}
        </option>
      ))}
    </select>
  )
}

/* ── Add / Edit form ── */
function BannerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const field = (key) => ({
    value: form[key] || "",
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    style: inp,
    onFocus: e => { e.target.style.borderColor = '#C8A23A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,162,58,0.1)' },
    onBlur:  e => { e.target.style.borderColor = '#E7DED1'; e.target.style.boxShadow = 'none' },
  })

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return }
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const path = `banners/banner_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      const { data } = supabase.storage.from("product-images").getPublicUrl(path)
      setForm(f => ({ ...f, image: data.publicUrl }))
      toast.success("Image uploaded!")
    } catch (err) {
      toast.error(err.message || "Upload failed")
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    await onSave({ ...form, id: form.id || Date.now() })
    setSaving(false)
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Live preview */}
      <div>
        <p style={{ ...lbl, marginBottom: 8 }}>Preview</p>
        <BannerPreview banner={form} />
      </div>

      {/* 2-col grid on desktop, 1-col on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }} className="banner-form-grid">

        <div>
          <label style={lbl}>Badge Text</label>
          <input {...field('badge')} placeholder="e.g. LIMITED TIME" />
        </div>
        <div>
          <label style={lbl}>Title *</label>
          <input {...field('title')} placeholder="e.g. Bridal Collection" />
        </div>
        <div>
          <label style={lbl}>Subtitle</label>
          <input {...field('subtitle')} placeholder="e.g. Up to 30% Off" />
        </div>
        <div>
          <label style={lbl}>Description</label>
          <input {...field('desc')} placeholder="e.g. Handcrafted gold sets" />
        </div>
        <div>
          <label style={lbl}>Sale Price (₹)</label>
          <input type="number" {...field('price')} placeholder="e.g. 2499" />
        </div>
        <div>
          <label style={lbl}>Original Price (₹) <span style={{ fontWeight: 400, color: '#B8AFA8' }}>optional</span></label>
          <input type="number" {...field('originalPrice')} placeholder="e.g. 3999" />
        </div>
        <div>
          <label style={lbl}>Button Text</label>
          <input {...field('cta')} placeholder="Shop Now" />
        </div>
        <div>
          <label style={lbl}>Button Link</label>
          <select
            value={form.link || "/products"}
            onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
            style={{ ...inp }}
            onFocus={e => e.target.style.borderColor = '#C8A23A'}
            onBlur={e => e.target.style.borderColor = '#E7DED1'}
          >
            {LINK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Product selector — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Or select a specific product</label>
          <ProductSelector form={form} setForm={setForm} />
        </div>

        {/* Image upload — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Banner Image</label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            border: '1px dashed rgba(200,162,58,0.4)', borderRadius: 10, cursor: 'pointer',
            background: '#FAF8F3', marginBottom: 8, transition: 'border-color 0.2s',
          }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            {uploading
              ? <><Loader2 size={14} style={{ color: '#C8A23A' }} className="animate-spin" /><span style={{ fontSize: 13, color: '#8F857A' }}>Uploading...</span></>
              : <><ImagePlus size={14} style={{ color: '#C8A23A' }} /><span style={{ fontSize: 13, color: '#8F857A' }}>Upload from device</span></>
            }
            {form.image && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={form.image} alt="" style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 5, border: '1px solid #E7DED1' }}
                  onError={e => e.target.style.display = 'none'} />
                <button type="button" onClick={e => { e.preventDefault(); setForm(f => ({ ...f, image: "" })) }}
                  style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </label>
          <input {...field('image')} placeholder="Or paste image URL..." />
        </div>

        {/* Color theme — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Color Theme</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c.label} type="button"
                onClick={() => setForm(f => ({ ...f, bg: c.bg, accent: c.accent }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: `linear-gradient(to right, ${c.accent}30, ${c.accent}10)`,
                  color: c.accent,
                  border: form.bg === c.bg ? `2px solid ${c.accent}` : '2px solid transparent',
                  outline: 'none',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.accent, display: 'inline-block', flexShrink: 0 }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel}
          style={{
            flex: 1, padding: '10px 0', border: '1px solid #E7DED1', borderRadius: 10,
            background: '#FFF', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#C8A23A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E7DED1'}
        >
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={saving || uploading}
          style={{
            flex: 1, padding: '10px 0', background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
            border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif",
            fontSize: 13, fontWeight: 700, color: '#FFF', cursor: 'pointer',
            opacity: (saving || uploading) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(200,162,58,0.3)',
          }}
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {initial?.id ? "Update Banner" : "Add Banner"}
        </button>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBanner, setEditBanner] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSetting("promo_banners").then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p)) setBanners(p) } catch {} }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const persist = async (updated) => {
    setSaving(true)
    try { await setSetting("promo_banners", JSON.stringify(updated)); setBanners(updated); toast.success("Saved!") }
    catch (e) { toast.error(e.message || "Failed") }
    finally { setSaving(false) }
  }

  const handleAdd    = async (b) => { await persist([...banners, b]); setShowForm(false) }
  const handleEdit   = async (b) => { await persist(banners.map(x => x.id === b.id ? b : x)); setEditBanner(null) }
  const handleDelete = async (id) => { await persist(banners.filter(b => b.id !== id)) }
  const move = async (idx, dir) => {
    const u = [...banners]; const t = idx + dir
    if (t < 0 || t >= u.length) return
    ;[u[idx], u[t]] = [u[t], u[idx]]; await persist(u)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '100%', minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, paddingBottom: 12, borderBottom: '1px solid #E7DED1', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>
            Promo Banners
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '3px 0 0' }}>
            Manage sliding offer banners on the homepage
          </p>
        </div>
        {!showForm && !editBanner && (
          <button onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '8px 16px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
              color: '#FFF', fontFamily: "'Inter',sans-serif", fontWeight: 600,
              fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(200,162,58,0.3)', whiteSpace: 'nowrap',
            }}
          >
            <Plus size={14} /> Add Banner
          </button>
        )}
      </div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <BannerForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <div style={{ width: 24, height: 24, border: '2px solid #C8A23A', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && banners.length === 0 && !showForm && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: '0 0 10px' }}>🎨</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#8F857A', margin: '0 0 16px' }}>No banners yet.</p>
          <button onClick={() => setShowForm(true)}
            style={{
              padding: '9px 20px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
              color: '#FFF', fontFamily: "'Inter',sans-serif", fontWeight: 600,
              fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(200,162,58,0.3)',
            }}
          >
            + Add Banner
          </button>
        </div>
      )}

      {/* ── Banner list ── */}
      {!loading && banners.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {banners.map((banner, idx) => (
            <div key={banner.id}>
              {editBanner?.id === banner.id ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BannerForm initial={editBanner} onSave={handleEdit} onCancel={() => setEditBanner(null)} />
                </motion.div>
              ) : (
                <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,36,27,0.05)' }}>
                  <BannerPreview banner={banner} />
                  {/* Controls bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid #F3EEE6', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', fontWeight: 600 }}>#{idx + 1}</span>
                      <button onClick={() => move(idx, -1)} disabled={idx === 0}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 3, opacity: idx === 0 ? 0.3 : 1 }}>
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => move(idx, 1)} disabled={idx === banners.length - 1}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 3, opacity: idx === banners.length - 1 ? 0.3 : 1 }}>
                        <ChevronDown size={13} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => setEditBanner(banner)} disabled={saving}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                          background: 'rgba(200,162,58,0.08)', border: '1px solid rgba(200,162,58,0.25)',
                          borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#C8A23A',
                          cursor: 'pointer', opacity: saving ? 0.5 : 1, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,162,58,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,162,58,0.08)'}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => handleDelete(banner.id)} disabled={saving}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#EF4444',
                          cursor: 'pointer', opacity: saving ? 0.5 : 1, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                      >
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Saving toast */}
      {saving && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20,
          background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
          color: '#FFF', padding: '10px 16px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(200,162,58,0.4)', zIndex: 99,
        }}>
          <Loader2 size={14} className="animate-spin" /> Saving…
        </div>
      )}
    </div>
  )
}
