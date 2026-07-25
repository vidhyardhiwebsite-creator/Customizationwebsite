import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Tag, Lock, Loader2, X } from "lucide-react"
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

  const handleDelete = async (name) => {
    try {
      await deleteCategory(name)
      toast.success(`"${name}" removed`)
      setDeleteConfirm(null)
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const customCategories = categories.filter(c => !isDefault(c))
  const defaultCategories = categories.filter(c => isDefault(c))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>Categories</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage product categories. New categories appear in the navbar, Shop By Category section, and product form.
        </p>
      </div>

      {/* Add new category */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#1B2B5E] mb-4 flex items-center gap-2">
          <Plus size={15} /> Add New Category
        </h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Anklets, Rings, Hair Accessories..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:border-[#1B2B5E]"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2B5E] text-white font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      </div>

      {/* Custom categories */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#1B2B5E] flex items-center gap-2">
            <Tag size={15} /> Custom Categories
            <span className="ml-auto text-xs text-gray-400 font-normal">{customCategories.length} added</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#1B2B5E]" />
          </div>
        ) : customCategories.length === 0 ? (
          <div className="text-center py-10">
            <Tag size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No custom categories yet</p>
            <p className="text-gray-300 text-xs mt-1">Add one above to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            <AnimatePresence>
              {customCategories.map(cat => (
                <motion.li
                  key={cat}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9956C]" />
                    <span className="text-sm text-[#1A1A2E] font-medium">{cat}</span>
                    <span className="text-xs text-[#C9956C] bg-[#C9956C]/10 px-2 py-0.5 rounded-full">Custom</span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
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

      {/* Default categories (read-only) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#1B2B5E] flex items-center gap-2">
            <Lock size={15} /> Default Categories
            <span className="ml-auto text-xs text-gray-400 font-normal">Built-in, cannot be removed</span>
          </h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {defaultCategories.map(cat => (
            <li key={cat} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B2B5E]/30" />
                <span className="text-sm text-gray-500">{cat}</span>
              </div>
              <Lock size={12} className="text-gray-200" />
            </li>
          ))}
        </ul>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white border border-red-200 rounded-xl p-6 max-w-sm w-full text-center">
              <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-[#1B2B5E] font-semibold mb-1">Delete "{deleteConfirm}"?</h3>
              <p className="text-gray-400 text-sm mb-5">
                Existing products in this category won't be deleted, but they'll no longer appear under this category in the navbar or filters.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-400 rounded-lg text-sm hover:border-gray-300">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all">
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
