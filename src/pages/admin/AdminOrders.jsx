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
            className="absolute top-full mt-1 right-0 z-20 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl min-w-[130px]"
          >
            {ORDER_STATUSES.map(s => (
              <button key={s.key} onClick={() => handleSelect(s.key)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${s.key === currentStatus ? "opacity-50 cursor-default" : ""}`}>
                <span className={`w-2 h-2 rounded-full border ${s.color}`} />
                <span className="text-gray-500">{s.label}</span>
                {s.key === currentStatus && <span className="ml-auto text-gray-500">✓</span>}
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
        className="w-full bg-white border-2 border-orange-300 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder-orange-300 focus:outline-none focus:border-orange-500 font-medium"
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
    return "border-gray-200"
  }

  const getStatusBadge = () => {
    if (needsVerification) return { label: "⚠ Verify", color: "bg-orange-500/20 text-orange-400" }
    if (isCancelled) return { label: "Cancelled", color: "bg-red-500 text-white" }
    if (order.payment_status === "failed") return { label: "Failed", color: "bg-red-500 text-white" }
    const s = order.order_status || "confirmed"
    if (s === "delivered") return { label: "Delivered", color: "bg-green-500 text-white" }
    if (s === "shipping") return { label: "Shipped", color: "bg-orange-500 text-white" }
    return { label: "Confirmed", color: "bg-blue-500/20 text-blue-400" }
  }

  const badge = getStatusBadge()

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">Order</span>
            <p className="text-[#1B2B5E] text-xs font-mono font-bold truncate">
              {order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()}
            </p>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{addr.full_name || "Customer"} &middot; {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-[#1B2B5E] text-xs font-semibold">{formatINR(order.total_amount)}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
            style={["Delivered", "Cancelled", "Failed"].includes(badge.label) ? { color: "#ffffff" } : undefined}
          >{badge.label}</span>
          {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-gray-200 p-3 space-y-3">
              {needsVerification && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-3">
                  <p className="text-orange-400 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12} /> Payment Verification Required</p>
                  {order.payment_screenshot_url && (
                    <div className="space-y-2">
                      <img
                        src={order.payment_screenshot_url}
                        alt="Payment screenshot"
                        className="w-full max-h-48 object-contain rounded-lg border border-orange-500/20 bg-white cursor-pointer"
                        onClick={() => onScreenshot(order.payment_screenshot_url)}
                      />
                      <button onClick={() => onScreenshot(order.payment_screenshot_url)}
                        className="flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200">
                        <Eye size={11} /> View Full Screenshot
                      </button>
                    </div>
                  )}
                  {order.upi_ref && <p className="text-gray-500 text-xs">UPI Ref: <span className="font-mono text-[#1A1A2E]">{order.upi_ref}</span></p>}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onVerify(order.id)}
                      className="py-2.5 bg-green-500 border border-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm">
                      ✅ Confirm Payment
                    </button>
                    <button onClick={() => onReject(order.id)}
                      className="py-2.5 bg-red-500 border border-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-all shadow-sm">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}

              {order.payment_status === "paid" && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-[#1A1A2E] text-xs font-semibold">Order Status</p>
                  {/* Colorful step tracker — same as user panel */}
                  <div className="flex items-start gap-0 mb-2">
                    {[
                      { key: "confirmed", label: "Confirmed", activeColor: "bg-blue-500", doneColor: "bg-blue-500", lineColor: "bg-blue-400", textColor: "text-blue-500" },
                      { key: "shipping",  label: "Shipped",   activeColor: "bg-orange-500", doneColor: "bg-orange-500", lineColor: "bg-orange-400", textColor: "text-orange-500" },
                      { key: "delivered", label: "Delivered", activeColor: "bg-green-500", doneColor: "bg-green-500", lineColor: "bg-green-400", textColor: "text-green-500" },
                    ].map((step, idx) => {
                      const steps = ["confirmed","shipping","delivered"]
                      const currentIdx = steps.indexOf(order.order_status || "confirmed")
                      const done = idx <= currentIdx
                      const active = idx === currentIdx
                      return (
                        <div key={step.key} className="flex-1 flex flex-col items-center">
                          <div className="flex items-center w-full">
                            <div className={`w-full h-1 rounded-full ${idx === 0 ? "opacity-0" : done ? (idx === 1 ? "bg-blue-400" : "bg-orange-400") : "bg-gray-200"}`} />
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all shadow-sm ${done || active ? `${step.activeColor} border-transparent` : "border-gray-200 bg-gray-100"}`}>
                              {step.key === "confirmed" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 ${done || active ? "text-white" : "text-gray-400"}`}><polyline points="20 6 9 17 4 12"/></svg>}
                              {step.key === "shipping" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 ${done || active ? "text-white" : "text-gray-400"}`}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
                              {step.key === "delivered" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 ${done || active ? "text-white" : "text-gray-400"}`}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                            </div>
                            <div className={`w-full h-1 rounded-full ${idx === 2 ? "opacity-0" : done && idx < currentIdx ? step.lineColor : "bg-gray-200"}`} />
                          </div>
                          <p className={`text-xs mt-1.5 text-center font-medium ${active ? step.textColor : done ? step.textColor + " opacity-70" : "text-gray-400"}`}>{step.label}</p>
                        </div>
                      )
                    })}
                  </div>
                  {/* Status dropdown to change */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-gray-400 text-xs">Change status:</span>
                    <StatusDropdown orderId={order.id} currentStatus={order.order_status || "confirmed"} onStatusUpdate={onStatusUpdate} />
                  </div>
                </div>
              )}

              {/* Tracking panel - shown when order is shipping */}
              {order.order_status === "shipping" && (
                <TrackingPanel order={order} onSave={onTrackingSave} />
              )}

              <div className="space-y-1">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded p-1.5">
                    {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-7 h-7 object-cover rounded" onError={e=>{e.target.style.display="none"}} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A1A2E] text-xs truncate">{item.products?.name}</p>
                      {item.products?.custom_id && (
                        <p className="text-[#1B2B5E] text-xs font-mono">Product ID: {item.products.custom_id}</p>
                      )}
                      <p className="text-gray-500 text-xs">x{item.quantity} &middot; {formatINR(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {addr.full_name && (
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-400">
                  <p className="text-[#1A1A2E]">{addr.full_name} &middot; {addr.phone}</p>
                  <p>{addr.address1}, {addr.city} &middot; {addr.pincode}</p>
                </div>
              )}
              <button onClick={() => onNotify(order, addr)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#1ebe5d] transition-all shadow-sm">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Customer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Pagination({ total, page, pageSize, onPage, onPageSize, pageSizeOptions }) {
  const totalPages = pageSize === 9999 ? 1 : Math.ceil(total / pageSize)
  const showingText = pageSize === 9999
    ? `Showing all ${total}`
    : `Showing ${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500">{showingText}</p>
        <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))}
          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]">
          {pageSizeOptions.map(n => <option key={n} value={n}>{n === 9999 ? "All" : n}</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => onPage(page - 1)} disabled={page === 1}
            className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:border-[#1B2B5E] disabled:opacity-40">‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => onPage(p)}
              className={`px-2.5 py-1 text-xs rounded border transition-all ${p === page ? "bg-[#1B2B5E] text-white border-[#1B2B5E]" : "border-gray-200 text-gray-500 hover:border-[#1B2B5E]"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
            className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:border-[#1B2B5E] disabled:opacity-40">›</button>
        </div>
      )}
    </div>
  )
}

function paginate(arr, page, size) {
  const start = (page - 1) * size
  return arr.slice(start, start + size)
}

export default function AdminOrders() {
  const { orders, loadOrders } = useAdminStore()
  const [localOrders, setLocalOrders] = useState([])
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState(null)
  const [screenshotModal, setScreenshotModal] = useState(null)
  const [searchParams] = useSearchParams()
  const filterToday = searchParams.get("filter") === "today"

  // Pagination
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 9999]
  const [pageSize, setPageSize] = useState(10)
  const [ns0Page, setNs0Page] = useState(1)
  const [ns1Page, setNs1Page] = useState(1)
  const [otherPage, setOtherPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)

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
          `*Order Cancelled - NaShe Jewels*\n\nHi ${customerName},\n\nYour order *${orderId_}* has been cancelled.\nAmount: ${amount}\n\nIf you paid, your refund will be processed within 5-7 business days.\n\nFor queries: +91 8639006849\n\nNaShe Jewels`
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
          `*Order Rejected - NaShe Jewels*\n\nHi ${customerName},\n\nYour order *${orderId_}* has been rejected due to payment verification failure.\nAmount: ${amount}\n\nIf you believe this is an error, contact us at +91 8639006849.\n\nNaShe Jewels`
        )
        window.open(`https://wa.me/91${phone}?text=${waMsg}`, "_blank")
      }
    }
  }

  const notifyCustomer = (order, addr) => {
    const msg = encodeURIComponent(`*Order Update - NaShe Jewels*\n\nHi ${addr.full_name || "Customer"},\nOrder ${order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()} status: ${order.order_status || "confirmed"}\nAmount: Rs.${order.total_amount?.toLocaleString("en-IN")}\n\nNaShe Jewels`)
    const phone = addr.phone?.replace(/\D/g, "")
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else toast.error("No phone number")
  }

  const handleTrackingSave = (orderId, data) => {
    setLocalOrders(p => p.map(o => o.id === orderId ? { ...o, ...data } : o))
  }

  const q = search.toLowerCase().trim()

  const filtered = localOrders.filter(o => {
    if (!q) return true
    const id = (o.display_order_id || "").toLowerCase()
    const addr = (() => { try { return typeof o.address === "object" ? o.address : JSON.parse(o.address) } catch { return {} } })()
    const name = (addr.full_name || "").toLowerCase()
    const phone = (addr.phone || "").toLowerCase()
    return id.includes(q) || String(o.id).toLowerCase().includes(q) || name.includes(q) || phone.includes(q)
  })

  const isNS0 = (o) => (o.order_series || o.display_order_id || "").toUpperCase().startsWith("NS0")
  const isNS1 = (o) => (o.order_series || o.display_order_id || "").toUpperCase().startsWith("NS1")

  const ns0Orders = localOrders.filter(isNS0)
  const ns1Orders = localOrders.filter(isNS1)
  const otherOrders = localOrders.filter(o => !isNS0(o) && !isNS1(o))

  const cardProps = { onStatusUpdate: handleStatusUpdate, onVerify: verifyPayment, onReject: rejectPayment, onNotify: notifyCustomer, onScreenshot: setScreenshotModal, onTrackingSave: handleTrackingSave }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>
            {filterToday ? "Today's Orders" : "Orders"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{localOrders.length} total &middot; {localOrders.filter(o => o.payment_status === "pending_verification").length} awaiting verification</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => { setSearch(e.target.value); setSearchPage(1) }} placeholder="Search by Order ID (e.g. NS0-001)"
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-600 focus:outline-none focus:border-[#1B2B5E]" />
      </div>

      {/* Search results - flat list with pagination */}
      {q && (
        <div>
          <p className="text-gray-500 text-xs mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;</p>
          {filtered.length === 0
            ? <p className="text-gray-600 text-sm text-center py-12">No orders found</p>
            : paginate(filtered, searchPage, pageSize).map(order => (
              <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                {...cardProps} />
            ))
          }
          <Pagination total={filtered.length} page={searchPage} pageSize={pageSize} onPage={setSearchPage}
            onPageSize={n => { setPageSize(n); setSearchPage(1) }} pageSizeOptions={PAGE_SIZE_OPTIONS} />
        </div>
      )}

      {/* Normal two-column layout */}
      {!q && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NS0 - Home */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/30">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h2 className="text-[#1B2B5E] font-semibold">NS0 — Home</h2>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{ns0Orders.length}</span>
                <span className="text-xs text-orange-400 ml-auto">{ns0Orders.filter(o=>o.payment_status==="pending_verification").length} pending</span>
              </div>
              {ns0Orders.length === 0
                ? <p className="text-gray-600 text-sm text-center py-8">No NS0 orders</p>
                : paginate(ns0Orders, ns0Page, pageSize).map(order => (
                  <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    {...cardProps} />
                ))
              }
              <Pagination total={ns0Orders.length} page={ns0Page} pageSize={pageSize} onPage={setNs0Page}
                onPageSize={n => { setPageSize(n); setNs0Page(1); setNs1Page(1) }} pageSizeOptions={PAGE_SIZE_OPTIONS} />
            </div>

            {/* NS1 - HYD */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/30">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <h2 className="text-[#1B2B5E] font-semibold">NS1 — HYD</h2>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{ns1Orders.length}</span>
                <span className="text-xs text-orange-400 ml-auto">{ns1Orders.filter(o=>o.payment_status==="pending_verification").length} pending</span>
              </div>
              {ns1Orders.length === 0
                ? <p className="text-gray-600 text-sm text-center py-8">No NS1 orders</p>
                : paginate(ns1Orders, ns1Page, pageSize).map(order => (
                  <OrderCard key={order.id} order={order} expanded={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    {...cardProps} />
                ))
              }
              <Pagination total={ns1Orders.length} page={ns1Page} pageSize={pageSize} onPage={setNs1Page}
                onPageSize={n => { setPageSize(n); setNs0Page(1); setNs1Page(1) }} pageSizeOptions={PAGE_SIZE_OPTIONS} />
            </div>
          </div>
        </>
      )}

      {/* Screenshot modal */}
      <AnimatePresence>
        {screenshotModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setScreenshotModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-lg w-full bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <p className="text-[#1B2B5E] font-medium">Payment Screenshot</p>
                <button onClick={() => setScreenshotModal(null)} className="text-gray-400 hover:text-[#1A1A2E]">&times;</button>
              </div>
              <img src={screenshotModal} alt="Payment screenshot" className="w-full max-h-[70vh] object-contain p-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
