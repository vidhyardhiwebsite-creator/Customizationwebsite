import { create } from 'zustand'

const KEY = 'recently_viewed'
const MAX = 10

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export const useRecentlyViewedStore = create((set, get) => ({
  items: load(),

  addProduct: (product) => {
    const items = get().items.filter(p => p.id !== product.id)
    const updated = [product, ...items].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
    set({ items: updated })
  },
}))
