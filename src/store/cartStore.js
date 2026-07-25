import { create } from "zustand"
import { supabase } from "../lib/supabase"

const CART_KEY = "vidhyrathi_cart"
const getLocal = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") } catch { return [] } }
const saveLocal = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items))

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  loadCart: async (userId) => {
    if (!userId) { set({ items: getLocal() }); return }
    set({ loading: true })
    try {
      const { data, error } = await supabase.from("cart").select("*, products(*)").eq("user_id", userId)
      if (error) throw error
      set({ items: data || [], loading: false })
    } catch (e) {
      console.warn("Cart load failed, using localStorage:", e.message)
      set({ items: getLocal(), loading: false })
    }
  },

  mergeLocalCart: async (userId) => {
    const local = getLocal()
    if (!local.length) return
    for (const item of local) {
      try {
        const { data: existing } = await supabase.from("cart").select("*").eq("user_id", userId).eq("product_id", item.product_id).maybeSingle()
        if (existing) {
          await supabase.from("cart").update({ quantity: Math.max(existing.quantity, item.quantity) }).eq("id", existing.id)
        } else {
          await supabase.from("cart").insert({ user_id: userId, product_id: item.product_id, quantity: item.quantity })
        }
      } catch {}
    }
    localStorage.removeItem(CART_KEY)
    get().loadCart(userId)
  },

  addToCart: async (product, userId) => {
    // Always update local state immediately for responsiveness
    const { items } = get()
    const existing = items.find(i => i.product_id === product.id)
    let newItems
    if (existing) {
      newItems = items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
    } else {
      newItems = [...items, { product_id: product.id, quantity: 1, products: product, id: `local_${product.id}` }]
    }
    set({ items: newItems })

    if (!userId) { saveLocal(newItems); return }

    // Sync to Supabase
    try {
      if (existing && existing.id && !String(existing.id).startsWith("local_")) {
        const { error } = await supabase.from("cart").update({ quantity: existing.quantity + 1 }).eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("cart").insert({ user_id: userId, product_id: product.id, quantity: 1 })
        if (error) throw error
      }
      // Reload to get real IDs
      await get().loadCart(userId)
    } catch (e) {
      console.warn("Cart sync failed (product may be mock data):", e.message)
      // Keep local state, save to localStorage as backup
      saveLocal(newItems)
    }
  },

  updateQuantity: async (cartItemId, quantity, userId) => {
    const { items } = get()
    // Optimistic update immediately
    const updated = quantity <= 0
      ? items.filter(i => i.id !== cartItemId && i.product_id !== cartItemId)
      : items.map(i => (i.id === cartItemId || i.product_id === cartItemId) ? { ...i, quantity } : i)
    set({ items: updated })

    if (!userId) { saveLocal(updated); return }

    // Sync to Supabase (only if real DB id, not local_xxx)
    if (String(cartItemId).startsWith('local_')) { saveLocal(updated); return }
    try {
      if (quantity <= 0) {
        await supabase.from("cart").delete().eq("id", cartItemId)
      } else {
        await supabase.from("cart").update({ quantity }).eq("id", cartItemId)
      }
    } catch (e) {
      console.warn("Cart update failed:", e.message)
      saveLocal(updated)
    }
  },

  removeFromCart: async (cartItemId, userId) => {
    // Optimistic remove immediately
    const updated = get().items.filter(i => i.id !== cartItemId && i.product_id !== cartItemId)
    set({ items: updated })

    if (!userId) { saveLocal(updated); return }
    if (String(cartItemId).startsWith('local_')) { saveLocal(updated); return }
    try {
      await supabase.from("cart").delete().eq("id", cartItemId)
    } catch (e) {
      console.warn("Cart remove failed:", e.message)
      saveLocal(updated)
    }
  },

  clearCart: async (userId) => {
    if (!userId) { localStorage.removeItem(CART_KEY); set({ items: [] }); return }
    await supabase.from("cart").delete().eq("user_id", userId)
    set({ items: [] })
  },

  getTotal: () => get().items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0),
  getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}))
