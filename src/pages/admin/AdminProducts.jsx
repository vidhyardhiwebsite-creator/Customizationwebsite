import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, Upload, ImagePlus, Loader2 } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { CATEGORIES, TAGS } from "../../data/products"
import { formatINR } from "../../utils/format"
import { uploadProductImages, deleteProductImage } from "../../services/storageService"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

// Only Bangles have sizes - admin types them as comma-separated values
const BANGLE_CATEGORY = "Bangles"

const EMPTY_FORM = {
  name: "", price: "", category: CATEGORIES[0], description: "",
  size: "", stock: "", tags: [], images: []
}

// Image uploader sub-component
function ImageUploader({ images, onImagesChange, uploading, setUploading }) {
  const inputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files.length) return
    const fileArr = Array.from(files).slice(0, 4 - images.length)
    if (fileArr.length === 0) { toast.error("Max 4 images allowed"); return }
    setUploading(true)
    try {
      const urls = await uploadProductImages(fileArr)
      onImagesChange([...images, ...urls])
      toast.success(`${urls.length} image(s) uploaded`)
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
      <label className="text-xs text-gray-400 mb-2 block">Product Images (max 4)</label>
      {/* Drop zone */}
      {images.length < 4 && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#1B2B5E]/30 hover:border-[#D4AF37]/60 rounded-xl p-6 text-center cursor-pointer transition-all mb-3 bg-gray-50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-[#1B2B5E]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <ImagePlus size={28} className="text-[#1B2B5E]/50 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Drop images here or click to browse</p>
              <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP - max 5MB each</p>
            </>
          )}
        </div>
      )}
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" loading="lazy"
                onError={e => { if (e.target.src !== 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80') e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }} />
              <button
                type="button"
                onClick={() => removeImage(url, i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-black/60 text-[#1B2B5E] rounded-b-lg py-0.5">Main</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminProducts() {
  const { products, loadProducts, addProduct, updateProduct, deleteProduct } = useAdminStore()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({
      name: p.name || "", price: String(p.price || ""), category: p.category || CATEGORIES[0],
      description: p.description || "", size: p.category === BANGLE_CATEGORY ? (p.size || "") : "",
      stock: String(p.stock || ""), tags: p.tags || [], images: p.images || []
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

    // Check for duplicate custom_id (only when adding new or changing the ID)
    const newCustomId = form.custom_id?.trim()
    if (newCustomId && (!editProduct || editProduct.custom_id !== newCustomId)) {
      const existing = products.find(p => p.custom_id === newCustomId && p.id !== editProduct?.id)
      if (existing) {
        toast.error(`Product ID "${newCustomId}" already exists - "${existing.name}". Edit that product instead.`, { duration: 5000 })
        setSaving(false)
        return
      }
    }
    const payload = {
      name: form.name.trim(), price: Number(form.price), category: form.category, custom_id: form.custom_id?.trim() || null,
      description: form.description.trim(), size: form.category === BANGLE_CATEGORY ? (form.size.trim() || null) : null,
      stock: Number(form.stock), tags: form.tags, images: form.images, series_id: form.series_id || 'NS0',
    }
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload)
        toast.success("Product updated!")
      } else {
        await addProduct(payload)
        toast.success("Product added!")
      }
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1B2B5E] text-white font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-600 focus:outline-none focus:border-[#1B2B5E]" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>{["Product","Category","Price","Stock","Tags","Actions"].map(h => (
                <th key={h} className="text-left text-gray-500 text-xs px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=60&q=60'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg"
                        loading="lazy"
                        onError={e => { if (e.target.src !== 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80') e.target.src = 'https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80' }}
                      />
                      <div>
                        <p className="text-[#1A1A2E] text-xs font-medium">{p.name}</p>
                        {p.custom_id && <p className="text-[#1B2B5E] text-xs font-mono">{p.custom_id}</p>}
                        <p className="text-gray-400 text-xs">{p.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                  <td className="px-4 py-3 text-[#1B2B5E] text-xs font-medium">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${p.stock < 10 ? "text-red-400" : p.stock < 20 ? "text-yellow-400" : "text-green-400"}`}>
                      {p.stock < 10 && <AlertTriangle size={11} className="inline mr-1" />}{p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.tags || []).slice(0,2).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 bg-[#1B2B5E]/10 text-[#1B2B5E] rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-[#1B2B5E] transition-colors p-1"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && !uploading && setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-[#1B2B5E] font-semibold">{editProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => !uploading && setModalOpen(false)} className="text-gray-400 hover:text-[#1A1A2E] p-1"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Product ID <span className="text-gray-600">(e.g. NS0.1, NS1.5)</span></label>
                    <input value={form.custom_id||""} onChange={e => setForm(f => ({ ...f, custom_id: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
                      placeholder="e.g. NS0.1" />
                    <p className="text-gray-600 text-xs mt-0.5">Leave empty to auto-generate</p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Product Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
                      placeholder="e.g. Kundan Jhumka Earrings" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Price (?) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
                      placeholder="2499" />
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
                      placeholder="15" />
                    {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, size: "" }))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {form.category === BANGLE_CATEGORY && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Available Sizes</label>
                      <input
                        value={form.size}
                        onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                        placeholder="e.g. 2.4, 2.6, 2.8, Free Size"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]"
                      />
                      <p className="text-gray-600 text-xs mt-0.5">Comma-separated. Remove a size to mark it out of stock.</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E] resize-none"
                      placeholder="Product description..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.tags.includes(tag) ? "bg-[#1B2B5E] text-white" : "bg-gray-50 text-gray-400 border border-gray-200 hover:border-[#1B2B5E]/50"}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
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
                    className="flex-1 py-2.5 border border-gray-200 text-gray-400 rounded-lg text-sm hover:border-[#1B2B5E]/50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || uploading}
                    className="flex-1 py-2.5 bg-[#1B2B5E] text-white font-semibold rounded-lg text-sm hover:bg-[#2A3F7E] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
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
              <h3 className="text-[#1B2B5E] font-semibold mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-5">Images will also be deleted from storage. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 py-2 border border-gray-200 text-gray-400 rounded-lg text-sm disabled:opacity-50">Cancel</button>
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
