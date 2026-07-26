import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Tag, Lock, Loader2 } from "lucide-react"
import { useCategoryStore } from "../../store/categoryStore"
import toast from "react-hot-toast"

export default function AdminCategories() {
  const { categories, loading, loadCategories, addCategory, deleteCategory, isDefault } = useCategoryStore()
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { loadCategories() }, [])

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) { toast.error("Enter a category name"); return }
    if (categories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" already exists`); return
    }
    setSaving(true)
    try {
      await addCategory(trimmed)
      toast.success(`"${trimmed}" added`)
      setNewName("")
    } catch {
      toast.error("Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const customCategories = categories.filter(c => !isDefault(c))
  const defaultCategories = categories.filter(c => isDefault(c))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, minWidth: 0, width: '100%' }}>

      {/* ── Header ── */}
      <div style={{ paddingBottom: 12, borderBottom: '1px solid #E7DED1' }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>
          Categories
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '4px 0 0', lineHeight: 1.5 }}>
          Manage product categories. New categories appear in the navbar, Shop By Category section, and product form.
        </p>
      </div>

      {/* ── Add New Category ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
        <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#2C241B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} style={{ color: '#C8A23A' }} /> Add New Category
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Anklets, Rings, Hair Accessories..."
            style={{
              flex: 1, minWidth: 0,
              background: '#F8F5F0', border: '1px solid #E7DED1', borderRadius: 10,
              padding: '9px 12px', fontSize: 13, color: '#2C241B', outline: 'none',
              fontFamily: "'Inter',sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = '#C8A23A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,162,58,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#E7DED1'; e.target.style.boxShadow = 'none' }}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '9px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              color: '#FFFFFF', fontFamily: "'Inter',sans-serif", fontWeight: 600,
              fontSize: 13, borderRadius: 10, border: 'none', cursor: 'pointer',
              opacity: (saving || !newName.trim()) ? 0.55 : 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(200,162,58,0.3)',
            }}
          >
            {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />}
            Add
          </button>
        </div>
      </div>

      {/* ── Custom Categories ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#F8F5F0', borderBottom: '1px solid #E7DED1' }}>
          <Tag size={14} style={{ color: '#C8A23A', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#2C241B' }}>Custom Categories</span>
          <span style={{ marginLeft: 'auto', fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A' }}>{customCategories.length} added</span>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 0' }}>
            <Loader2 size={20} style={{ color: '#C8A23A', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : customCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <Tag size={26} style={{ color: '#E7DED1', display: 'block', margin: '0 auto 8px' }} />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A', margin: 0 }}>No custom categories yet</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#B8AFA8', margin: '3px 0 0' }}>Add one above to get started</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <AnimatePresence>
              {customCategories.map((cat, idx) => (
                <motion.li
                  key={cat}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: idx < customCategories.length - 1 ? '1px solid #F3EEE6' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAF8F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8A23A', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: '#2C241B' }}>{cat}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#C8A23A', background: 'rgba(200,162,58,0.1)', padding: '2px 8px', borderRadius: 999 }}>Custom</span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0B8B0', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#C0B8B0'}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ── Default Categories ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#F8F5F0', borderBottom: '1px solid #E7DED1' }}>
          <Lock size={14} style={{ color: '#8F857A', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#2C241B' }}>Default Categories</span>
          <span style={{ marginLeft: 'auto', fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A' }}>Built-in, cannot be removed</span>
        </div>

        {/* List */}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {defaultCategories.map((cat, idx) => (
            <li
              key={cat}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: idx < defaultCategories.length - 1 ? '1px solid #F3EEE6' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4C9BC', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#6F655A' }}>{cat}</span>
              </div>
              <Lock size={11} style={{ color: '#D4C9BC', flexShrink: 0 }} />
            </li>
          ))}
        </ul>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,27,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#FFFFFF', border: '1px solid rgba(217,83,79,0.2)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', textAlign: 'center' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Trash2 size={20} style={{ color: '#EF4444' }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: '#2C241B', margin: '0 0 6px' }}>
                Delete "{deleteConfirm}"?
              </h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '0 0 20px', lineHeight: 1.6 }}>
                Existing products in this category won't be deleted, but they'll no longer appear under this category.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '9px 0', border: '1px solid #E7DED1', borderRadius: 10, background: '#FFF', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#C8A23A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E7DED1'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{ flex: 1, padding: '9px 0', background: '#EF4444', border: '1px solid #DC2626', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#FFF', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
