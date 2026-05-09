import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Plus, Check, CheckCircle, Upload, Copy, Smartphone, AlertCircle, Loader2 } from "lucide-react"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { saveOrder } from "../services/orderService"
import { fetchAddresses, saveAddress } from "../services/addressService"
import { supabase } from "../lib/supabase"
import { formatINR } from "../utils/format"
import toast from "react-hot-toast"

const UPI_ID = "Q487529392@ybl"
const ADMIN_WHATSAPP = "918639006849"
// Generate QR dynamically from UPI ID using Google Charts API
const getQRUrl = (upiId, amount) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=NaShe+Jewels&am=${amount}&cu=INR&tn=NaShe+Jewels+Order`)}`

const EMPTY_ADDR = { label: "Home", full_name: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "", is_default: false }

function NewAddressForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_ADDR)
  const [errors, setErrors] = useState({})
  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = "Required"
    if (!form.phone.match(/^\d{10}$/)) e.phone = "10-digit number"
    if (!form.address1.trim()) e.address1 = "Required"
    if (!form.city.trim()) e.city = "Required"
    if (!form.state.trim()) e.state = "Required"
    if (!form.pincode.match(/^\d{6}$/)) e.pincode = "6-digit PIN"
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form) }
  const inp = "w-full bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
  const lbl = "text-xs text-gray-400 mb-1 block"
  return (
    <form onSubmit={handleSubmit} className="border border-[#D4AF37]/20 rounded-xl p-4 bg-[#1A1A1A] space-y-3">
      <div className="flex gap-2 mb-1">
        {["Home","Work","Other"].map(l => (
          <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.label === l ? "bg-[#D4AF37] text-black" : "bg-[#222] text-gray-400 border border-[#D4AF37]/20"}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className={lbl}>Full Name *</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="Your name" className={inp} />{errors.full_name&&<p className="text-red-400 text-xs mt-0.5">{errors.full_name}</p>}</div>
        <div><label className={lbl}>Phone *</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="10-digit number" className={inp} />{errors.phone&&<p className="text-red-400 text-xs mt-0.5">{errors.phone}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 1 *</label><input value={form.address1} onChange={e=>setForm(f=>({...f,address1:e.target.value}))} placeholder="House/Flat, Street" className={inp} />{errors.address1&&<p className="text-red-400 text-xs mt-0.5">{errors.address1}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 2</label><input value={form.address2} onChange={e=>setForm(f=>({...f,address2:e.target.value}))} placeholder="Landmark (optional)" className={inp} /></div>
        <div><label className={lbl}>City *</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="City" className={inp} />{errors.city&&<p className="text-red-400 text-xs mt-0.5">{errors.city}</p>}</div>
        <div><label className={lbl}>State *</label><input value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} placeholder="State" className={inp} />{errors.state&&<p className="text-red-400 text-xs mt-0.5">{errors.state}</p>}</div>
        <div><label className={lbl}>PIN Code *</label><input value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value}))} placeholder="6-digit PIN" className={inp} />{errors.pincode&&<p className="text-red-400 text-xs mt-0.5">{errors.pincode}</p>}</div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-[#D4AF37]" />
        Save as default address
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-[#D4AF37]/20 text-gray-400 rounded-lg text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg text-sm hover:bg-[#F0D060] disabled:opacity-60">Save & Use</button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const total = getTotal()
  const fileRef = useRef(null)

  const [addresses, setAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState("address") // address | payment | success
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [upiRef, setUpiRef] = useState("")
  const [orderSeries, setOrderSeries] = useState("NS0")
  const [submitting, setSubmitting] = useState(false)
  const [savingAddr, setSavingAddr] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAddresses(user.id).then(addrs => {
        setAddresses(addrs)
        const def = addrs.find(a => a.is_default) || addrs[0]
        if (def) setSelectedId(def.id)
        if (addrs.length === 0) setShowNewForm(true)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [user])

  const handleSaveNew = async (form) => {
    setSavingAddr(true)
    try {
      const newAddr = await saveAddress(user.id, form)
      const updated = form.is_default ? [newAddr, ...addresses.map(a => ({ ...a, is_default: false }))] : [...addresses, newAddr]
      setAddresses(updated)
      setSelectedId(newAddr.id)
      setShowNewForm(false)
      toast.success("Address saved")
    } catch (e) { toast.error(e.message || "Failed") }
    finally { setSavingAddr(false) }
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  const handleSubmitOrder = async () => {
    if (!screenshot) { toast.error("Please upload payment screenshot"); return }
    const addr = addresses.find(a => a.id === selectedId)
    if (!addr) { toast.error("Please select delivery address"); return }
    setSubmitting(true)
    try {
      // Upload screenshot to Supabase Storage (product-images bucket is public)
      const ext = screenshot.name.split(".").pop()
      const path = `payment-screenshots/${user.id}_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, screenshot, { contentType: screenshot.type })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)

      // Split items by series based on admin-assigned custom_id prefix
      // NS1-xxx = HYD series, NS0-xxx (or anything else) = Home series
      const ns1Items = items.filter(i =>
        (i.products?.custom_id || "").toUpperCase().startsWith("NS1")
      )
      const ns0Items = items.filter(i => !ns1Items.includes(i))

      // Build list of [series, itemsForSeries] pairs — skip empty
      const orderGroups = []
      if (ns0Items.length > 0) orderGroups.push(["NS0", ns0Items])
      if (ns1Items.length > 0) orderGroups.push(["NS1", ns1Items])
      if (orderGroups.length === 0) orderGroups.push(["NS0", items]) // fallback

      const createdOrderIds = []

      for (const [series, groupItems] of orderGroups) {
        const groupTotal = groupItems.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)

        // Generate sequential order ID: NS0-001, NS0-002 / NS1-001, NS1-002
        const { data: seqData, error: seqErr } = await supabase.rpc("get_next_series_number", { p_series: series })
        if (seqErr) throw seqErr
        const displayOrderId = `${series}-${String(seqData).padStart(3, "0")}`

        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          user_id: user.id,
          total_amount: groupTotal,
          payment_status: "pending_verification",
          payment_method: "upi",
          payment_screenshot_url: urlData.publicUrl,
          upi_ref: upiRef.trim(),
          address: JSON.stringify(addr),
          order_status: "pending",
          order_series: series,
          display_order_id: displayOrderId,
        }).select().single()
        if (orderErr) throw orderErr

        const orderItems = groupItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0,
        }))
        await supabase.from("order_items").insert(orderItems)
        createdOrderIds.push(displayOrderId)
      }

      const displayOrderId = createdOrderIds.join(" + ")

      // Clear cart
      await clearCart(user.id)

      // Send WhatsApp notification to admin
      const itemsList = items.map(i => `${i.products?.name} x${i.quantity}`).join(", ")
      const msg = encodeURIComponent(
        `🛍️ *New Order Received!*\n\n` +
        `Order ID: ${displayOrderId}\n` +
        `Customer: ${addr.full_name}\n` +
        `Phone: ${addr.phone}\n` +
        `Amount: ₹${total.toLocaleString("en-IN")}\n` +
        `Items: ${itemsList}\n` +
        `Address: ${addr.address1}, ${addr.city}, ${addr.state} - ${addr.pincode}\n` +
        `UPI Ref: ${upiRef || "Not provided"}\n\n` +
        `Please verify payment screenshot in admin panel.`
      )
      window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, "_blank")

      setStep("success")
      toast.success("Order placed! Awaiting payment verification.")
    } catch (e) {
      toast.error(e.message || "Failed to place order")
    } finally { setSubmitting(false) }
  }

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>Order Placed!</h2>
        <p className="text-gray-400 mb-2">Your order is pending payment verification.</p>
        <p className="text-gray-500 text-sm mb-8">We will confirm your order once payment is verified. You will be notified.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F0D060] transition-all">View Orders</button>
          <button onClick={() => navigate("/")} className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-all">Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "Georgia, serif" }}>Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["address","payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (s === "address" && step === "payment") ? "bg-[#D4AF37] text-black" : "bg-[#1A1A1A] text-gray-500 border border-[#D4AF37]/20"}`}>
              {i + 1}
            </div>
            <span className={`text-sm capitalize ${step === s ? "text-white" : "text-gray-500"}`}>{s === "address" ? "Delivery Address" : "Payment"}</span>
            {i === 0 && <div className="w-8 h-px bg-[#D4AF37]/20 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {step === "address" && (
            <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2"><MapPin size={16} className="text-[#D4AF37]" /> Delivery Address</h2>
                {!showNewForm && <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1 text-xs text-[#D4AF37]"><Plus size={13} /> Add New</button>}
              </div>
              {loading ? <div className="h-20 bg-[#1A1A1A] rounded-xl animate-pulse" /> : (
                <div className="space-y-3">
                  {showNewForm && <NewAddressForm onSave={handleSaveNew} onCancel={() => addresses.length > 0 && setShowNewForm(false)} saving={savingAddr} />}
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => { setSelectedId(addr.id); setShowNewForm(false) }}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedId === addr.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#D4AF37]/10 bg-[#1A1A1A] hover:border-[#D4AF37]/30"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full">{addr.label}</span>
                          <p className="text-white text-sm font-medium mt-1">{addr.full_name} · {addr.phone}</p>
                          <p className="text-gray-400 text-xs">{addr.address1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                        </div>
                        {selectedId === addr.id && <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center ml-3"><Check size={12} className="text-black" /></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { if (!selectedId) { toast.error("Select an address"); return } setStep("payment") }}
                disabled={!selectedId || loading}
                className="w-full mt-4 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F0D060] transition-all disabled:opacity-50">
                Continue to Payment →
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              {/* UPI Payment */}
              <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Smartphone size={16} className="text-[#D4AF37]" /> Pay via UPI
                </h2>

                {/* QR Code — generated dynamically with exact amount */}
                <div className="flex flex-col sm:flex-row gap-6 items-center mb-5">
                  <div className="bg-white p-3 rounded-xl flex-shrink-0 text-center">
                    <img
                      src={getQRUrl(UPI_ID, total)}
                      alt="UPI QR Code"
                      className="w-44 h-44 object-contain"
                    />
                    <p className="text-gray-500 text-xs mt-1">Scan to pay ₹{total.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-[#1A1A1A] rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">UPI ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono text-sm font-semibold">{UPI_ID}</p>
                        <button onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied!") }}
                          className="text-[#D4AF37] hover:text-[#F0D060] transition-colors">
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-3">
                      <p className="text-[#D4AF37] text-xs font-semibold mb-1">Amount to Pay</p>
                      <p className="text-white text-2xl font-bold">₹{total.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>1. Open PhonePe / GPay / Paytm</p>
                      <p>2. Scan QR or enter UPI ID</p>
                      <p>3. Pay ₹{total.toLocaleString("en-IN")}</p>
                      <p>4. Upload screenshot below</p>
                    </div>
                  </div>
                </div>

                {/* Other payment modes coming soon */}
                <div className="border border-[#D4AF37]/10 rounded-xl p-3 mb-4">
                  <p className="text-gray-500 text-xs text-center">💳 Card / Net Banking / EMI — <span className="text-[#D4AF37]">Coming Soon</span></p>
                </div>

                {/* Screenshot upload */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">UPI Transaction Reference (optional)</label>
                    <input value={upiRef} onChange={e=>setUpiRef(e.target.value)} placeholder="e.g. 123456789012"
                      className="w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Payment Screenshot *</label>
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37]/60 rounded-xl cursor-pointer transition-all bg-[#1A1A1A]">
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                      <Upload size={20} className="text-[#D4AF37] flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">{screenshot ? screenshot.name : "Upload payment screenshot"}</p>
                        <p className="text-gray-500 text-xs">JPG, PNG — max 10MB</p>
                      </div>
                    </label>
                    {screenshotPreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={screenshotPreview} alt="Screenshot preview" className="h-32 rounded-lg border border-[#D4AF37]/20 object-cover" />
                        <button onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-400 text-xs">Order will be confirmed only after admin verifies your payment screenshot.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("address")} className="px-4 py-3 border border-[#D4AF37]/20 text-gray-400 rounded-lg text-sm hover:border-[#D4AF37]/50 transition-all">← Back</button>
                <button onClick={handleSubmitOrder} disabled={submitting || !screenshot}
                  className="flex-1 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F0D060] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Place Order & Notify Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-6 h-fit sticky top-20">
          <h2 className="text-white font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.id || item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-400 truncate mr-2">{item.products?.name} × {item.quantity}</span>
                <span className="text-gray-300 shrink-0">{formatINR((item.products?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#D4AF37]/10 pt-4 space-y-2 mb-5">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Shipping</span><span className="text-green-400">Free</span></div>
            <div className="flex justify-between font-semibold pt-1 border-t border-[#D4AF37]/10">
              <span className="text-white">Total</span>
              <span className="text-[#D4AF37] text-lg">{formatINR(total)}</span>
            </div>
          </div>
          <p className="text-gray-600 text-xs text-center">🔒 UPI Payment · Secure & Safe</p>
        </div>
      </div>
    </div>
  )
}
