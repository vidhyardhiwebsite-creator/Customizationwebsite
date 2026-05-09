import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, ChevronUp, CheckCircle, Truck, Package, XCircle, AlertTriangle, Eye, MessageCircle } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { formatINR, formatDate } from "../../utils/format"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const ADMIN_WHATSAPP = "918639006849"

function OrderCard({ order, expanded, onToggle, onStatusUpdate, onVerify, onReject, onNotify, onScreenshot }) {
  const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
  const isCancelled = order.order_status === "cancelled"
  const needsVerification = order.payment_status === "pending_verification"

  const getStatusColor = () => {
    if (needsVerification) return "border-orange-500/40 bg-orange-500/5"
    if (isCancelled) return "border-red-500/20"
    if (order.payment_status === "paid") return "border-green-500/20"
    return "border-[#D4AF37]/10"
  }

  const getStatusBadge = () => {
    if (needsVerification) return { label: "⚠ Verify", color: "bg-orange-500/20 text-orange-400" }
    if (isCancelled) return { label: "Cancelled", color: "bg-red-500/20 text-red-400" }
    if (order.payment_status === "failed") return { label: "Failed", color: "bg-red-500/20 text-red-400" }
    const s = order.order_status || "confirmed"
    const m = { confirmed: "bg-blue-500/20 text-blue-400", shipping: "bg-yellow-500/20 text-yellow-400", delivered: "bg-green-500/20 text-green-400" }
    return { label: s.charAt(0).toUpperCase() + s.slice(1), color: m[s] || "bg-gray-500/20 text-gray-400" }
  }

  const badge = getStatusBadge()

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/2" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-mono font-bold truncate">
            {order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{addr.full_name || "Customer"} · {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-[#D4AF37] text-xs font-semibold">{formatINR(order.total_amount)}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
          {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-[#D4AF37]/10 p-3 space-y-3">
              {/* Payment verification */}
              {needsVerification && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-2">
                  <p className="text-orange-400 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12} /> Verify Payment</p>
                  {order.payment_screenshot_url && (
                    <button onClick={() => onScreenshot(order.payment_screenshot_url)}
                      className="flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200">
                      <Eye size={11} /> View Screenshot
                    </button>
                  )}
                  {order.upi_ref && <p className="text-gray-400 text-xs">UPI: <span className="font-mono text-white">{order.upi_ref}</span></p>}
                  <div className="flex gap-2">
                    <button onClick={() => onVerify(order.id)} className="flex-1 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/30">✓ Confirm</button>
                    <button onClick={() => onReject(order.id)} className="flex-1 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/30">✗ Reject</button>
                  </div>
                </div>
              )}

              {/* Delivery stepper */}
              {order.payment_status === "paid" && !isCancelled && (
                <div className="space-y-2">
                  <div className="flex gap-1 flex-wrap">
                    {[{k:"confirmed",l:"Confirmed"},{k:"shipping",l:"Shipping"},{k:"delivered",l:"Delivered"}].map((s,i) => {
                      const cur = ["confirmed","shipping","delivered"].indexOf(order.order_status || "confirmed")
                      const done = i < cur; const active = i === cur
                      return (
                        <span key={s.k} className={`text-xs px-2 py-0.5 rounded border ${active?"bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37]":done?"bg-green-500/10 border-green-500/30 text-green-400":"bg-[#222] border-[#333] text-gray-600"}`}>
                          {s.l}
                        </span>
                      )
                    })}
                  </div>
                  {["confirmed","shipping"].includes(order.order_status || "confirmed") && (
                    <button onClick={() => onStatusUpdate(order.id, order.order_status || "confirmed")}
                      className="w-full py-1.5 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg hover:bg-[#F0D060]">
                      Mark as {order.order_status === "confirmed" ? "Shipping" : "Delivered"} →
                    </button>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="space-y-1">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-[#1A1A1A] rounded p-1.5">
                    {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-7 h-7 object-cover rounded" onError={e=>{e.target.style.display="none"}} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate">{item.products?.name}</p>
                      <p className="text-gray-500 text-xs">×{item.quantity} · {formatINR(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address + WhatsApp */}
              {addr.full_name && (
                <div className="bg-[#1A1A1A] rounded-lg p-2 text-xs text-gray-400">
                  <p className="text-white">{addr.full_name} · {addr.phone}</p>
                  <p>{addr.address1}, {addr.city} – {addr.pincode}</p>
                </div>
              )}
              <button onClick={() => onNotify(order, addr)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/25">
                <MessageCircle size={12} /> WhatsApp Customer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminOrders() {
  const { orders, loadOrders } = useAdminStore()
  const [localOrders, setLocalOrders] = useState([])
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState(null)
  const [screenshotModal, setScreenshotModal] = useState(null)

  useEffect(() => { loadOrders() }, [])
  useEffect(() => { setLocalOrders(orders) }, [orders])

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const next = currentStatus === "confirmed" ? "shipping" : "delivered"
    const { error } = await supabase.from("orders").update({ order_status: next }).eq("id", orderId)
    if (!error) { setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, order_status: next } : o)); toast.success("Updated to " + next) }
    else toast.error(error.message)
  }

  const verifyPayment = async (orderId) => {
    const { error } = await supabase.from("orders").update({ payment_status: "paid", payment_verified: true, order_status: "confirmed" }).eq("id", orderId)
    if (!error) { setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, payment_status: "paid", payment_verified: true, order_status: "confirmed" } : o)); toast.success("Payment verified!") }
    else toast.error(error.message)
  }

  const rejectPayment = async (orderId) => {
    const { error } = await supabase.from("orders").update({ payment_status: "failed", order_status: "cancelled" }).eq("id", orderId)
    if (!error) { setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, payment_status: "failed", order_status: "cancelled" } : o)); toast.success("Rejected") }
    else toast.error(error.message)
  }

  const notifyCustomer = (order, addr) => {
    const msg = encodeURIComponent(`✅ *Order Update - NaShe Jewels*\n\nHi ${addr.full_name || "Customer"},\nOrder ${order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()} status: ${order.order_status || "confirmed"}\nAmount: ₹${order.total_amount?.toLocaleString("en-IN")}\n\n💍 NaShe Jewels`)
    const phone = addr.phone?.replace(/\D/g, "")
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else toast.error("No phone number")
  }

  const filtered = localOrders.filter(o =>
    !search || (o.display_order_id || "").toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).toLowerCase().includes(search.toLowerCase())
  )

  const hasHome = (o) => {
    const id = (o.display_order_id || "").toUpperCase()
    return id.includes("HOME") || (!id.includes("HYD") && id.length > 0 && !id.startsWith("#"))
  }
  const hasHyd = (o) => (o.display_order_id || "").toUpperCase().includes("HYD")

  // An order can appear in BOTH columns if it has both series
  const homeOrders = filtered.filter(hasHome)
  const hydOrders = filtered.filter(hasHyd)
  const otherOrders = filtered.filter(o => !hasHome(o) && !hasHyd(o))

  const cardProps = { onStatusUpdate: handleStatusUpdate, onVerify: verifyPayment, onReject: rejectPayment, onNotify: notifyCustomer, onScreenshot: setScreenshotModal }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{localOrders.length} total · {localOrders.filter(o => o.payment_status === "pending_verification").length} awaiting verification</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID..."
          className="w-full bg-[#111] border border-[#D4AF37]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NS-HOME Column */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/30">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="text-white font-semibold">NS-HOME</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{homeOrders.length}</span>
            <span className="text-xs text-orange-400 ml-auto">{homeOrders.filter(o=>o.payment_status==="pending_verification").length} pending</span>
          </div>
          {homeOrders.length === 0
            ? <p className="text-gray-600 text-sm text-center py-8">No NS-HOME orders</p>
            : homeOrders.map(order => (
              <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                {...cardProps} />
            ))
          }
        </div>

        {/* NS-HYD Column */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/30">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <h2 className="text-white font-semibold">NS-HYD</h2>
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{hydOrders.length}</span>
            <span className="text-xs text-orange-400 ml-auto">{hydOrders.filter(o=>o.payment_status==="pending_verification").length} pending</span>
          </div>
          {hydOrders.length === 0
            ? <p className="text-gray-600 text-sm text-center py-8">No NS-HYD orders</p>
            : hydOrders.map(order => (
              <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                {...cardProps} />
            ))
          }
        </div>
      </div>

      {/* Other orders (no series) */}
      {otherOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D4AF37]/20">
            <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
            <h2 className="text-white font-semibold">Other Orders</h2>
            <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full">{otherOrders.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {otherOrders.map(order => (
              <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                {...cardProps} />
            ))}
          </div>
        </div>
      )}

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
