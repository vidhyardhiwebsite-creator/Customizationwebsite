import { useState, useEffect, useRef } from "react"
import { useAdminStore } from "../../store/adminStore"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit2, Save, ChevronUp, ChevronDown, Loader2, ImagePlus } from "lucide-react"
import { getSetting, setSetting } from "../../services/settingsService"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const COLORS = [
  { label: "Gold", bg: "from-[#1a0a00] to-[#3d1f00]", accent: "#D4AF37" },
  { label: "Purple", bg: "from-[#0a001a] to-[#1f003d]", accent: "#C084FC" },
  { label: "Green", bg: "from-[#001a0a] to-[#003d1f]", accent: "#4ADE80" },
  { label: "Red", bg: "from-[#1a0a0a] to-[#3d0000]", accent: "#F87171" },
  { label: "Blue", bg: "from-[#000a1a] to-[#00203d]", accent: "#60A5FA" },
  { label: "Pink", bg: "from-[#1a000a] to-[#3d001f]", accent: "#F472B6" },
]

const LINK_OPTIONS = [
  { label: "All Products", value: "/products" },
  { label: "Earrings", value: "/products?category=Earrings" },
  { label: "Necklaces", value: "/products?category=Necklaces" },
  { label: "Black Beads", value: "/products?category=Black+Beads" },
  { label: "Tikka", value: "/products?category=Tikka" },
  { label: "Champaswaram", value: "/products?category=Champaswaram" },
  { label: "Maatilu", value: "/products?category=Maatilu" },
  { label: "Bracelets", value: "/products?category=Bracelets" },
  { label: "Bangles", value: "/products?category=Bangles" },
  { label: "Bridal Collection", value: "/products?tags=bridal" },
  { label: "Premium Collection", value: "/products?tags=premium" },
  { label: "New Arrivals", value: "/products?sort=newest" },
]

const EMPTY = {
  id: null, badge: "", title: "", subtitle: "", desc: "",
  price: "", originalPrice: "",
  cta: "Shop Now", link: "/products", productId: "",
  bg: COLORS[0].bg, accent: COLORS[0].accent, image: ""
}

const inp = "w-full bg-white border border-[#E8E0D5] rounded-lg px-3 py-2 text-sm text-[#1A1A2E] placeholder-[#8A8AAA] focus:outline-none focus:border-[#1B2B5E]"
const lbl = "text-xs text-[#4A4A6A] mb-1 block font-medium"

function BannerPreview({ banner }) {
  return (
    <div className={`bg-gradient-to-r ${banner.bg} rounded-xl flex items-center justify-between px-4 py-3 gap-3 min-h-[90px]`}>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1"
          style={{ background: banner.accent + "25", color: banner.accent, border: `1px solid ${banner.accent}50` }}>
          {banner.badge || "BADGE"}
        </span>
        <p className="text-[#1A1A2E] text-sm font-bold leading-tight">{banner.title || "Title"}</p>
        <p className="text-xs font-semibold" style={{ color: banner.accent }}>{banner.subtitle || "Subtitle"}</p>
        {(banner.price || banner.originalPrice) && (
          <div className="flex items-center gap-2 mt-0.5">
            {banner.price && <span className="text-[#1A1A2E] text-sm font-bold">?{banner.price}</span>}
            {banner.originalPrice && <span className="text-gray-400 text-xs line-through">?{banner.originalPrice}</span>}
          </div>
        )}
        <span className="inline-block mt-1.5 px-3 py-1 rounded text-xs font-semibold"
          style={{ background: banner.accent, color: "#000" }}>
          {banner.cta || "Shop Now"}
        </span>
      </div>
      {banner.image && (
        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border"
          style={{ borderColor: banner.accent + "40" }}>
          <img src={banner.image} alt="" className="w-full h-full object-cover"
            onError={e => { e.target.style.display = "none" }} />
        </div>
      )}
    </div>
  )
}

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
      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
    >
      <option value="">- None (use link above) -</option>
      {products.map(p => (
        <option key={p.id} value={p.id}>
          {p.custom_id ? `[${p.custom_id}] ` : ""}{p.name} - ?{p.price}
        </option>
      ))}
    </select>
  )
}

function BannerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

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
    <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Badge Text</label>
          <input value={form.badge||""} onChange={e=>setForm(f=>({...f,badge:e.target.value}))} placeholder="e.g. LIMITED TIME" className={inp} />
        </div>
        <div>
          <label className={lbl}>Title *</label>
          <input value={form.title||""} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Bridal Collection" className={inp} />
        </div>
        <div>
          <label className={lbl}>Subtitle</label>
          <input value={form.subtitle||""} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))} placeholder="e.g. Up to 30% Off" className={inp} />
        </div>
        <div>
          <label className={lbl}>Description</label>
          <input value={form.desc||""} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="e.g. Handcrafted gold sets" className={inp} />
        </div>

        {/* Price fields */}
        <div>
          <label className={lbl}>Sale Price (?)</label>
          <input type="number" value={form.price||""} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="e.g. 2499" className={inp} />
        </div>
        <div>
          <label className={lbl}>Original Price (?) <span className="text-gray-600">optional</span></label>
          <input type="number" value={form.originalPrice||""} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value}))} placeholder="e.g. 3999" className={inp} />
        </div>

        <div>
          <label className={lbl}>Button Text</label>
          <input value={form.cta||""} onChange={e=>setForm(f=>({...f,cta:e.target.value}))} placeholder="Shop Now" className={inp} />
        </div>
        <div>
          <label className={lbl}>Button Link</label>
          <select value={form.link||"/products"} onChange={e=>setForm(f=>({...f,link:e.target.value}))}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]">
            {LINK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={lbl}>Or select a specific product</label>
          <ProductSelector form={form} setForm={setForm} />
        </div>

        {/* Image upload */}
        <div className="col-span-2">
          <label className={lbl}>Banner Image</label>
          <div className="flex gap-2 items-start">
            <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E8E0D5] hover:border-[#1B2B5E]/40 rounded-lg cursor-pointer transition-all bg-[#FAF8F5]">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {uploading
                ? <><Loader2 size={15} className="text-[#1B2B5E] animate-spin" /><span className="text-gray-400 text-sm">Uploading...</span></>
                : <><ImagePlus size={15} className="text-[#1B2B5E]" /><span className="text-gray-400 text-sm">Upload from device</span></>
              }
            </label>
            {form.image && (
              <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#1B2B5E]/20 flex-shrink-0">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, image: "" }))}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">x</button>
              </div>
            )}
          </div>
          <input value={form.image||""} onChange={e=>setForm(f=>({...f,image:e.target.value}))}
            placeholder="Or paste image URL..." className={`${inp} mt-2`} />
        </div>

        {/* Color Theme */}
        <div className="col-span-2">
          <label className={lbl}>Color Theme</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c.label} type="button"
                onClick={() => setForm(f => ({ ...f, bg: c.bg, accent: c.accent }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${form.bg === c.bg ? "border-white" : "border-transparent"}`}
                style={{ background: `linear-gradient(to right, ${c.accent}30, ${c.accent}10)`, color: c.accent }}>
                <span className="w-3 h-3 rounded-full" style={{ background: c.accent }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-[#E8E0D5] text-[#4A4A6A] rounded-lg text-sm">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving || uploading}
          className="flex-1 py-2 bg-[#1B2B5E] text-white font-semibold rounded-lg text-sm hover:bg-[#2A3F7E] disabled:opacity-60 flex items-center justify-center gap-1">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {initial?.id ? "Update Banner" : "Add Banner"}
        </button>
      </div>
    </div>
  )
}

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

  const handleAdd = async (b) => { await persist([...banners, b]); setShowForm(false) }
  const handleEdit = async (b) => { await persist(banners.map(x => x.id === b.id ? b : x)); setEditBanner(null) }
  const handleDelete = async (id) => { await persist(banners.filter(b => b.id !== id)) }
  const move = async (idx, dir) => {
    const u = [...banners]; const t = idx + dir
    if (t < 0 || t >= u.length) return
    ;[u[idx], u[t]] = [u[t], u[idx]]; await persist(u)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>Promo Banners</h1>
          <p className="text-gray-500 text-sm mt-1">Manage sliding offer banners on the homepage</p>
        </div>
        {!showForm && !editBanner && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2B5E] text-black font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all text-sm">
            <Plus size={16} /> Add Banner
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <BannerForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E8E0D5]">
          <p className="text-4xl mb-3">🎨</p>
          <p className="text-[#4A4A6A]">No banners yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2 bg-[#1B2B5E] text-white rounded-lg text-sm font-medium hover:bg-[#2A3F7E] transition-all">+ Add Banner</button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, idx) => (
            <div key={banner.id}>
              {editBanner?.id === banner.id ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BannerForm initial={editBanner} onSave={handleEdit} onCancel={() => setEditBanner(null)} />
                </motion.div>
              ) : (
                <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden shadow-sm">
                  <BannerPreview banner={banner} />
                  <div className="flex items-center justify-between px-4 py-2 border-t border-[#1B2B5E]/10">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">#{idx + 1}</span>
                      <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 text-gray-500 hover:text-[#1A1A2E] disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button onClick={() => move(idx, 1)} disabled={idx === banners.length - 1} className="p-1 text-gray-500 hover:text-[#1A1A2E] disabled:opacity-30"><ChevronDown size={14} /></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditBanner(banner)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-[#1B2B5E] border border-[#1B2B5E]/20 rounded-lg disabled:opacity-40"><Edit2 size={12} /> Edit</button>
                      <button onClick={() => handleDelete(banner.id)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-red-500/20 rounded-lg disabled:opacity-40">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-[#1B2B5E] text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
          <Loader2 size={14} className="animate-spin" /> Saving...
        </div>
      )}
    </div>
  )
}
