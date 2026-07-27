import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Package, ChevronDown, ChevronUp, CheckCircle, Truck, Clock, XCircle, AlertTriangle, Search } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../lib/supabase"
import { formatINR, formatDate } from "../utils/format"
import { isVideoUrl } from "../services/storageService"

const STATUS_STEPS = [
  {
    key: "confirmed", label: "Confirmed", icon: CheckCircle,
    desc: "Your order has been confirmed",
    activeColor: "bg-blue-500 border-blue-500",
    doneColor: "bg-blue-500 border-blue-500",
    activeText: "text-blue-600 font-semibold",
    doneText: "text-blue-500 font-medium",
    activeLine: "bg-blue-400",
  },
  {
    key: "shipping", label: "Shipped", icon: Truck,
    desc: "Your order is on the way",
    activeColor: "bg-orange-500 border-orange-500",
    doneColor: "bg-orange-500 border-orange-500",
    activeText: "text-orange-500 font-semibold",
    doneText: "text-orange-500 font-medium",
    activeLine: "bg-orange-400",
  },
  {
    key: "delivered", label: "Delivered", icon: Package,
    desc: "Order delivered successfully",
    activeColor: "bg-green-500 border-green-500",
    doneColor: "bg-green-500 border-green-500",
    activeText: "text-green-600 font-semibold",
    doneText: "text-green-500 font-medium",
    activeLine: "bg-green-400",
  },
]

function DeliveryTracker({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status)
  const isCancelled = status === "cancelled"
  return (
    <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 mt-3 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[#1A1A2E] text-sm font-semibold">Order Status</p>
        {isCancelled && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">Cancelled</span>
        )}
      </div>
      <div className="flex items-start gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const done = !isCancelled && idx <= currentIdx
          const active = !isCancelled && idx === currentIdx
          const Icon = step.icon
          const lineColor = done && idx < currentIdx ? step.activeLine : "bg-[#E8E0D5]"
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {/* Left connector line */}
                <div className={`w-full h-1 rounded-full ${idx === 0 ? "opacity-0" : done ? STATUS_STEPS[idx - 1].activeLine : "bg-[#E8E0D5]"}`} />
                {/* Step circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all shadow-sm ${
                  active ? step.activeColor :
                  done ? step.doneColor :
                  "border-[#D1D5DB] bg-[#F3F4F6]"
                }`}>
                  <Icon size={16} className={done || active ? "text-white" : "text-[#9CA3AF]"} />
                </div>
                {/* Right connector line */}
                <div className={`w-full h-1 rounded-full ${idx === STATUS_STEPS.length - 1 ? "opacity-0" : done && idx < currentIdx ? step.activeLine : "bg-[#E8E0D5]"}`} />
              </div>
              <p className={`text-xs mt-2 text-center ${
                active ? step.activeText :
                done ? step.doneText :
                "text-[#9CA3AF]"
              }`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
      {!isCancelled && currentIdx >= 0 && (
        <p className="text-center text-xs text-gray-400 mt-3 italic">{STATUS_STEPS[currentIdx].desc}</p>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState("")

  const filteredOrders = search.trim()
    ? orders.filter(o => (o.display_order_id || "").toLowerCase().includes(search.toLowerCase().trim()))
    : orders

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product_id, products(id, name, images, price))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()

    const channel = supabase
      .channel("orders-user")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const getStatusBadge = (order) => {
    if (order.payment_status === "pending") return { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock }
    if (order.payment_status === "failed") return { label: "Failed", color: "bg-red-100 text-red-700", icon: XCircle }
    if (order.order_status === "cancelled") return { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle }
    const status = order.order_status || "confirmed"
    const map = {
      confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700",   icon: CheckCircle },
      shipping:   { label: "Shipped",    color: "bg-orange-100 text-orange-700", icon: Truck },
      delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700",  icon: Package },
      pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-800", icon: Clock },
    }
    return map[status] || { label: status, color: "bg-gray-100 text-gray-600", icon: Package }
  }

  if (loading) {
    return (
      <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>
        <div className="container-lux" style={{ paddingTop: 48, paddingBottom: 80 }}>
          <div className="max-w-3xl mx-auto space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card-lux p-6">
                <div className="skeleton h-4 w-1/3 rounded mb-3" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{ background: "#F8F5F0", minHeight: "100vh" }} className="flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-warm-sm"
          style={{ background: "rgba(200,162,58,0.1)", border: "1px solid rgba(200,162,58,0.2)" }}>
          <Package size={36} style={{ color: "#C8A23A" }} />
        </div>
        <h2 className="heading-lg mb-3">No orders yet</h2>
        <p className="body-md mb-2">Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>

      {/* Page header */}
      <div style={{ background: "#F3EEE6", borderBottom: "1px solid #E7DED1" }}>
        <div className="container-lux" style={{ paddingTop: "clamp(20px,3vw,32px)", paddingBottom: "clamp(16px,2.5vw,28px)" }}>
          <span className="eyebrow" style={{ marginBottom: 6 }}>Account</span>
          <h1 className="heading-xl" style={{ marginBottom: 0 }}>My <span className="text-gold-accent">Orders</span></h1>
        </div>
      </div>

      <div className="container-lux" style={{ paddingTop: "clamp(20px,3vw,32px)", paddingBottom: "clamp(40px,6vw,72px)" }}>
        <div className="max-w-3xl mx-auto">

          {/* Search bar */}
          <div className="relative mb-6">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#8F857A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID (e.g. NS0-001)..."
              className="input-warm" style={{ paddingLeft: 42, height: 48 }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F857A] hover:text-[#2C241B] transition-colors">
                <span className="text-xs font-bold">✕</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 && search && (
              <div className="text-center py-12">
                <p className="body-md mb-3">No orders found for "{search}"</p>
                <button onClick={() => setSearch("")} className="btn-ghost" style={{ height: 40, padding: "0 20px", fontSize: 13 }}>Clear search</button>
              </div>
            )}
        {filteredOrders.map((order, i) => {
            const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
            const statusInfo = getStatusBadge(order)
            const StatusIcon = statusInfo.icon
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-lux overflow-hidden">
                <div
                  style={{ background: "transparent", cursor: "pointer", padding: "14px 16px", borderRadius: 20 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAF8F3"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  {/* Top row: Order ID + Amount */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <p className="font-inter font-semibold text-[#2C241B]" style={{ fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                      {order.display_order_id && !order.display_order_id.includes("null")
                        ? order.display_order_id
                        : `Order #${order.id?.slice(-6)?.toUpperCase()}`}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <p className="font-inter font-bold text-[#2C241B]" style={{ fontSize: 15, margin: 0, whiteSpace: "nowrap" }}>{formatINR(order.total_amount)}</p>
                      {expanded === order.id
                        ? <ChevronUp size={15} style={{ color: "#8F857A", flexShrink: 0 }} />
                        : <ChevronDown size={15} style={{ color: "#8F857A", flexShrink: 0 }} />}
                    </div>
                  </div>
                  {/* Bottom row: Date + Status badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <p className="font-inter text-[#8F857A]" style={{ fontSize: 12, margin: 0 }}>{formatDate(order.created_at)}</p>
                    <span className={`font-inter font-semibold flex items-center gap-1 flex-shrink-0 ${statusInfo.color}`}
                      style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      <StatusIcon size={10} /> {statusInfo.label}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === order.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-4 sm:p-5 space-y-4" style={{ background: "#FAF8F3", borderTop: "1px solid #E7DED1" }}>

                      {/* Delivery Tracker */}
                      {order.payment_status === "paid" && (
                        <DeliveryTracker status={order.order_status || "confirmed"} />
                      )}

                      {/* Tracking info — shown when shipped */}
                      {order.order_status === "shipping" && (order.tracking_id || order.tracking_image_url) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                          <p className="text-yellow-700 text-xs font-semibold flex items-center gap-1">
                            <Truck size={12} /> Shipment Tracking
                          </p>
                          {order.tracking_id && (
                            <div className="flex items-center gap-2">
                              <p className="text-[#4A4A6A] text-xs">Tracking ID:</p>
                              <p className="text-[#1A1A2E] text-xs font-mono font-semibold">{order.tracking_id}</p>
                            </div>
                          )}
                          {order.tracking_image_url && (
                            <img src={order.tracking_image_url} alt="Tracking" className="w-full max-h-48 object-contain rounded-lg border border-yellow-200" />
                          )}
                        </div>
                      )}

                      {/* Cancelled state */}
                      {order.order_status === "cancelled" && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <p className="text-red-400 text-sm font-medium flex items-center gap-1.5">
                            <XCircle size={14} /> Order Cancelled
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {order.refund_status === "refunded"
                              ? "✓ Refund processed. Amount will reflect in 5-7 business days."
                              : "Refund is being processed. You will receive it within 5-7 business days."}
                          </p>
                        </div>
                      )}

                      {/* Order items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {order.order_items?.map(item => (
                          <Link
                            key={item.id}
                            to={`/products/${item.product_id || item.products?.id}`}
                            style={{ display: "block", textDecoration: "none", borderRadius: 12, padding: "10px", background: "#FFFFFF", border: "1px solid #E7DED1" }}
                          >
                            {/* Product row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {item.products?.images?.[0] && (
                                isVideoUrl(item.products.images[0]) ? (
                                  <video
                                    src={item.products.images[0]}
                                    muted playsInline loop autoPlay
                                    style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #E7DED1", background: "#000" }}
                                  />
                                ) : (
                                  <img src={item.products.images[0]} alt={item.products?.name}
                                    style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #E7DED1" }}
                                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80" }} />
                                )
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: "#2C241B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.products?.name || "Product"}
                                </p>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", margin: "3px 0 0" }}>
                                  Qty: {item.quantity} × {formatINR(item.price)}
                                </p>
                              </div>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: "#2C241B", flexShrink: 0, margin: 0 }}>
                                {formatINR(item.quantity * item.price)}
                              </p>
                            </div>
                            {/* Customization */}
                            {(item.custom_name || item.custom_photo_url) && (
                              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #E7DED1", display: "flex", flexDirection: "column", gap: 6 }}>
                                {item.custom_name && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#C8A23A", whiteSpace: "nowrap" }}>✏ Text:</span>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#2C241B" }}>{item.custom_name}</span>
                                  </div>
                                )}
                                {item.custom_photo_url && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#C8A23A", whiteSpace: "nowrap" }}>📷 Photo:</span>
                                    <img src={item.custom_photo_url} alt="Custom"
                                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, border: "1px solid #E7DED1" }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>

                      {addr.full_name && (
                        <div style={{ background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 12, padding: "12px 14px" }}>
                          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: "#2C241B", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivery Address</p>
                          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#2C241B", margin: "0 0 2px" }}>{addr.full_name}, {addr.phone}</p>
                          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A", margin: "0 0 2px" }}>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}</p>
                          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A", margin: 0 }}>{addr.city}, {addr.state} – {addr.pincode}</p>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
