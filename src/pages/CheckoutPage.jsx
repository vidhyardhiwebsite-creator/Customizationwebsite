import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Plus, Check, CheckCircle, Upload, Copy, Smartphone, AlertCircle, Loader2, Zap } from "lucide-react"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { saveOrder } from "../services/orderService"
import { fetchAddresses, saveAddress } from "../services/addressService"
import { supabase } from "../lib/supabase"
import { formatINR } from "../utils/format"
import toast from "react-hot-toast"

const UPI_ID = "9848760606@ybl"
const ADMIN_WHATSAPP = "919848760606"
// Generate QR dynamically from UPI ID using Google Charts API
const getQRUrl = (upiId, amount) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Vidhyrathi&am=${Math.ceil(amount)}&cu=INR&tn=Vidhyrathi+Order`)}`

const EMPTY_ADDR = { label: "Home", full_name: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "", is_default: false }

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
]

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
  const inp = "w-full bg-white border border-[#E7DED1] rounded-lg px-3 py-2.5 text-sm text-[#2C241B] placeholder-[#8F857A] focus:outline-none focus:border-[#C8A23A] transition-colors"
  const lbl = "text-[11px] text-[#6F655A] mb-1 block font-semibold uppercase tracking-wide"
  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3" style={{ background: "#FAF8F3", border: "1px solid #E7DED1" }}>
      <div className="flex gap-2 mb-1">
        {["Home","Work","Other"].map(l => (
          <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all`}
            style={form.label === l
              ? { background: "linear-gradient(135deg,#D4AF37,#B8860B)", color: "#fff", border: "none" }
              : { background: "#FFFFFF", color: "#6F655A", border: "1px solid #E7DED1" }}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className={lbl}>Full Name *</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="Your name" className={inp} />{errors.full_name&&<p className="text-red-400 text-xs mt-0.5">{errors.full_name}</p>}</div>
        <div><label className={lbl}>Phone *</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value.replace(/\D/g,"").slice(0,10)}))} placeholder="10-digit number" maxLength={10} inputMode="numeric" type="tel" className={inp} />{errors.phone&&<p className="text-red-400 text-xs mt-0.5">{errors.phone}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 1 *</label><input value={form.address1} onChange={e=>setForm(f=>({...f,address1:e.target.value}))} placeholder="House/Flat, Street" className={inp} />{errors.address1&&<p className="text-red-400 text-xs mt-0.5">{errors.address1}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 2</label><input value={form.address2} onChange={e=>setForm(f=>({...f,address2:e.target.value}))} placeholder="Landmark (optional)" className={inp} /></div>
        <div><label className={lbl}>City *</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="City" className={inp} />{errors.city&&<p className="text-red-400 text-xs mt-0.5">{errors.city}</p>}</div>
        <div>
          <label className={lbl}>State *</label>
          <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} className={inp}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state&&<p className="text-red-400 text-xs mt-0.5">{errors.state}</p>}
        </div>
        <div><label className={lbl}>PIN Code *</label><input value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="6-digit PIN" maxLength={6} inputMode="numeric" type="tel" className={inp} />{errors.pincode&&<p className="text-red-400 text-xs mt-0.5">{errors.pincode}</p>}</div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-[#D4AF37]" />
        Save as default address
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1" style={{ height: 40, fontSize: 13 }}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60" style={{ height: 40, fontSize: 13 }}>Save & Use</button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items: cartItems, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Buy Now mode: single product passed via navigation state, bypasses cart
  const buyNowData = location.state?.buyNow || null
  const isBuyNow = !!buyNowData

  // Normalise items into the same shape as cart items so the rest of the page works identically
  const items = isBuyNow
    ? [{ id: `buynow_${buyNowData.product.id}`, product_id: buyNowData.product.id, quantity: buyNowData.quantity, products: buyNowData.product, custom_name: buyNowData.custom_name || null, custom_photo_url: buyNowData.custom_photo_url || null }]
    : cartItems

  const total = items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)
  const fileRef = useRef(null)

  // Shipping cost based on state
  const getShippingCost = (addr) => {
    if (!addr) return 100
    const state = (addr.state || "").toLowerCase().trim()
    const localStates = ["andhra pradesh", "telangana", "ap", "ts"]
    return localStates.some(s => state.includes(s)) ? 80 : 100
  }

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
  const [qrRevealed, setQrRevealed] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const userId = user.id
    fetchAddresses(userId).then(addrs => {
      setAddresses(addrs)
      // Only set default if nothing is selected yet � prevents resetting on re-render or tab focus
      setSelectedId(prev => {
        if (prev && addrs.find(a => a.id === prev)) return prev
        const def = addrs.find(a => a.is_default) || addrs[0]
        return def ? def.id : null
      })
      if (addrs.length === 0) setShowNewForm(true)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id])

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
      const shipping = getShippingCost(addr)

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

      // Build list of [series, itemsForSeries] pairs � skip empty
      const orderGroups = []
      if (ns0Items.length > 0) orderGroups.push(["NS0", ns0Items])
      if (ns1Items.length > 0) orderGroups.push(["NS1", ns1Items])
      if (orderGroups.length === 0) orderGroups.push(["NS0", items]) // fallback

      const createdOrderIds = []

      for (const [series, groupItems] of orderGroups) {
        const groupSubtotal = groupItems.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)
        // Distribute shipping proportionally � or add full shipping to first group only
        const isFirstGroup = createdOrderIds.length === 0
        const groupTotal = groupSubtotal + (isFirstGroup ? shipping : 0)

        // Generate sequential order ID: NS0-001, NS0-002 / NS1-001, NS1-002
        let seqNum = 1
        try {
          const { data: seqData, error: seqErr } = await supabase.rpc("get_next_series_number", { p_series: series })
          if (!seqErr && seqData != null) {
            seqNum = Number(seqData)
          } else {
            // Fallback: count existing orders for this series + 1
            const { count } = await supabase
              .from("orders")
              .select("*", { count: "exact", head: true })
              .eq("order_series", series)
            seqNum = (count || 0) + 1
          }
        } catch {
          seqNum = Date.now() % 1000 + 1
        }
        const displayOrderId = `${series}-${String(seqNum).padStart(3, "0")}`

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
          custom_name: item.custom_name || null,
          custom_photo_url: item.custom_photo_url || null,
        }))
        await supabase.from("order_items").insert(orderItems)
        createdOrderIds.push(displayOrderId)
      }

      const displayOrderId = createdOrderIds.join(" + ")

      // Clear cart only for normal cart checkout � Buy Now doesn't touch the cart
      if (!isBuyNow) await clearCart(user.id)

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
          <CheckCircle size={80} className="mx-auto mb-6" style={{ color: "#C8A23A" }} />
        </motion.div>
        <h2 className="heading-lg mb-3">Order Placed!</h2>
        <p className="body-md mb-2">Your order is pending payment verification.</p>
        <p className="body-md mb-8 text-sm">We will confirm your order once payment is verified. You will be notified.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate("/orders")} className="btn-primary" style={{ height: 48, padding: "0 28px" }}>View Orders</button>
          <button onClick={() => navigate("/")} className="btn-ghost" style={{ height: 48, padding: "0 24px" }}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>
      <div className="container-lux" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="mb-8">
          <span className="eyebrow">{isBuyNow ? "Quick Purchase" : "Checkout"}</span>
          <h1 className="heading-xl">{isBuyNow ? "Buy <span class='text-gold-accent'>Now</span>" : <>Complete Your <span className="text-gold-accent">Order</span></>}</h1>
        </div>
      {isBuyNow && (
          <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(200,162,58,0.08)", border: "1px solid rgba(200,162,58,0.25)", color: "#A88422" }}>
            <Zap size={14} className="flex-shrink-0" />
            Buying <span className="font-semibold mx-1">{buyNowData.product.name}</span> directly � your cart is unchanged.
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {["address","payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s || (s === "address" && step === "payment") ? "text-white" : "text-[#8F857A]"}`}
                style={step === s || (s === "address" && step === "payment")
                  ? { background: "linear-gradient(135deg,#D4AF37,#B8860B)" }
                  : { background: "#F3EEE6", border: "1px solid #E7DED1" }}>
                {i + 1}
              </div>
              <span className={`text-sm capitalize font-inter ${step === s ? "text-[#2C241B] font-semibold" : "text-[#8F857A]"}`}>
                {s === "address" ? "Delivery Address" : "Payment"}
              </span>
              {i === 0 && <div className="w-8 h-px mx-1" style={{ background: "#E7DED1" }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {step === "address" && (
              <div className="card-lux p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-inter font-semibold text-[#2C241B] flex items-center gap-2 text-[15px]">
                    <MapPin size={16} style={{ color: "#C8A23A" }} /> Delivery Address
                  </h2>
                  {!showNewForm && <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#C8A23A" }}><Plus size={13} /> Add New</button>}
                </div>
                {loading ? <div className="h-20 rounded-xl animate-pulse" style={{ background: "#F3EEE6" }} /> : (
                  <div className="space-y-3">
                    {showNewForm && <NewAddressForm onSave={handleSaveNew} onCancel={() => addresses.length > 0 && setShowNewForm(false)} saving={savingAddr} />}
                    {addresses.map(addr => (
                      <div key={addr.id} onClick={() => { setSelectedId(addr.id); setShowNewForm(false) }}
                        className="rounded-xl p-4 cursor-pointer transition-all"
                        style={{
                          border: selectedId === addr.id ? "1.5px solid #C8A23A" : "1px solid #E7DED1",
                          background: selectedId === addr.id ? "rgba(200,162,58,0.05)" : "#FAF8F3",
                        }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(200,162,58,0.12)", color: "#A88422" }}>{addr.label}</span>
                            <p className="font-inter font-medium text-[14px] text-[#2C241B] mt-1.5">{addr.full_name} &middot; {addr.phone}</p>
                            <p className="font-inter text-[12px] text-[#6F655A] mt-0.5">{addr.address1}, {addr.city}, {addr.state} &ndash; {addr.pincode}</p>
                          </div>
                          {selectedId === addr.id && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center ml-3 flex-shrink-0"
                              style={{ background: "linear-gradient(135deg,#D4AF37,#B8860B)" }}>
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { if (!selectedId) { toast.error("Select an address"); return } setStep("payment") }}
                  disabled={!selectedId || loading}
                  className="btn-primary w-full mt-5 disabled:opacity-40 disabled:cursor-not-allowed" style={{ height: 48 }}>
                  Continue to Payment &rarr;
                </button>
              </div>
            )}

          {step === "payment" && (
              <div className="space-y-4">
                {/* UPI Payment */}
                <div className="card-lux p-5 sm:p-6">
                  <h2 className="font-inter font-semibold text-[#2C241B] mb-4 flex items-center gap-2 text-[15px]">
                    <Smartphone size={16} style={{ color: "#C8A23A" }} /> Pay via UPI
                  </h2>

                {/* QR Code � flip card, hidden by default, tap to reveal */}
                <div className="flex flex-col sm:flex-row gap-6 items-center mb-5">
                  {(() => {
                    const selectedAddr = addresses.find(a => a.id === selectedId)
                    const shipping = getShippingCost(selectedAddr)
                    const grandTotal = total + shipping
                    return (
                      <div
                        className="flex-shrink-0 cursor-pointer"
                        style={{ perspective: "600px" }}
                        onClick={() => setQrRevealed(r => !r)}
                      >
                        <div style={{
                          width: "176px", height: "176px",
                          transition: "transform 0.6s",
                          transformStyle: "preserve-3d",
                          transform: qrRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                          position: "relative"
                        }}>
                          {/* Front � blurred placeholder */}
                          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                            className="absolute inset-0 bg-[#F2EDE6] border-2 border-[#1B2B5E]/20 rounded-xl flex flex-col items-center justify-center gap-2">
                            <div className="w-16 h-16 grid grid-cols-3 gap-1 opacity-30">
                              {Array(9).fill(0).map((_, i) => <div key={i} className="bg-white rounded-sm" />)}
                            </div>
                            <p className="text-[#1B2B5E] text-xs font-semibold">Tap to reveal QR</p>
                            <p className="text-[#4A4A6A] text-xs">?{Math.ceil(grandTotal).toLocaleString("en-IN")}</p>
                          </div>
                          {/* Back � actual QR */}
                          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            className="absolute inset-0 bg-white p-2 rounded-xl flex flex-col items-center justify-center">
                            <img src={getQRUrl(UPI_ID, grandTotal)} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                            <p className="text-gray-500 text-xs mt-1">?{Math.ceil(grandTotal).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">{qrRevealed ? "Tap to hide" : "Tap to show QR"}</p>
                      </div>
                    )
                  })()}
                  <div className="flex-1 space-y-3">
                    <div className="bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl p-4">
                      <p className="text-[#4A4A6A] text-xs mb-1">UPI ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[#1A1A2E] font-mono text-sm font-semibold">{UPI_ID}</p>
                        <button onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied!") }}
                          className="text-[#C9956C] hover:text-[#1B2B5E] transition-colors">
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#1B2B5E]/5 border border-[#1B2B5E]/20 rounded-xl p-3">
                      <p className="text-[#1B2B5E] text-xs font-semibold mb-1">Amount to Pay</p>
                      {(() => {
                        const selectedAddr = addresses.find(a => a.id === selectedId)
                        const shipping = getShippingCost(selectedAddr)
                        return <p className="text-[#1A1A2E] text-2xl font-bold">?{Math.ceil(total + shipping).toLocaleString("en-IN")}</p>
                      })()}
                    </div>
                    <div className="text-xs text-[#4A4A6A] space-y-1">
                      <p>1. Open PhonePe / GPay / Paytm</p>
                      <p>2. Scan QR or enter UPI ID</p>
                      <p>3. Pay exact amount shown above</p>
                      <p>4. Upload screenshot below</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl p-3 mb-4" style={{ borderColor: "rgba(200,162,58,0.2)", background: "rgba(200,162,58,0.04)" }}>
                    <p className="text-[13px] text-center" style={{ color: "#8F857A" }}>?? Card / Net Banking / EMI � <span style={{ color: "#C8A23A" }}>Coming Soon</span></p>
                  </div>

                  {/* Screenshot upload */}
                  <div className="space-y-3">
                    <div>
                      <label className="font-inter text-[12px] font-medium text-[#6F655A] mb-1 block">UPI Transaction Reference (optional)</label>
                      <input value={upiRef} onChange={e=>setUpiRef(e.target.value)} placeholder="e.g. 123456789012"
                        className="input-warm text-[14px]" style={{ height: 44 }} />
                    </div>
                    <div>
                      <label className="font-inter text-[12px] font-medium text-[#6F655A] mb-1 block">Payment Screenshot <span style={{ color: "#D9534F" }}>*</span></label>
                      <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                        style={{ border: "2px dashed #E7DED1", background: "#FAF8F3" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(200,162,58,0.5)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#E7DED1"}>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                        <Upload size={20} style={{ color: "#C8A23A", flexShrink: 0 }} />
                        <div>
                          <p className="font-inter font-semibold text-[14px] text-[#2C241B]">{screenshot ? screenshot.name : "Upload payment screenshot"}</p>
                          <p className="font-inter text-[12px] text-[#8F857A]">JPG, PNG &mdash; max 10MB</p>
                        </div>
                      </label>
                      {screenshotPreview && (
                        <div className="mt-2 relative inline-block">
                          <img src={screenshotPreview} alt="Screenshot preview" className="h-32 rounded-xl object-cover" style={{ border: "1px solid rgba(200,162,58,0.3)" }} />
                          <button onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                            className="absolute -top-2 -right-2 bg-[#D9534F] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">�</button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: "rgba(200,162,58,0.07)", border: "1px solid rgba(200,162,58,0.2)" }}>
                      <AlertCircle size={14} style={{ color: "#A88422", marginTop: 2, flexShrink: 0 }} />
                      <p className="font-inter text-[12px]" style={{ color: "#A88422" }}>Order will be confirmed only after admin verifies your payment screenshot.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("address")} className="btn-ghost" style={{ height: 48, padding: "0 20px" }}>&larr; Back</button>
                  <button onClick={handleSubmitOrder} disabled={submitting || !screenshot}
                    className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed" style={{ height: 48 }}>
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Place Order &amp; Confirm
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Order Summary */}
        <div className="card-lux p-5 sm:p-6 h-fit lg:sticky top-24">
          <h2 className="font-inter font-semibold text-[#2C241B] mb-4 text-[15px]">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.id || item.product_id} className="flex justify-between text-[13px]">
                <span className="text-[#6F655A] truncate mr-2">{item.products?.name} &times; {item.quantity}</span>
                <span className="text-[#2C241B] shrink-0 font-semibold">{formatINR((item.products?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #E7DED1", paddingTop: 16 }} className="space-y-2 mb-5">
            {(() => {
              const selectedAddr = addresses.find(a => a.id === selectedId)
              const shipping = getShippingCost(selectedAddr)
              const grandTotal = total + shipping
              return (
                <>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-inter text-[#8F857A]">Subtotal</span>
                    <span className="font-inter font-semibold text-[#2C241B]">{formatINR(total)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-inter text-[#8F857A]">Shipping</span>
                    <span className="font-inter font-semibold" style={{ color: "#C8A23A" }}>+{formatINR(shipping)}</span>
                  </div>
                  {selectedAddr && (
                    <p className="font-inter text-[11px] text-[#8F857A]">
                      {["andhra pradesh","telangana","ap","ts"].some(s => (selectedAddr.state||"").toLowerCase().includes(s))
                        ? "AP/Telangana rate"
                        : "Other states rate"}
                    </p>
                  )}
                  <div className="flex justify-between font-semibold pt-2" style={{ borderTop: "1px solid #E7DED1", marginTop: 8 }}>
                    <span className="font-playfair font-bold text-[15px] text-[#2C241B]">Total</span>
                    <span className="font-playfair font-bold text-[1.2rem] text-gold-accent">{formatINR(grandTotal)}</span>
                  </div>
                </>
              )
            })()}
          </div>
          <p className="font-inter text-[11px] text-center" style={{ color: "#8F857A" }}>?? UPI Payment � Secure &amp; Safe</p>
        </div>
      </div>
      </div>
    </div>
  )
}
