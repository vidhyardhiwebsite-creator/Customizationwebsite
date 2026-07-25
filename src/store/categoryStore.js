import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products'

const SETTING_KEY = 'custom_categories'

export const useCategoryStore = create((set, get) => ({
  // All categories (defaults + admin-added), sorted
  categories: [...DEFAULT_CATEGORIES].sort(),
  loading: false,

  // Load from Supabase site_settings
  loadCategories: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTING_KEY)
        .single()

      let custom = []
      if (data?.value) {
        try { custom = JSON.parse(data.value) } catch {}
      }
      const merged = [...new Set([...DEFAULT_CATEGORIES, ...custom])].sort()
      set({ categories: merged, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  // Save the full custom list (admin-added only, not defaults) to Supabase
  _saveCustom: async (customList) => {
    await supabase
      .from('site_settings')
      .upsert({ key: SETTING_KEY, value: JSON.stringify(customList) }, { onConflict: 'key' })
  },

  addCategory: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const current = get().categories
    if (current.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) return

    const merged = [...new Set([...current, trimmed])].sort()
    set({ categories: merged })

    // Persist only the non-default ones
    const custom = merged.filter(c => !DEFAULT_CATEGORIES.includes(c))
    await get()._saveCustom(custom)
  },

  deleteCategory: async (name) => {
    // Don't allow deleting built-in defaults
    if (DEFAULT_CATEGORIES.includes(name)) return

    const merged = get().categories.filter(c => c !== name).sort()
    set({ categories: merged })

    const custom = merged.filter(c => !DEFAULT_CATEGORIES.includes(c))
    await get()._saveCustom(custom)
  },

  isDefault: (name) => DEFAULT_CATEGORIES.includes(name),
}))
