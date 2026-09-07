import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, AlertTriangle, Eye, Truck, Upload, Phone } from "lucide-react"
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

function StatusButton({ orderId, currentStatus, onStatusUpdate }) {
  const [loading, setLoading] = useState(false)
  const current = ORDER_STATUSES.find(s => s.key === currentStatus) || ORDER_STATUSES[0]

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) return
    setLoading(true)
    await onStatusUpdate(orderId, newStatus)
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ORDER_STATUSES.map(s => (
        <button
          key={s.key}
          onClick={() => handleChange(s.key)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            s.key === currentStatus ? s.color : "bg-white text-[#8F857A] border-[#E7DED1] hover:border-[#C8A23A]"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export default function AdminOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, loadOrders } = useAdminStore()
  const [order, setOrder] = useState(null)
  const [screenshotModal, setScreenshotModal] = useState(null)
  const [trackingId, setTrackingId] = useState("")
  const [trackingImage, setTrackingImage] = useState(null)
  const [trackingPreview, setTrackingPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orders.length) loadOrders()
  }, [])

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === parseInt(orderId))
    if (foundOrder) {
      setOrder(foundOrder)
      setTrackingId(foundOrder.tracking_id || "")
      setTrackingPreview(foundOrder.tracking_image_url || null)
    }
  }, [orderId, orders])

  const handleStatusUpdate = async (orderId, newStatus) => {
    const { error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: newStatus
    })

    if (error) {
      toast.error("Failed: " + error.message)
      return
    }

    setOrder(prev => ({ ...prev, order_status: newStatus }))
    useAdminStore.setState(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o)
    }))
    toast.success("Status updated to " + newStatus)
  }

  const verifyPayment = async () => {
    const { error } = await supabase.rpc("admin_verify_payment", { p_order_id: order.id })
    if (!error) {
      setOrder(prev => ({ ...prev, payment_status: "paid", payment_verified: true, order_status: "confirmed" }))
      useAdminStore.setState(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...o, payment_status: "paid", payment_verified: true, order_status: "confirmed" } : o)
      }))
      toast.success("Payment verified!")
    } else {
      toast.error(error.message)
    }
  }

  const rejectPayment = async () => {
    const { error } = await supabase.rpc("admin_reject_payment", { p_order_id: order.id })
    if (error) {
      toast.error(error.message)
      return
    }

    setOrder(prev => ({ ...prev, payment_status: "failed", order_status: "cancelled" }))
    useAdminStore.setState(s => ({
      orders: s.orders.map(o => o.id === order.id ? { ...o, payment_status: "failed", order_status: "cancelled" } : o)
    }))
    toast.success("Payment rejected")
  }

  const saveTracking = async () => {
    if (!trackingId.trim()) {
      toast.error("Tracking ID is required")
      return
    }
    setSaving(true)
    try {
      let imageUrl = order.tracking_image_url || null
      if (trackingImage) {
        const ext = trackingImage.name.split(".").pop()
        const path = `tracking/${order.id}_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, trackingImage, { contentType: trackingImage.type })
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
      
      setOrder(prev => ({ ...prev, tracking_id: trackingId.trim(), tracking_image_url: imageUrl }))
      toast.success("Tracking info saved")
    } catch (e) {
      toast.error(e.message || "Failed to save tracking")
    } finally {
      setSaving(false)
    }
  }

  const notifyCustomer = () => {
    const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
    const msg = encodeURIComponent(`*Order Update - Srividyardhi*\n\nHi ${addr.full_name || "Customer"},\nOrder ${order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()} status: ${order.order_status || "confirmed"}\nAmount: Rs.${order.total_amount?.toLocaleString("en-IN")}\n\nSrividyardhi`)
    const phone = addr.phone?.replace(/\D/g, "")
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else toast.error("No phone number")
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8A23A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8F857A]">Loading order details...</p>
        </div>
      </div>
    )
  }

  const addr = (() => { try { return typeof order.address === "object" ? order.address : JSON.parse(order.address) } catch { return {} } })()
  const needsVerification = order.payment_status === "pending_verification"
  const isCancelled = order.order_status === "cancelled"

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-[#8F857A] hover:text-[#2C241B] mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Orders
      Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C241B] mb-2">
              Order {order.display_order_id || "#" + String(order.id).slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-[#8F857A]">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#C8A23A]">{formatINR(order.total_amount)}</p>
          </div>
        </div>
      </div>

      {/* Payment Verification */}
      {needsVerification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-orange-900 mb-1">Payment Verification Required</h3>
              <p className="text-sm text-orange-700">Please review the payment screenshot and verify or reject this order.</p>
            </div>
          </div>

          {order.payment_screenshot_url && (
            <div className="mb-4">
              <img
                src={order.payment_screenshot_url}
                alt="Payment screenshot"
                className="w-full max-h-96 object-contain rounded-lg border-2 border-orange-300 bg-white cursor-pointer"
                onClick={() => setScreenshotModal(order.payment_screenshot_url)}
              />
            </div>
          )}

          {order.upi_ref && (
            <p className="text-sm text-[#8F857A] mb-4">
              UPI Ref: <span className="font-mono text-[#2C241B] font-semibold">{order.upi_ref}</span>
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={verifyPayment}
              className="flex-1 py-3 bg-green-500 border-2 border-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all shadow-sm"
            >
              ✅ Confirm Payment
            </button>
            <button
              onClick={rejectPayment}
              className="flex-1 py-3 bg-red-500 border-2 border-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-sm"
            >
              ❌ Reject Payment
            </button>
          </div>
        </motion.div>
      )}

      {/* Order Status */}
      {order.payment_status === "paid" && (
        <div className="bg-white border border-[#E7DED1] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-[#2C241B] mb-4">Order Status</h3>
          
          {/* Progress Tracker */}
          <div className="flex items-start gap-0 mb-6">
            {[
              { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
              { key: "shipping", label: "Shipped", color: "bg-orange-500" },
              { key: "delivered", label: "Delivered", color: "bg-green-500" },
            ].map((step, idx) => {
              const steps = ["confirmed", "shipping", "delivered"]
              const currentIdx = steps.indexOf(order.order_status || "confirmed")
              const done = idx <= currentIdx
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div className={`w-full h-1 rounded-full ${idx === 0 ? "opacity-0" : done ? step.color : "bg-[#E7DED1]"}`} />
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${done ? `${step.color} border-transparent text-white` : "border-[#E7DED1] bg-[#F3EEE6] text-[#8F857A]"}`}>
                      {idx + 1}
                    </div>
                    <div className={`w-full h-1 rounded-full ${idx === 2 ? "opacity-0" : done && idx < currentIdx ? step.color : "bg-[#E7DED1]"}`} />
                  </div>
                  <p className={`text-sm mt-2 text-center font-medium ${done ? "text-[#2C241B]" : "text-[#8F857A]"}`}>{step.label}</p>
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#E7DED1] pt-4">
            <p className="text-sm text-[#8F857A] mb-3">Change order status:</p>
            <StatusButton orderId={order.id} currentStatus={order.order_status || "confirmed"} onStatusUpdate={handleStatusUpdate} />
          </div>
        </div>
      )}

      {/* Tracking Info */}
      {order.order_status === "shipping" && (
        <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={20} className="text-orange-600" />
            <h3 className="text-lg font-bold text-orange-900">Tracking Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C241B] mb-2">Tracking ID *</label>
              <input
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID"
                className="w-full px-4 py-3 bg-white border-2 border-orange-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C241B] mb-2">Tracking Screenshot (Optional)</label>
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-500 transition-all bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setTrackingImage(file)
                      setTrackingPreview(URL.createObjectURL(file))
                    }
                  }}
                />
                <Upload size={20} className="text-orange-500" />
                <span className="text-sm text-orange-600 font-medium">
                  {trackingImage ? trackingImage.name : "Click to upload tracking screenshot"}
                </span>
              </label>
            </div>

            {trackingPreview && (
              <div className="relative inline-block">
                <img src={trackingPreview} alt="Tracking" className="h-32 rounded-lg border-2 border-orange-300" />
                <button
                  onClick={() => {
                    setTrackingImage(null)
                    setTrackingPreview(null)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={saveTracking}
              disabled={saving || !trackingId.trim()}
              className="w-full py-3 bg-orange-500 border-2 border-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save Tracking Info"}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        <div className="bg-white border border-[#E7DED1] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#2C241B] mb-4">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-[#8F857A]">Name:</span> <span className="font-medium text-[#2C241B]">{addr.full_name || "N/A"}</span></p>
            <p><span className="text-[#8F857A]">Phone:</span> <span className="font-medium text-[#2C241B]">{addr.phone || "N/A"}</span></p>
            <p><span className="text-[#8F857A]">Email:</span> <span className="font-medium text-[#2C241B]">{addr.email || "N/A"}</span></p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-[#E7DED1] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#2C241B] mb-4">Shipping Address</h3>
          <div className="text-sm text-[#2C241B]">
            <p className="font-medium">{addr.full_name}</p>
            <p className="text-[#8F857A] mt-2">
              {addr.address1}<br />
              {addr.address2 && <>{addr.address2}<br /></>}
              {addr.city}, {addr.state} - {addr.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-[#E7DED1] rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-[#2C241B] mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-[#F8F5F0] rounded-lg">
              {item.products?.images?.[0] && (
                <img
                  src={item.products.images[0]}
                  alt={item.products.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={e => e.target.style.display = "none"}
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-[#2C241B] mb-1">{item.products?.name}</h4>
                {item.products?.custom_id && (
                  <p className="text-xs text-[#C8A23A] font-mono mb-2">ID: {item.products.custom_id}</p>
                )}
                <p className="text-sm text-[#8F857A]">
                  Quantity: {item.quantity} × {formatINR(item.price)}
                </p>
                
                {/* Customization */}
                {(item.custom_name || item.custom_photo_url) && (
                  <div className="mt-3 pt-3 border-t border-[#E7DED1]">
                    <p className="text-xs font-semibold text-[#4DB6AC] mb-2">✨ Customization:</p>
                    {item.custom_name && (
                      <p className="text-sm text-[#2C241B] mb-2">
                        <span className="text-[#8F857A]">Text:</span> {item.custom_name}
                      </p>
                    )}
                    {item.custom_photo_url && (
                      <a href={item.custom_photo_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={item.custom_photo_url}
                          alt="Custom"
                          className="h-20 w-20 object-cover rounded border-2 border-[#4DB6AC]/40 hover:border-[#4DB6AC] transition-all cursor-pointer"
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-[#C8A23A]">{formatINR(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={notifyCustomer}
        className="w-full py-4 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <Phone size={18} />
        WhatsApp Customer
      </button>

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E7DED1]">
              <p className="text-[#C8A23A] font-medium">Payment Screenshot</p>
              <button
                onClick={() => setScreenshotModal(null)}
                className="text-[#8F857A] hover:text-[#2C241B] text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <img src={screenshotModal} alt="Payment screenshot" className="w-full max-h-[80vh] object-contain p-4" />
          </div>
        </div>
      )}
    </div>
  )
}
