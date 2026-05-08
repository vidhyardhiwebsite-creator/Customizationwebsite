import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, ChevronDown, ChevronUp, CheckCircle, Truck, Clock, XCircle, AlertTriangle } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../lib/supabase"
import { formatINR, formatDate } from "../utils/format"
import toast from "react-hot-toast"

function CancelButton({ order, onCancel }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: "cancelled", refund_status: "pending" })
        .eq("id", order.id)
      if (error) throw error
      onCancel(order.id)
      toast.success("Order cancelled. Refund will be processed within 5-7 business days.")
    } catch (e) {
      toast.error(e.message || "Failed to cancel order")
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-2 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-all"
      >
        <XCircle size={13} /> Cancel Order
      </button>
    )
  }

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-white text-sm font-medium">Cancel this order?</p>
          <p className="text-gray-400 text-xs mt-0.5">
            Your payment of {formatINR(order.total_amount)} will be refunded within 5-7 business days.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setConfirm(false)} className="flex-1 py-2 border border-[#D4AF37]/20 text-gray-400 rounded-lg text-xs">
          Keep Order
        </button>
        <button onClick={handleCancel} disabled={loading}
          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-1">
          {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Yes, Cancel
        </button>
      </div>
    </div>
  )
}

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle, desc: "Your order has been confirmed" },
  { key: "shipping", label: "Shipped", icon: Truck, desc: "Your order is on the way" },
  { key: "delivered", label: "Delivered", icon: Package, desc: "Order delivered successfully" },
]

function DeliveryTracker({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status)
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 mt-3">
      <p className="text-gray-400 text-xs font-medium mb-3">Delivery Status</p>
      <div className="flex items-start gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx
          const active = idx === currentIdx
          const Icon = step.icon
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div className={`w-full h-0.5 ${idx === 0 ? "opacity-0" : done ? "bg-[#D4AF37]" : "bg-[#333]"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  active ? "border-[#D4AF37] bg-[#D4AF37]/20" :
                  done ? "border-green-500 bg-green-500/20" :
                  "border-[#333] bg-[#222]"
                }`}>
                  <Icon size={14} className={active ? "text-[#D4AF37]" : done ? "text-green-400" : "text-gray-600"} />
                </div>
                <div className={`w-full h-0.5 ${idx === STATUS_STEPS.length - 1 ? "opacity-0" : done && idx < currentIdx ? "bg-[#D4AF37]" : "bg-[#333]"}`} />
              </div>
              <p className={`text-xs mt-1.5 text-center ${active ? "text-[#D4AF37] font-medium" : done ? "text-green-400" : "text-gray-600"}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const handleCancel = (orderId) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, order_status: "cancelled", refund_status: "pending" } : o
    ))
  }

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, images, price))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()

    // Real-time subscription for status updates
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
    if (order.payment_status === "pending") return { label: "Pending Payment", color: "bg-yellow-500/20 text-yellow-400", icon: Clock }
    if (order.payment_status === "failed") return { label: "Payment Failed", color: "bg-red-500/20 text-red-400", icon: XCircle }
    if (order.order_status === "cancelled") return { label: "Cancelled", color: "bg-red-500/20 text-red-400", icon: XCircle }
    const status = order.order_status || "confirmed"
    const map = {
      confirmed: { label: "Order Confirmed", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle },
      shipping: { label: "Shipped", color: "bg-orange-500/20 text-orange-400", icon: Truck },
      delivered: { label: "Delivered", color: "bg-green-500/20 text-green-400", icon: Package },
    }
    return map[status] || { label: status, color: "bg-gray-500/20 text-gray-400", icon: Package }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-[#111] rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-[#1A1A1A] rounded w-1/3 mb-3" />
            <div className="h-3 bg-[#1A1A1A] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Package size={64} className="text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>No orders yet</h2>
        <p className="text-gray-500">Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "Georgia, serif" }}>My Orders</h1>
      <div className="space-y-4">
        {orders.map((order, i) => {
          const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
          const statusInfo = getStatusBadge(order)
          const StatusIcon = statusInfo.icon
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#111] border border-[#D4AF37]/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <p className="text-white font-medium text-sm">{order.display_order_id || `Order #${order.id?.slice(-8)?.toUpperCase()}`}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[#D4AF37] font-semibold">{formatINR(order.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 ${statusInfo.color}`}>
                      <StatusIcon size={10} /> {statusInfo.label}
                    </span>
                  </div>
                  {expanded === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-[#D4AF37]/10 p-5 space-y-4">
      {/* Delivery Tracker */}
                      {order.payment_status === "paid" && order.order_status !== "cancelled" && (
                        <DeliveryTracker status={order.order_status || "confirmed"} />
                      )}

                      {/* Cancel button - only before shipping */}
                      {order.payment_status === "paid" &&
                        (order.order_status === "confirmed" || !order.order_status) && (
                        <CancelButton order={order} onCancel={handleCancel} />
                      )}

                      {/* Cancelled state */}
                      {order.order_status === "cancelled" && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <p className="text-red-400 text-sm font-medium">Order Cancelled</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {order.refund_status === "refunded"
                              ? "✓ Refund processed. Amount will reflect in 5-7 business days."
                              : "Refund is being processed. You will receive it within 5-7 business days."}
                          </p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.products?.images?.[0] && (
                              <img src={item.products.images[0]} alt={item.products?.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { if(e.target.src !== "https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80") e.target.src="https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=400&q=80" }} />
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm">{item.products?.name || "Product"}</p>
                              <p className="text-gray-500 text-xs">Qty: {item.quantity} × {formatINR(item.price)}</p>
                            </div>
                            <p className="text-gray-300 text-sm">{formatINR(item.quantity * item.price)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      {addr.full_name && (
                        <div className="bg-[#1A1A1A] rounded-lg p-3 text-xs text-gray-400">
                          <p className="text-gray-300 font-medium mb-1">Delivery Address</p>
                          <p>{addr.full_name}, {addr.phone}</p>
                          <p>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}</p>
                          <p>{addr.city}, {addr.state} – {addr.pincode}</p>
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
  )
}
