import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, ChevronUp, CheckCircle, Truck, Package, XCircle, RotateCcw, AlertTriangle, Eye, MessageCircle } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { formatINR, formatDate } from "../../utils/format"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const ADMIN_WHATSAPP = "918639006849"
const ORDER_FLOW = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
]
const PAYMENT_STATUSES = ["all", "pending_verification", "paid", "pending", "failed", "cancelled"]
const SERIES_FILTERS = ["all", "NS0", "NS1"]

function StatusStepper({ orderId, currentStatus, onUpdate }) {
  const [updating, setUpdating] = useState(false)
  const steps = ORDER_FLOW
  const currentIdx = steps.findIndex(s => s.key === currentStatus)
  const advance = async () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= steps.length) return
    setUpdating(true)
    try {
      const { error } = await supabase.from("orders").update({ order_status: steps[nextIdx].key }).eq("id", orderId)
      if (error) throw error
      onUpdate(orderId, steps[nextIdx].key)
      toast.success("Status updated to " + steps[nextIdx].label)
    } catch (e) { toast.error(e.message) }
    finally { setUpdating(false) }
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, idx) => {
          const done = idx < currentIdx; const active = idx === currentIdx; const Icon = step.icon
          return (
            <div key={step.key} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${active ? "bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37]" : done ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#222] border-[#333] text-gray-600"}`}>
                <Icon size={11} />{step.label}
              </div>
              {idx < steps.length - 1 && <div className={`w-4 h-px ${done ? "bg-green-500/40" : "bg-[#333]"}`} />}
            </div>
          )
        })}
      </div>
      {currentIdx < steps.length - 1 && (
        <button onClick={advance} disabled={updating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg hover:bg-[#F0D060] disabled:opacity-60">
          Mark as {steps[currentIdx + 1]?.label} →
        </button>
      )}
      {currentIdx === steps.length - 1 && <p className="text-green-400 text-xs">✓ Fully delivered</p>}
    </div>
  )
}

export default function AdminOrders() {
  const { orders, loadOrders } = useAdminStore()
  const [localOrders, setLocalOrders] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [seriesFilter, setSeriesFilter] = useState("all")
  const [expanded, setExpanded] = useState(null)
  const [screenshotModal, setScreenshotModal] = useState(null)

  useEffect(() => { loadOrders() }, [])
  useEffect(() => { setLocalOrders(orders) }, [orders])

  const handleStatusUpdate = (orderId, newStatus) => {
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
  }

  const verifyPayment = async (orderId) => {
    const { error } = await supabase.from("orders").update({ payment_status: "paid", payment_verified: true, order_status: "confirmed" }).eq("id", orderId)
    if (!error) {
      setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: "paid", payment_verified: true, order_status: "confirmed" } : o))
      toast.success("Payment verified! Order confirmed.")
    } else { toast.error(error.message) }
  }

  const rejectPayment = async (orderId) => {
    const { error } = await supabase.from("orders").update({ payment_status: "failed", order_status: "cancelled" }).eq("id", orderId)
    if (!error) {
      setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: "failed", order_status: "cancelled" } : o))
      toast.success("Payment rejected.")
    } else { toast.error(error.message) }
  }

  const notifyCustomer = (order) => {
    const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
    const msg = encodeURIComponent(
      `✅ *Order Confirmed - NaShe Jewels*\n\n` +
      `Hi ${addr.full_name || "Customer"},\n` +
      `Your order ${order.display_order_id || '#' + String(order.id).slice(-8).toUpperCase()} has been confirmed!\n` +
      `Amount: ₹${order.total_amount?.toLocaleString("en-IN")}\n\n` +
      `We will ship your jewelry soon. Thank you for shopping with NaShe Jewels! 💍`
    )
    const phone = addr.phone?.replace(/\D/g, "")
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else toast.error("Customer phone not available")
  }

  const filtered = localOrders.filter(o => {
    const matchStatus = statusFilter === "all" || o.payment_status === statusFilter
    const matchSeries = seriesFilter === "all" || o.order_series === seriesFilter
    const matchSearch = !search || String(o.id).toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch && matchSeries
  })

  const getStatusInfo = (o) => {
    if (o.payment_status === "pending_verification") return { label: "Awaiting Verification", color: "bg-orange-500/20 text-orange-400" }
    if (o.order_status === "cancelled") return { label: "Cancelled", color: "bg-red-500/20 text-red-400" }
    if (o.payment_status === "pending") return { label: "Pending Payment", color: "bg-yellow-500/20 text-yellow-400" }
    if (o.payment_status === "failed") return { label: "Payment Failed", color: "bg-red-500/20 text-red-400" }
    const status = o.order_status || "confirmed"
    const map = { confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-400" }, shipping: { label: "Shipping", color: "bg-orange-500/20 text-orange-400" }, delivered: { label: "Delivered", color: "bg-green-500/20 text-green-400" } }
    return map[status] || { label: status, color: "bg-gray-500/20 text-gray-400" }
  }

  const getAddress = (order) => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{localOrders.length} total · {localOrders.filter(o => o.payment_status === "pending_verification").length} awaiting verification</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID..."
            className="w-full bg-[#111] border border-[#D4AF37]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PAYMENT_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-[#D4AF37] text-black" : "bg-[#111] text-gray-400 border border-[#D4AF37]/20"}`}>
              {s === "pending_verification" ? "⚠ Verify" : s}
            </button>
          ))}
        </div>
        {/* Series filter */}
        <div className="flex gap-2">
          {SERIES_FILTERS.map(s => (
            <button key={s} onClick={() => setSeriesFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${seriesFilter === s ? "bg-[#111] text-white border border-white" : "bg-[#111] text-gray-500 border border-[#D4AF37]/10"}`}>
              {s === "all" ? "All Series" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", count: localOrders.length, color: "text-white" },
          { label: "Verify", count: localOrders.filter(o => o.payment_status === "pending_verification").length, color: "text-orange-400" },
          { label: "Paid", count: localOrders.filter(o => o.payment_status === "paid").length, color: "text-green-400" },
          { label: "Delivered", count: localOrders.filter(o => o.order_status === "delivered").length, color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-[#D4AF37]/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? <div className="text-center py-12 text-gray-500">No orders found</div>
        : filtered.map(order => {
          const addr = getAddress(order)
          const isExpanded = expanded === order.id
          const statusInfo = getStatusInfo(order)
          const isCancelled = order.order_status === "cancelled"
          const needsVerification = order.payment_status === "pending_verification"
          return (
            <div key={order.id} className={`bg-[#111] border rounded-xl overflow-hidden ${needsVerification ? "border-orange-500/30" : isCancelled ? "border-red-500/20" : "border-[#D4AF37]/10"}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : order.id)}>
                <div>
                  <p className="text-white text-sm font-mono">
                    {order.display_order_id || '#' + String(order.id).slice(-8).toUpperCase()}
                    {order.order_series && (
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-bold ${order.order_series === "NS1" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {order.order_series}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.created_at)} · {addr.full_name || "Customer"}</p>                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#D4AF37] font-semibold text-sm hidden sm:block">{formatINR(order.total_amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                  {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-[#D4AF37]/10 p-4 space-y-4">

                      {/* Payment verification panel */}
                      {needsVerification && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 space-y-3">
                          <p className="text-orange-400 text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle size={15} /> Payment Screenshot — Verify Before Confirming
                          </p>
                          {order.payment_screenshot_url && (
                            <div>
                              <button onClick={() => setScreenshotModal(order.payment_screenshot_url)}
                                className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] border border-orange-500/30 rounded-lg text-xs text-orange-400 hover:bg-orange-500/10 transition-all">
                                <Eye size={13} /> View Payment Screenshot
                              </button>
                            </div>
                          )}
                          {order.upi_ref && <p className="text-gray-400 text-xs">UPI Ref: <span className="text-white font-mono">{order.upi_ref}</span></p>}
                          <div className="flex gap-2">
                            <button onClick={() => verifyPayment(order.id)}
                              className="flex-1 py-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/30 transition-all">
                              ✓ Verify & Confirm Order
                            </button>
                            <button onClick={() => rejectPayment(order.id)}
                              className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/30 transition-all">
                              ✗ Reject Payment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Paid order — delivery stepper */}
                      {order.payment_status === "paid" && !isCancelled && (
                        <div className="bg-[#1A1A1A] rounded-xl p-4">
                          <p className="text-gray-400 text-xs font-medium mb-3">Delivery Status</p>
                          <StatusStepper orderId={order.id} currentStatus={order.order_status || "confirmed"} onUpdate={handleStatusUpdate} />
                        </div>
                      )}

                      {/* Cancelled */}
                      {isCancelled && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          <p className="text-red-400 text-sm font-medium">Order Cancelled</p>
                          {order.payment_screenshot_url && (
                            <button onClick={() => setScreenshotModal(order.payment_screenshot_url)}
                              className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
                              <Eye size={12} /> View Screenshot
                            </button>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs font-medium mb-2">Order Items</p>
                          <div className="space-y-2">
                            {order.order_items?.map(item => (
                              <div key={item.id} className="flex items-center gap-3 bg-[#1A1A1A] rounded-lg p-2">
                                {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-10 h-10 object-cover rounded" loading="lazy" onError={e=>{e.target.style.display="none"}} />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs truncate">{item.products?.name || "Product"}</p>
                                  <p className="text-gray-500 text-xs">Qty: {item.quantity} × {formatINR(item.price)}</p>
                                </div>
                                <p className="text-[#D4AF37] text-xs">{formatINR(item.quantity * item.price)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {addr.full_name && (
                            <div className="bg-[#1A1A1A] rounded-lg p-3">
                              <p className="text-gray-400 text-xs font-medium mb-1">Delivery Address</p>
                              <p className="text-white text-xs">{addr.full_name} · {addr.phone}</p>
                              <p className="text-gray-400 text-xs">{addr.address1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          )}
                          {/* WhatsApp notify customer */}
                          <button onClick={() => notifyCustomer(order)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-green-500/15 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/25 transition-all">
                            <MessageCircle size={13} /> Notify Customer on WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Screenshot modal */}
      <AnimatePresence>
        {screenshotModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setScreenshotModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-lg w-full bg-[#111] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/10">
                <p className="text-white font-medium">Payment Screenshot</p>
                <button onClick={() => setScreenshotModal(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <img src={screenshotModal} alt="Payment screenshot" className="w-full max-h-[70vh] object-contain p-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
