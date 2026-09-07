import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, ChevronUp, AlertTriangle, Eye, Truck, Upload } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { formatINR, formatDate } from "../../utils/format"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const ORDER_STATUSES = [
  { key: "confirmed", label: "Confirmed", color: "bg-blue-500 text-white border-blue-600" },
  { key: "shipping", label: "Shipped", color: "bg-orange-500 text-white border-orange-600" },
  { key: "delivered", label: "Delivered", color: "bg-green-500 text-white border-green-600" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-500 text-white border-red-600" },
]

function StatusDropdown({ orderId, currentStatus, onStatusUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const current = ORDER_STATUSES.find(s => s.key === currentStatus) || ORDER_STATUSES[0]

  const handleSelect = async (statusKey) => {
    if (statusKey === currentStatus) { setOpen(false); return }
    setLoading(true)
    await onStatusUpdate(orderId, statusKey)
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${current.color} hover:opacity-80`}
      >
        {loading ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : null}
        {current.label}
        <ChevronDown size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 right-0 z-20 bg-white border border-[#E7DED1] rounded-xl overflow-hidden shadow-xl min-w-[130px]"
          >
            {ORDER_STATUSES.map(s => (
              <button key={s.key} onClick={() => handleSelect(s.key)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#F8F5F0] transition-colors ${s.key === currentStatus ? "opacity-50 cursor-default" : ""}`}>
                <span className={`w-2 h-2 rounded-full border ${s.color}`} />
                <span className="text-[#8F857A]">{s.label}</span>
                {s.key === currentStatus && <span className="ml-auto text-[#8F857A]">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  )
}

function TrackingPanel({ order, onSave }) {
  const [trackingId, setTrackingId] = useState(order.tracking_id || "")
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(order.tracking_image_url || null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!trackingId.trim()) { toast.error("Tracking ID is required before saving"); return }
    setSaving(true)
    try {
      let imageUrl = order.tracking_image_url || null
      if (image) {
        const ext = image.name.split(".").pop()
        const path = `tracking/${order.id}_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, image, { contentType: image.type })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
      const { error } = await supabase.from("orders").update({
        tracking_id: trackingId.trim() || null,
        tracking_image_url: imageUrl,
        tracking_updated_at: new Date().toISOString(),
      }).eq("id", order.id)
      if (error) throw error
      onSave(order.id, { tracking_id: trackingId.trim() || null, tracking_image_url: imageUrl })
      toast.success("Tracking info saved")
    } catch (e) {
      toast.error(e.message || "Failed to save tracking")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 space-y-3">
      <p className="text-orange-600 text-sm font-bold flex items-center gap-2">
        <Truck size={16} className="text-orange-500" /> Tracking Info
      </p>
      <input
        value={trackingId}
        onChange={e => setTrackingId(e.target.value)}
        placeholder="Tracking ID (required)"
        required
        className="w-full bg-white border-2 border-orange-300 rounded-lg px-3 py-2.5 text-sm text-[#2C241B] placeholder-orange-300 focus:outline-none focus:border-orange-500 font-medium"
      />
      <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-lg cursor-pointer transition-all bg-white">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <Upload size={14} className="text-orange-500 flex-shrink-0" />
        <span className="text-sm text-orange-500 font-medium">{image ? image.name : "Upload tracking screenshot (optional)"}</span>
      </label>
      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="Tracking" className="h-24 rounded-lg border-2 border-orange-300 object-cover" />
          <button onClick={() => { setImage(null); setPreview(null) }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">×</button>
        </div>
      )}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 bg-orange-500 border-2 border-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all">
        {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saving ? "Saving..." : "Save Tracking Info"}
      </button>
    </div>
  )
}

function OrderCard({ order, expanded, onToggle, onStatusUpdate, onVerify, onReject, onNotify, onScreenshot, onTrackingSave }) {
  const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
  const isCancelled = order.order_status === "cancelled"
  const needsVerification = order.payment_status === "pending_verification"

  const getStatusColor = () => {
    if (needsVerification) return "border-orange-500/40 bg-orange-500/5"
    if (isCancelled) return "border-red-500/20"
    if (order.payment_status === "paid") return "border-green-500/20"
    return "border-[#E7DED1]"
  }

  const getPaymentBadge = () => {
    if (needsVerification) return { label: "⚠ Verify", color: "bg-orange-100 text-orange-600" }
    if (order.payment_status === "paid") return { label: "✓ Verified", color: "bg-green-500 text-white" }
    if (order.payment_status === "failed") return { label: "Failed", color: "bg-red-500 text-white" }
    return { label: "Pending", color: "bg-gray-100 text-gray-600" }
  }

  const paymentBadge = getPaymentBadge()

  return (
    <div className={`border rounded-xl overflow-hidden bg-white ${getStatusColor()} cursor-pointer hover:shadow-lg transition-all`}
      onClick={() => window.location.href = `/admin/orders/${order.id}`}
    >
      {/* Card Header - Table Row */}
      <div className="hover:bg-[#F8F5F0] transition-colors">
        {/* Mobile Layout */}
        <div className="md:hidden p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#8F857A]">Order</span>
                <span className="text-xs text-[#C8A23A] font-mono font-bold">
                  {order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-[#2C241B] truncate">{addr.full_name || "Customer"}</p>
              <p className="text-xs text-[#8F857A] mt-0.5">{addr.phone}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-bold text-[#C8A23A]">{formatINR(order.total_amount)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentBadge.color}`}>
                {paymentBadge.label}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8F857A]">{formatDate(order.created_at)}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentBadge.color}`}>
                {paymentBadge.label}
              </span>
              <StatusDropdown orderId={order.id} currentStatus={order.order_status || "confirmed"} onStatusUpdate={onStatusUpdate} />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Table Row */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-6 px-6 py-5 items-center">
          {/* Customer Column */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#2C241B] truncate mb-1">{addr.full_name || "Customer"}</p>
            <p className="text-xs text-[#8F857A] truncate">{addr.phone}</p>
            <p className="text-xs text-[#C8A23A] font-mono mt-1">
              {order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()}
            </p>
          </div>

          {/* Date Column */}
          <div>
            <p className="text-sm font-medium text-[#2C241B]">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-xs text-[#8F857A] mt-0.5">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Amount Column */}
          <div>
            <p className="text-sm font-bold text-[#C8A23A]">{formatINR(order.total_amount)}</p>
          </div>

          {/* Payment Column */}
          <div>
            <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-semibold ${paymentBadge.color}`}>
              {paymentBadge.label}
            </span>
          </div>

          {/* Status Column */}
          <div className="flex items-center justify-between gap-3">
            <StatusDropdown orderId={order.id} currentStatus={order.order_status || "confirmed"} onStatusUpdate={onStatusUpdate} />
          </div>
        </div>
      </div>
    </div>
  )
}

function paginate(arr, page, size) {
  if (size === 9999) return arr
  const start = (page - 1) * size
  return arr.slice(start, start + size)
}

export default function AdminOrders() {
  const { orders, loadOrders } = useAdminStore()
  const [localOrders, setLocalOrders] = useState([])
  const [search, setSearch] = useState("")
  const [searchParams] = useSearchParams()
  const filterToday = searchParams.get("filter") === "today"
  const [statusFilter, setStatusFilter] = useState("all") // all, pending_verification, confirmed, shipping, delivered, cancelled

  // Pagination
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 9999]
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { loadOrders() }, [])
  useEffect(() => {
    if (!orders.length) return
    if (filterToday) {
      const today = new Date().toDateString()
      setLocalOrders(orders.filter(o => new Date(o.created_at).toDateString() === today))
    } else {
      setLocalOrders(orders)
    }
  }, [orders, filterToday])

  const handleStatusUpdate = async (orderId, newStatus) => {
    const order = localOrders.find(o => o.id === orderId)
    const { error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: newStatus
    })

    if (error) { toast.error("Failed: " + error.message); return }

    setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
    // Sync store so navigating away and back doesn't show stale data
    useAdminStore.setState(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o)
    }))
    toast.success("Status updated to " + newStatus)

    // When admin cancels — notify customer via WhatsApp
    if (newStatus === "cancelled" && order) {
      const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
      const orderId_ = order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()
      const customerName = addr.full_name || "Customer"
      const amount = `₹${order.total_amount?.toLocaleString("en-IN")}`
      const phone = addr.phone?.replace(/\D/g, "")
      if (phone) {
        const waMsg = encodeURIComponent(
          `*Order Cancelled - Vidhyrathi*\n\nHi ${customerName},\n\nYour order *${orderId_}* has been cancelled.\nAmount: ${amount}\n\nIf you paid, your refund will be processed within 5-7 business days.\n\nFor queries: +91 1234567870\n\nVidhyrathi`
        )
        window.open(`https://wa.me/91${phone}?text=${waMsg}`, "_blank")
      } else {
        toast("No phone number found for customer", { icon: "⚠️" })
      }
    }
  }

  const verifyPayment = async (orderId) => {
    const { error } = await supabase.rpc("admin_verify_payment", { p_order_id: orderId })
    if (!error) {
      setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, payment_status: "paid", payment_verified: true, order_status: "confirmed" } : o))
      useAdminStore.setState(s => ({
        orders: s.orders.map(o => o.id === orderId ? { ...o, payment_status: "paid", payment_verified: true, order_status: "confirmed" } : o)
      }))
      toast.success("Payment verified!")
    } else {
      toast.error(error.message)
    }
  }

  const rejectPayment = async (orderId) => {
    const order = localOrders.find(o => o.id === orderId)
    const { error } = await supabase.rpc("admin_reject_payment", { p_order_id: orderId })
    if (error) { toast.error(error.message); return }

    setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, payment_status: "failed", order_status: "cancelled" } : o))
    useAdminStore.setState(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, payment_status: "failed", order_status: "cancelled" } : o)
    }))
    toast.success("Payment rejected")

    // Notify customer via WhatsApp
    if (order) {
      const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
      const orderId_ = order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()
      const customerName = addr.full_name || "Customer"
      const amount = `₹${order.total_amount?.toLocaleString("en-IN")}`
      const phone = addr.phone?.replace(/\D/g, "")
      if (phone) {
        const waMsg = encodeURIComponent(
          `*Order Rejected - Vidhyrathi*\n\nHi ${customerName},\n\nYour order *${orderId_}* has been rejected due to payment verification failure.\nAmount: ${amount}\n\nIf you believe this is an error, contact us at +91 1234567870.\n\nVidhyrathi`
        )
        window.open(`https://wa.me/91${phone}?text=${waMsg}`, "_blank")
      }
    }
  }

  const notifyCustomer = (order, addr) => {
    const msg = encodeURIComponent(`*Order Update - Vidhyrathi*\n\nHi ${addr.full_name || "Customer"},\nOrder ${order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()} status: ${order.order_status || "confirmed"}\nAmount: Rs.${order.total_amount?.toLocaleString("en-IN")}\n\nVidhyrathi`)
    const phone = addr.phone?.replace(/\D/g, "")
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else toast.error("No phone number")
  }

  const handleTrackingSave = (orderId, data) => {
    setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, ...data } : o))
  }

  const q = search.toLowerCase().trim()

  // Apply filters
  let filtered = localOrders.filter(o => {
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "pending_verification" && o.payment_status !== "pending_verification") return false
      if (statusFilter === "confirmed" && o.order_status !== "confirmed") return false
      if (statusFilter === "shipping" && o.order_status !== "shipping") return false
      if (statusFilter === "delivered" && o.order_status !== "delivered") return false
      if (statusFilter === "cancelled" && o.order_status !== "cancelled") return false
    }
    
    // Search filter
    if (!q) return true
    const id = (o.display_order_id || "").toLowerCase()
    const addr = (() => { try { return typeof o.address === "object" ? o.address : JSON.parse(o.address) } catch { return {} } })()
    const name = (addr.full_name || "").toLowerCase()
    const phone = (addr.phone || "").toLowerCase()
    return id.includes(q) || String(o.id).toLowerCase().includes(q) || name.includes(q) || phone.includes(q)
  })

  // Count by status
  const pendingCount = localOrders.filter(o => o.payment_status === "pending_verification").length
  const confirmedCount = localOrders.filter(o => o.order_status === "confirmed" && o.payment_status === "paid").length
  const shippedCount = localOrders.filter(o => o.order_status === "shipping").length
  const deliveredCount = localOrders.filter(o => o.order_status === "delivered").length
  const cancelledCount = localOrders.filter(o => o.order_status === "cancelled").length

  const cardProps = { onStatusUpdate: handleStatusUpdate, onVerify: verifyPayment, onReject: rejectPayment, onNotify: notifyCustomer, onScreenshot: setScreenshotModal, onTrackingSave: handleTrackingSave }

  // Paginate filtered results
  const paginatedOrders = paginate(filtered, currentPage, pageSize)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C241B] mb-2">Orders</h1>
          <p className="text-sm text-[#8F857A]">
            {localOrders.length} total orders · {pendingCount} awaiting verification
          </p>
        </div>
        <button 
          onClick={() => loadOrders()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#8F857A] hover:text-[#2C241B] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8F857A]" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder="Search by name, phone, order ID..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E7DED1] rounded-xl text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A] transition-colors"
        />
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="mb-8">
        <div className="border-b border-[#E7DED1]">
          <div className="flex gap-4 overflow-x-auto pb-px">
            <button
              onClick={() => { setStatusFilter("all"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                statusFilter === "all"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => { setStatusFilter("pending_verification"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                statusFilter === "pending_verification"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              Pending <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{pendingCount}</span>
            </button>
            <button
              onClick={() => { setStatusFilter("confirmed"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                statusFilter === "confirmed"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              Confirmed <span className="bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{confirmedCount}</span>
            </button>
            <button
              onClick={() => { setStatusFilter("shipping"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                statusFilter === "shipping"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              Shipped <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{shippedCount}</span>
            </button>
            <button
              onClick={() => { setStatusFilter("delivered"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                statusFilter === "delivered"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              Delivered <span className="bg-green-100 text-green-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{deliveredCount}</span>
            </button>
            <button
              onClick={() => { setStatusFilter("cancelled"); setCurrentPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                statusFilter === "cancelled"
                  ? "text-[#C8A23A] border-[#C8A23A]"
                  : "text-[#8F857A] border-transparent hover:text-[#2C241B]"
              }`}
            >
              Cancelled <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{cancelledCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Header (Desktop) ── */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-6 px-6 py-4 bg-[#F8F5F0] rounded-lg mb-3 text-xs font-semibold text-[#8F857A] uppercase tracking-wider">
        <div>Customer</div>
        <div>Date</div>
        <div>Amount</div>
        <div>Payment</div>
        <div>Status</div>
      </div>

      {/* ── Orders List ── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8F857A]">
            <p className="text-lg">No orders found</p>
          </div>
        ) : (
          paginatedOrders.map(order => (
            <OrderCard key={order.id} order={order} expanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              {...cardProps} />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#8F857A]">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <select 
              value={pageSize} 
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
              className="bg-white border border-[#E7DED1] rounded-lg px-3 py-1.5 text-sm text-[#2C241B] focus:outline-none focus:border-[#C8A23A]"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n === 9999 ? "All" : n}</option>
              ))}
            </select>
          </div>
          
          {Math.ceil(filtered.length / pageSize) > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-[#E7DED1] rounded-lg bg-white text-[#8F857A] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(filtered.length / pageSize) }, (_, i) => i + 1)
                .filter(p => {
                  // Show first, last, current, and neighbors
                  const totalPages = Math.ceil(filtered.length / pageSize)
                  return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                })
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`ellipsis-${p}`} className="px-2 text-[#8F857A]">...</span>}
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-all ${
                        p === currentPage
                          ? "bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white border-[#C8A23A]"
                          : "bg-white text-[#8F857A] border-[#E7DED1] hover:bg-[#F8F5F0]"
                      }`}
                    >
                      {p}
                    </button>
                  </>
                ))
              }
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === Math.ceil(filtered.length / pageSize)}
                className="px-3 py-1.5 text-sm border border-[#E7DED1] rounded-lg bg-white text-[#8F857A] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {
    </div>
  )
}


