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
    <div>
      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#8F857A', display: 'block', marginBottom: 6 }}>
        Product Images &amp; Videos (max 4) — Videos max 30s
      </label>
      {images.length < 4 && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{ border: '1px dashed rgba(200,162,58,0.4)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', background: '#FAF8F3', marginBottom: 8 }}
        >
          <input ref={inputRef} type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            multiple style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)} />
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#C8A23A' }}>
              <Loader2 size={14} className="animate-spin" />
              <span style={{ fontSize: 12, color: '#8F857A' }}>Uploading...</span>
            </div>
          ) : (
            <>
              <ImagePlus size={18} style={{ color: 'rgba(200,162,58,0.5)', display: 'block', margin: '0 auto 6px' }} />
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '0 0 3px' }}>Drop images or videos here or click to browse</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#B8AFA8', margin: 0 }}>JPG, PNG, WEBP (max 5MB) · MP4, MOV, WEBM (max 30s, 50MB)</p>
            </>
          )}
        </div>
      )}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative' }} className="group">
              {isVideoUrl(url) ? (
                <video src={url} muted playsInline
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E7DED1', background: '#000' }}
                  onMouseEnter={e => e.target.play()}
                  onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }} />
              ) : (
                <img src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E7DED1' }} loading="lazy"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
              )}
              <button type="button" onClick={() => removeImage(url, i)}
                style={{ position: 'absolute', top: -5, right: -5, background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={8} />
              </button>
              {i === 0 && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: 9, background: 'rgba(0,0,0,0.6)', color: '#FFF', borderRadius: '0 0 8px 8px', padding: '1px 0' }}>Main</span>}
              {isVideoUrl(url) && <span style={{ position: 'absolute', top: 0, left: 0, fontSize: 9, background: 'rgba(0,0,0,0.6)', color: '#FFF', borderRadius: '8px 0 4px 0', padding: '1px 4px' }}>▶</span>}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: '100%', minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: '#2C241B', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 11, color: '#8F857A', margin: '2px 0 0' }}>{products.length} total products</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          padding: '7px 12px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
          color: '#FFFFFF', fontSize: 12, fontWeight: 600, borderRadius: 8,
          border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          <Plus size={13} /> Add Product
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8F857A', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 10,
            paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
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
            <p style={{ padding: '32px 16px', textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A' }}>No products found</p>
          )}
          {pagedProducts.map((p, idx) => (
            <div key={p.id} style={{ padding: '10px 12px', borderBottom: idx < pagedProducts.length - 1 ? '1px solid #F3EEE6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Thumbnail */}
                {p.images?.[0] && isVideoUrl(p.images[0]) ? (
                  <video src={p.images[0]} muted playsInline
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#000', border: '1px solid #E7DED1' }} />
                ) : (
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=60&q=60'}
                    alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #E7DED1' }}
                    loading="lazy"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
                )}
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      {p.custom_id && <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#C8A23A', margin: '1px 0 0' }}>{p.custom_id}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                      <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: '4px 6px' }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: '4px 6px' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px 8px', marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: '#6F655A' }}>{p.category}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C8A23A' }}>{formatINR(p.price)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.stock < 10 ? '#EF4444' : p.stock < 20 ? '#EAB308' : '#22C55E' }}>
                      {p.stock} in stock
                    </span>
                  </div>
                  {(p.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                      {(p.tags || []).map(t => (
                        <span key={t} style={{ fontSize: 10, padding: '1px 7px', background: 'rgba(200,162,58,0.1)', color: '#A88422', borderRadius: 999 }}>{t}</span>
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,27,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
            onClick={e => e.target === e.currentTarget && !uploading && setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '94vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(44,36,27,0.25)' }}>
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', flexShrink: 0, position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: '#2C241B', margin: 0 }}>
                  {editProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={() => !uploading && setModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F857A', padding: 4, display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
              {/* Divider */}
              <div style={{ height: 1, background: '#F3EEE6', flexShrink: 0, margin: '0 20px' }} />
              {/* Modal body */}
              <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Product ID */}
                <div>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>
                    Product ID <span style={{ color: '#8F857A', fontWeight: 400, fontSize: 12 }}>(e.g. SS0.1, SS1.5)</span>
                    {editProduct && <span style={{ marginLeft: 8, color: '#C8A23A', fontWeight: 600, fontSize: 11 }}>· locked after creation</span>}
                  </label>
                  <input
                    value={form.custom_id || ""}
                    onChange={e => !editProduct && setForm(f => ({ ...f, custom_id: e.target.value }))}
                    readOnly={!!editProduct}
                    placeholder="e.g. VR0.1"
                    style={{ width: '100%', boxSizing: 'border-box', background: editProduct ? '#F8F5F0' : '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: editProduct ? '#8F857A' : '#2C241B', outline: 'none', cursor: editProduct ? 'not-allowed' : 'text', fontFamily: "'Inter',sans-serif" }}
                    onFocus={e => { if (!editProduct) { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' } }}
                    onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }}
                  />
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '4px 0 0' }}>
                    {editProduct && form.custom_id ? "ID cannot be changed after creation." : !editProduct ? "Leave empty to auto-generate" : ""}
                  </p>
                </div>

                {/* Product Name */}
                <div>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Custom Photo Mug"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                    onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                    onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }} />
                  {errors.name && <p style={{ fontSize: 11, color: '#EF4444', margin: '3px 0 0' }}>{errors.name}</p>}
                </div>

                {/* Price + Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>Price (₹) *</label>
                    <input type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: Math.floor(Number(e.target.value)) || "" }))} placeholder="2499"
                      style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                      onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }} />
                    {errors.price && <p style={{ fontSize: 11, color: '#EF4444', margin: '3px 0 0' }}>{errors.price}</p>}
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="15"
                      style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                      onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }} />
                    {errors.stock && <p style={{ fontSize: 11, color: '#EF4444', margin: '3px 0 0' }}>{errors.stock}</p>}
                  </div>
                </div>

                {/* Category + Sizes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, size: "" }))}
                      style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                      onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>
                      Sizes <span style={{ fontWeight: 400, color: '#8F857A', fontSize: 12 }}>(optional)</span>
                    </label>
                    <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="S, M, L or Free Size"
                      style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                      onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }} />
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '3px 0 0' }}>Comma-separated, leave blank if N/A</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Product description..."
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid #E7DED1', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#2C241B', outline: 'none', resize: 'vertical', fontFamily: "'Inter',sans-serif" }}
                    onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.background = '#FFFFFF' }}
                    onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.background = '#F8F5F0' }} />
                </div>
                {/* Tags */}
                <div>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#8F857A', display: 'block', marginBottom: 8 }}>Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {allTags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)}
                        style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: form.tags.includes(tag) ? '#C8A23A' : '#F8F5F0', color: form.tags.includes(tag) ? '#FFF' : '#8F857A', border: form.tags.includes(tag) ? '1px solid #C8A23A' : '1px solid #E7DED1' }}>
                        {tag}
                      </button>
                    ))}
                    {form.tags.filter(t => !allTags.includes(t)).map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)}
                        style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: '#C8A23A', color: '#FFF', border: '1px solid #C8A23A', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {tag} <X size={9} />
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="custom-tag-input" type="text" placeholder="Add custom tag..."
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const val = e.target.value.trim().toLowerCase(); if (val && !form.tags.includes(val)) setForm(f => ({ ...f, tags: [...f.tags, val] })); e.target.value = "" } }}
                      style={{ flex: 1, minWidth: 0, background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 10, padding: '7px 10px', fontSize: 12, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                      onFocus={e => e.target.style.borderColor = '#C8A23A'} onBlur={e => e.target.style.borderColor = '#E7DED1'} />
                    <button type="button" onClick={() => { const input = document.getElementById("custom-tag-input"); const val = input.value.trim().toLowerCase(); if (val && !form.tags.includes(val)) setForm(f => ({ ...f, tags: [...f.tags, val] })); input.value = "" }}
                      style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#FFF', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      +
                    </button>
                  </div>
                </div>
                {/* ── Personalization Options ── */}
                <div style={{ background: '#FAF8F3', border: '1px solid rgba(200,162,58,0.25)', borderRadius: 12, padding: 14 }}>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: '#2C241B', margin: '0 0 2px' }}>🎨 Personalization Options</p>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '0 0 12px' }}>Enable if customers can customise this product</p>
                  {/* Custom name toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#FFFFFF', borderRadius: 10, padding: '9px 10px', border: '1px solid #E7DED1', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#2C241B', margin: 0 }}>Custom Name / Text</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: '2px 0 0' }}>Customer types a name, message or text to print</p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, allow_custom_name: !f.allow_custom_name }))}
                      style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, position: 'relative', background: form.allow_custom_name ? '#C8A23A' : '#D4C9BC', transition: 'background 0.2s' }}>
                      <span style={{ position: 'absolute', top: 2, width: 20, height: 20, background: '#FFF', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: form.allow_custom_name ? 22 : 2 }} />
                    </button>
                  </div>
                  {form.allow_custom_name && (
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', display: 'block', marginBottom: 4 }}>Label shown to customer</label>
                      <input value={form.custom_name_label} onChange={e => setForm(f => ({ ...f, custom_name_label: e.target.value }))}
                        placeholder="e.g. Enter name to print..."
                        style={{ width: '100%', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                        onFocus={e => e.target.style.borderColor = '#C8A23A'} onBlur={e => e.target.style.borderColor = '#E7DED1'} />
                    </div>
                  )}
                  {/* Custom photo toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#FFFFFF', borderRadius: 10, padding: '9px 10px', border: '1px solid #E7DED1' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#2C241B', margin: 0 }}>Custom Photo Upload</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: '2px 0 0' }}>Customer uploads a photo to be printed on product</p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, allow_custom_photo: !f.allow_custom_photo }))}
                      style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, position: 'relative', background: form.allow_custom_photo ? '#C8A23A' : '#D4C9BC', transition: 'background 0.2s' }}>
                      <span style={{ position: 'absolute', top: 2, width: 20, height: 20, background: '#FFF', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: form.allow_custom_photo ? 22 : 2 }} />
                    </button>
                  </div>
                  {form.allow_custom_photo && (
                    <div style={{ marginTop: 8 }}>
                      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', display: 'block', marginBottom: 4 }}>Label shown to customer</label>
                      <input value={form.custom_photo_label} onChange={e => setForm(f => ({ ...f, custom_photo_label: e.target.value }))}
                        placeholder="e.g. Upload your photo..."
                        style={{ width: '100%', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif" }}
                        onFocus={e => e.target.style.borderColor = '#C8A23A'} onBlur={e => e.target.style.borderColor = '#E7DED1'} />
                    </div>
                  )}
                </div>
                {/* Image uploader */}
                <ImageUploader
                  images={form.images}
                  onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                  uploading={uploading}
                  setUploading={setUploading}
                />
                {errors.images && <p style={{ fontSize: 11, color: '#EF4444', margin: '-8px 0 0' }}>{errors.images}</p>}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <button onClick={() => !uploading && setModalOpen(false)}
                    style={{ flex: 1, padding: '10px 0', border: '1px solid #E7DED1', borderRadius: 10, background: '#FFF', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C8A23A'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E7DED1'}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || uploading}
                    style={{ flex: 1, padding: '10px 0', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: '#FFF', cursor: 'pointer', opacity: (saving || uploading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {(saving || uploading) && <Loader2 size={13} className="animate-spin" />}
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


