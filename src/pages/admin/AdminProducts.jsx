import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, Upload, ImagePlus, Loader2 } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { useCategoryStore } from "../../store/categoryStore"
import { TAGS } from "../../data/products"
import { formatINR } from "../../utils/format"
import { uploadProductImages, deleteProductImage, isVideoUrl } from "../../services/storageService"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

// No size restriction — all categories can optionally have sizes
const EMPTY_FORM = {
  name: "", price: "", category: "", description: "",
  size: "", stock: "", tags: [], images: [], custom_id: "", series_id: "VR0",
  allow_custom_name: false, allow_custom_photo: false,
  custom_name_label: "Personalization Text", custom_photo_label: "Upload Your Photo",
}

// Image/Video uploader sub-component
function ImageUploader({ images, onImagesChange, uploading, setUploading }) {
  const inputRef = useRef(null)

  const validateVideoduration = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const vid = document.createElement("video")
    vid.preload = "metadata"
    vid.onloadedmetadata = () => { URL.revokeObjectURL(url); vid.duration <= 30 ? resolve() : reject(new Error("Video must be 30 seconds or less")) }
    vid.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video")) }
    vid.src = url
  })

  const handleFiles = async (files) => {
    if (!files.length) return
    const fileArr = Array.from(files).slice(0, 4 - images.length)
    if (fileArr.length === 0) { toast.error("Max 4 images/videos allowed"); return }

    // Validate video durations before uploading
    for (const file of fileArr) {
      if (file.type.startsWith("video/")) {
        try { await validateVideoduration(file) }
        catch (e) { toast.error(e.message); return }
      }
    }

    setUploading(true)
    try {
      const urls = await uploadProductImages(fileArr)
      onImagesChange([...images, ...urls])
      toast.success(`${urls.length} file(s) uploaded`)
    } catch (e) {
      toast.error(e.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = async (url, idx) => {
    await deleteProductImage(url)
    onImagesChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="col-span-2">
      <label className="text-xs text-[#8F857A] mb-2 block">Product Images & Videos (max 4) — Videos max 30s, muted on display</label>
      {images.length < 4 && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#C8A23A]/30 hover:border-[#D4AF37]/60 rounded-xl p-6 text-center cursor-pointer transition-all mb-3 bg-[#F8F5F0]"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-[#C8A23A]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <ImagePlus size={28} className="text-[#C8A23A]/50 mx-auto mb-2" />
              <p className="text-[#8F857A] text-sm">Drop images or videos here or click to browse</p>
              <p className="text-[#6F655A] text-xs mt-1">Images: JPG, PNG, WEBP (max 5MB) · Videos: MP4, MOV, WEBM (max 30s, 50MB)</p>
            </>
          )}
        </div>
      )}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              {isVideoUrl(url) ? (
                <video src={url} muted playsInline
                  className="w-20 h-20 object-cover rounded-lg border border-[#E7DED1] bg-black"
                  onMouseEnter={e => e.target.play()}
                  onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }}
                />
              ) : (
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-[#E7DED1]" loading="lazy"
                  onError={e => { if (e.target.src !== 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80') e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
              )}
              <button
                type="button"
                onClick={() => removeImage(url, i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-black/60 text-white rounded-b-lg py-0.5">Main</span>}
              {isVideoUrl(url) && <span className="absolute top-0 left-0 text-xs bg-black/60 text-white rounded-tl-lg rounded-br-lg px-1 py-0.5">▶</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminProducts() {
  const { products, loadProducts, addProduct, updateProduct, deleteProduct } = useAdminStore()
  const { categories, loadCategories } = useCategoryStore()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 9999]
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  useEffect(() => { loadProducts(); loadCategories() }, [])

  // Build dynamic tag list: hardcoded defaults + any custom tags used across all products
  const allTags = [...new Set([...TAGS, ...products.flatMap(p => p.tags || [])])].sort()

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pagedProducts = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd = () => {
    setEditProduct(null)
    setForm({ ...EMPTY_FORM, category: categories[0] || "" })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({
      name: p.name || "", price: String(p.price || ""), category: p.category || categories[0] || "",
      description: p.description || "", size: p.size || "",
      stock: String(p.stock || ""), tags: p.tags || [], images: p.images || [],
      custom_id: p.custom_id || "", series_id: p.series_id || "VR0",
      allow_custom_name: p.allow_custom_name || false,
      allow_custom_photo: p.allow_custom_photo || false,
      custom_name_label: p.custom_name_label || "Personalization Text",
      custom_photo_label: p.custom_photo_label || "Upload Your Photo",
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = "Name required"
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = "Valid price required"
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = "Valid stock required"
    if (form.images.length === 0) errs.images = "At least 1 image required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    // Check for duplicate custom_id only when adding a new product
    const newCustomId = form.custom_id?.trim()
    if (!editProduct && newCustomId) {
      const existing = products.find(p => p.custom_id === newCustomId)
      if (existing) {
        toast.error(`Product ID "${newCustomId}" already exists — "${existing.name}". Edit that product instead.`, { duration: 5000 })
        setSaving(false)
        return
      }
    }
    const payload = {
      name: form.name.trim(), price: Math.floor(Number(form.price)), category: form.category,
      custom_id: editProduct ? (editProduct.custom_id || null) : (form.custom_id?.trim() || null),
      description: form.description.trim(), size: form.size?.trim() || null,
      stock: Number(form.stock), tags: form.tags, images: form.images, series_id: form.series_id || 'VR0',
      allow_custom_name: form.allow_custom_name,
      allow_custom_photo: form.allow_custom_photo,
      custom_name_label: form.custom_name_label?.trim() || 'Personalization Text',
      custom_photo_label: form.custom_photo_label?.trim() || 'Upload Your Photo',
    }
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload)
        toast.success("Product updated!")
      } else {
        await addProduct(payload)
        toast.success("Product added!")
      }
      // Force reload so new/updated tags appear in the list
      await loadProducts(true)
      setModalOpen(false)
    } catch (e) {
      toast.error(e.message || "Failed to save product")
      console.error("Save product error:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      const product = products.find(p => p.id === id)
      if (product?.images?.length) {
        for (const url of product.images) await deleteProductImage(url)
      }
      await deleteProduct(id)
      toast.success("Product deleted")
      setDeleteConfirm(null)
    } catch (e) {
      if (e.message?.includes("foreign key")) {
        toast.error("Cannot delete - this product exists in orders. Run fix-product-fk.sql in Supabase first.", { duration: 6000 })
      } else {
        toast.error(e.message || "Failed to delete product")
      }
    } finally {
      setDeleting(false)
    }
  }

  const toggleTag = (tag) => {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '100%', minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 12, color: '#8F857A', margin: '3px 0 0' }}>{products.length} total products</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '8px 14px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
          color: '#FFFFFF', fontSize: 13, fontWeight: 600, borderRadius: 10,
          border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(200,162,58,0.3)',
        }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8F857A', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 10,
            paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
            fontSize: 13, color: '#2C241B', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#C8A23A'}
          onBlur={e => e.target.style.borderColor = '#E7DED1'}
        />
      </div>

      {/* ── Table (desktop) / Cards (mobile) ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, overflow: 'hidden' }}>

        {/* Desktop table — hidden on mobile */}
        <div className="admin-table-view" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7DED1', background: '#F8F5F0' }}>
                {[['Product', '35%'], ['Category', '20%'], ['Price', '12%'], ['Stock', '10%'], ['Tags', '15%'], ['Actions', '8%']].map(([h, w]) => (
                  <th key={h} style={{ textAlign: 'left', width: w, padding: '10px 14px', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#8F857A', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedProducts.map((p, idx) => (
                <tr key={p.id}
                  style={{ borderBottom: idx < pagedProducts.length - 1 ? '1px solid #F3EEE6' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAF8F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.images?.[0] && isVideoUrl(p.images[0]) ? (
                        <video src={p.images[0]} muted playsInline
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#000', border: '1px solid #E7DED1' }}
                          onMouseEnter={e => e.target.play()}
                          onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }} />
                      ) : (
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=60&q=60'}
                          alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #E7DED1' }}
                          loading="lazy"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        {p.custom_id && <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#C8A23A', margin: '1px 0 0' }}>{p.custom_id}</p>}
                        {p.size && <p style={{ fontSize: 11, color: '#8F857A', margin: '1px 0 0' }}>{p.size}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#6F655A' }}>{p.category}</td>
                  <td style={{ padding: '12px 14px', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#C8A23A', whiteSpace: 'nowrap' }}>{formatINR(p.price)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: p.stock < 10 ? '#EF4444' : p.stock < 20 ? '#EAB308' : '#22C55E', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {p.stock < 10 && <AlertTriangle size={10} />}{p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(p.tags || []).map(t => (
                        <span key={t} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(200,162,58,0.1)', color: '#C8A23A', borderRadius: 999, fontWeight: 500 }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#C8A23A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8F857A'}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8F857A'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagedProducts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 14px', textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — shown only on small screens */}
        <div className="admin-card-view">
          {pagedProducts.length === 0 && (
            <p style={{ padding: '32px 16px', textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A' }}>No products found</p>
          )}
          {pagedProducts.map((p, idx) => (
            <div key={p.id} style={{ padding: '12px 14px', borderBottom: idx < pagedProducts.length - 1 ? '1px solid #F3EEE6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Thumbnail */}
                {p.images?.[0] && isVideoUrl(p.images[0]) ? (
                  <video src={p.images[0]} muted playsInline
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#000', border: '1px solid #E7DED1' }} />
                ) : (
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=60&q=60'}
                    alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #E7DED1' }}
                    loading="lazy"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      {p.custom_id && <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#C8A23A', margin: '1px 0 0' }}>{p.custom_id}</p>}
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 5 }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 5 }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 10px', marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: '#6F655A' }}>{p.category}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C8A23A' }}>{formatINR(p.price)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.stock < 10 ? '#EF4444' : p.stock < 20 ? '#EAB308' : '#22C55E', display: 'flex', alignItems: 'center', gap: 2 }}>
                      {p.stock < 10 && <AlertTriangle size={9} />}{p.stock} in stock
                    </span>
                  </div>
                  {(p.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                      {(p.tags || []).map(t => (
                        <span key={t} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(200,162,58,0.1)', color: '#C8A23A', borderRadius: 999 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pagination ── */}
      {(totalPages > 1 || filtered.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: 0 }}>
              {pageSize === 9999
                ? `Showing all ${filtered.length}`
                : `Showing ${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
            </p>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 8, padding: '4px 8px', fontSize: 12, color: '#2C241B', outline: 'none', cursor: 'pointer' }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n === 9999 ? "All" : n}</option>)}
            </select>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #E7DED1', borderRadius: 7, background: '#FFF', color: '#8F857A', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setPage(pg)}
                  style={{ padding: '4px 9px', fontSize: 12, border: '1px solid', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                    background: pg === page ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : '#FFF',
                    color: pg === page ? '#FFF' : '#8F857A',
                    borderColor: pg === page ? '#C8A23A' : '#E7DED1',
                  }}>
                  {pg}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #E7DED1', borderRadius: 7, background: '#FFF', color: '#8F857A', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>›</button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && !uploading && setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E7DED1] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-[#E7DED1]">
                <h2 className="text-[#C8A23A] font-semibold">{editProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => !uploading && setModalOpen(false)} className="text-[#8F857A] hover:text-[#2C241B] p-1"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-[#8F857A] mb-1 block">
                      Product ID <span className="text-[#6F655A]">(e.g. NS0.1, NS1.5)</span>
                      {editProduct && <span className="ml-2 text-[#C9956C] font-medium">· locked after creation</span>}
                    </label>
                    <input
                      value={form.custom_id || ""}
                      onChange={e => !editProduct && setForm(f => ({ ...f, custom_id: e.target.value }))}
                      readOnly={!!editProduct}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A23A] ${
                        editProduct
                          ? "bg-[#F8F5F0] border-gray-100 text-[#8F857A] cursor-not-allowed select-none"
                          : "bg-white border-[#E7DED1] text-[#2C241B]"
                      }`}
                      placeholder="e.g. VR0.1"
                    />
                    {!editProduct && <p className="text-[#6F655A] text-xs mt-0.5">Leave empty to auto-generate</p>}
                    {editProduct && form.custom_id && <p className="text-[#8F857A] text-xs mt-0.5">ID is permanent and cannot be changed after creation.</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-[#8F857A] mb-1 block">Product Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                      placeholder="e.g. Custom Photo Mug" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-[#8F857A] mb-1 block">Price (₹) *</label>
                    <input type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: Math.floor(Number(e.target.value)) || "" }))}
                      className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                      placeholder="2499" />
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-[#8F857A] mb-1 block">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                      placeholder="15" />
                    {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-[#8F857A] mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, size: "" }))}
                      className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#8F857A] mb-1 block">Available Sizes <span className="text-[#8F857A]">(optional)</span></label>
                    <input
                      value={form.size}
                      onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                      placeholder="e.g. S, M, L, XL or Free Size"
                      className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                    />
                    <p className="text-[#6F655A] text-xs mt-0.5">Comma-separated sizes (leave blank if not applicable).</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[#8F857A] mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3} className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A] resize-none"
                      placeholder="Product description..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[#8F857A] mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {allTags.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.tags.includes(tag) ? "bg-[#C8A23A] text-white" : "bg-[#F8F5F0] text-[#8F857A] border border-[#E7DED1] hover:border-[#C8A23A]/50"}`}>
                          {tag}
                        </button>
                      ))}
                      {/* Custom tags typed in this session but not yet in allTags */}
                      {form.tags.filter(t => !allTags.includes(t)).map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-[#C8A23A] text-white flex items-center gap-1">
                          {tag} <X size={10} />
                        </button>
                      ))}
                    </div>
                    {/* Add custom tag */}
                    <div className="flex gap-2">
                      <input
                        id="custom-tag-input"
                        type="text"
                        placeholder="Add custom tag..."
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const val = e.target.value.trim().toLowerCase()
                            if (val && !form.tags.includes(val)) {
                              setForm(f => ({ ...f, tags: [...f.tags, val] }))
                            }
                            e.target.value = ""
                          }
                        }}
                        className="flex-1 bg-[#F8F5F0] border border-[#E7DED1] rounded-lg px-3 py-1.5 text-xs text-[#2C241B] placeholder-gray-400 focus:outline-none focus:border-[#C8A23A]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("custom-tag-input")
                          const val = input.value.trim().toLowerCase()
                          if (val && !form.tags.includes(val)) {
                            setForm(f => ({ ...f, tags: [...f.tags, val] }))
                          }
                          input.value = ""
                        }}
                        className="px-3 py-1.5 bg-[#C8A23A] text-white rounded-lg text-xs font-bold hover:bg-[#A88422] transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* ── Customization Options ── */}
                  <div className="col-span-2 border border-[#C8A23A]/30 rounded-xl p-4 bg-[#FAF8F3] space-y-3">
                    <p className="text-sm font-semibold text-[#2C241B] flex items-center gap-2">
                      🎨 Personalization Options
                      <span className="text-xs text-[#8F857A] font-normal">— enable if customers can customise this product</span>
                    </p>

                    {/* Allow custom name/text */}
                    <div className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2.5 border border-[#E8E0D5]">
                      <div>
                        <p className="text-sm text-[#2C241B] font-medium">Custom Name / Text</p>
                        <p className="text-xs text-[#8F857A]">Customer types a name, message or text to print</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, allow_custom_name: !f.allow_custom_name }))}
                        className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${form.allow_custom_name ? 'bg-[#C8A23A]' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.allow_custom_name ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {form.allow_custom_name && (
                      <div>
                        <label className="text-xs text-[#8F857A] mb-1 block">Label shown to customer</label>
                        <input
                          value={form.custom_name_label}
                          onChange={e => setForm(f => ({ ...f, custom_name_label: e.target.value }))}
                          placeholder="e.g. Enter name to print, Your message..."
                          className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                        />
                      </div>
                    )}

                    {/* Allow custom photo */}
                    <div className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2.5 border border-[#E8E0D5]">
                      <div>
                        <p className="text-sm text-[#2C241B] font-medium">Custom Photo Upload</p>
                        <p className="text-xs text-[#8F857A]">Customer uploads a photo to be printed on product</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, allow_custom_photo: !f.allow_custom_photo }))}
                        className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${form.allow_custom_photo ? 'bg-[#C8A23A]' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.allow_custom_photo ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {form.allow_custom_photo && (
                      <div>
                        <label className="text-xs text-[#8F857A] mb-1 block">Label shown to customer</label>
                        <input
                          value={form.custom_photo_label}
                          onChange={e => setForm(f => ({ ...f, custom_photo_label: e.target.value }))}
                          placeholder="e.g. Upload your photo, Upload couple photo..."
                          className="w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
                        />
                      </div>
                    )}
                  </div>

                  <ImageUploader
                    images={form.images}
                    onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                    uploading={uploading}
                    setUploading={setUploading}
                  />
                  {errors.images && <p className="col-span-2 text-red-400 text-xs">{errors.images}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => !uploading && setModalOpen(false)}
                    className="flex-1 py-2.5 border border-[#E7DED1] text-[#8F857A] rounded-lg text-sm hover:border-[#C8A23A]/50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || uploading}
                    className="flex-1 py-2.5 bg-[#C8A23A] text-white font-semibold rounded-lg text-sm hover:bg-[#A88422] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {(saving || uploading) && <Loader2 size={14} className="animate-spin" />}
                    {editProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-white border border-red-500/20 rounded-xl p-6 max-w-sm w-full text-center">
              <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-[#C8A23A] font-semibold mb-2">Delete Product?</h3>
              <p className="text-[#8F857A] text-sm mb-5">Images will also be deleted from storage. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 py-2 border border-[#E7DED1] text-[#8F857A] rounded-lg text-sm disabled:opacity-50">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


