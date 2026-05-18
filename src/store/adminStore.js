import { create } from "zustand"
import { supabase } from "../lib/supabase"

export const useAdminStore = create((set, get) => ({
  products: [],
  orders: [],
  stats: null,
  loading: false,
  notifications: [],
  startupNotified: false,

  loadProducts: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    if (error) console.error("Load products error:", error.message)
    set({ products: data || [], loading: false })
  },

  loadOrders: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, images, price, category, custom_id)), payment_screenshot_url, upi_ref, payment_verified, payment_method")
      .order("created_at", { ascending: false })
    if (error) console.error("Load orders error:", error.message)
    set({ orders: data || [], loading: false })
  },

  computeStats: () => {
    const { orders, products } = get()
    const today = new Date().toDateString()
    const paidOrders = orders.filter(o => o.payment_status === "paid")
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
    // Only count active orders today (exclude cancelled, failed, and rejected)
    const todayOrders = orders.filter(o =>
      new Date(o.created_at).toDateString() === today &&
      o.order_status !== "cancelled" &&
      o.payment_status !== "failed" &&
      o.payment_status !== "rejected"
    )
    const lowStock = products.filter(p => (p.stock || 0) < 10)

    // Last 14 days chart data
    const last14 = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toDateString()
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === ds)
      last14.push({
        date: label,
        orders: dayOrders.length,
        revenue: dayOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0)
      })
    }

    // Category sales
    const catMap = {}
    orders.forEach(o => {
      o.order_items?.forEach(item => {
        const cat = item.products?.category || "Other"
        catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity)
      })
    })
    const categorySales = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    // City distribution from address jsonb
    const cityMap = {}
    orders.forEach(o => {
      let city = o.city
      if (!city && o.address) {
        try { city = (typeof o.address === "string" ? JSON.parse(o.address) : o.address)?.city } catch {}
      }
      city = city || "Unknown"
      cityMap[city] = (cityMap[city] || 0) + 1
    })
    const cityData = Object.entries(cityMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 8)

    // Top products
    const prodMap = {}
    orders.forEach(o => {
      o.order_items?.forEach(item => {
        const name = item.products?.name || "Unknown"
        const short = name.length > 20 ? name.slice(0, 20) + "…" : name
        prodMap[short] = (prodMap[short] || 0) + item.quantity
      })
    })
    const topProducts = Object.entries(prodMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 8)

    set({
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        lowStockCount: lowStock.length,
        todayOrdersCount: todayOrders.length,
        paidOrders: paidOrders.length,
        pendingOrders: orders.filter(o => o.payment_status === "pending").length,
        last14Days: last14,
        categorySales,
        cityData,
        topProducts,
        lowStockProducts: lowStock,
      }
    })
  },

  addProduct: async (productData) => {
    const { data, error } = await supabase.from("products").insert(productData).select().single()
    if (error) throw new Error(error.message)
    set(s => ({ products: [data, ...s.products] }))
    // Fire low stock notification if stock < 10
    if ((data.stock || 0) < 10) {
      get().addNotification(`Low stock: "${data.name}" has only ${data.stock} left`, "warning")
    }
    return data
  },

  updateProduct: async (id, updates) => {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()
    if (error) throw new Error(error.message)
    set(s => ({ products: s.products.map(p => p.id === id ? data : p) }))
    // Fire low stock notification if stock dropped below 10
    if ((data.stock || 0) < 10) {
      get().addNotification(`Low stock: "${data.name}" has only ${data.stock} left`, "warning")
    }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) throw new Error(error.message)
    set(s => ({ products: s.products.filter(p => p.id !== id) }))
  },

  updateOrderStatus: async (id, status) => {
    const { error } = await supabase.from("orders").update({ payment_status: status }).eq("id", id)
    if (error) throw new Error(error.message)
    set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, payment_status: status } : o) }))
  },

  addNotification: (msg, type = "info") => {
    const n = { id: Date.now(), msg, type, time: new Date() }
    set(s => ({ notifications: [n, ...s.notifications].slice(0, 20) }))
  },

  clearNotification: (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }))
  },
}))
