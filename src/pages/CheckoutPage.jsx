﻿import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Plus, Check, CheckCircle, Upload, Copy, Smartphone, AlertCircle, Loader2, Zap, ShieldCheck, Truck } from "lucide-react"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { fetchAddresses, saveAddress } from "../services/addressService"
import { supabase } from "../lib/supabase"
import { formatINR } from "../utils/format"
import toast from "react-hot-toast"

const UPI_ID = "9848760606@ybl"
const ADMIN_WHATSAPP = "919848760606"

const getQRUrl = (upiId, amount) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Vidhyrathi&am=${Math.ceil(amount)}&cu=INR&tn=Vidhyrathi+Order`)}`

const EMPTY_ADDR = { label: "Home", full_name: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "", is_default: false }

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
]

const inp = {
  width: "100%", boxSizing: "border-box",
  background: "#FFFFFF", border: "1.5px solid #E7DED1", borderRadius: 10,
  padding: "10px 14px", fontSize: 14, color: "#2C241B",
  fontFamily: "'Inter',sans-serif", outline: "none",
}
const lbl = { fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#8F857A", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }

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
    setErrors(e); return Object.keys(e).length === 0
  }
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form) }
  const field = (key, label, placeholder, opts = {}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={lbl}>{label}</label>
      <input value={form[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: opts.numeric ? e.target.value.replace(/\D/g,"").slice(0,opts.max||99) : e.target.value }))}
        maxLength={opts.max} inputMode={opts.numeric ? "numeric" : "text"} type={opts.numeric ? "tel" : "text"}
        style={{ ...inp, borderColor: errors[key] ? "#D9534F" : "#E7DED1" }}
        onFocus={e => e.target.style.borderColor = "#C8A23A"}
        onBlur={e => e.target.style.borderColor = errors[key] ? "#D9534F" : "#E7DED1"} />
      {errors[key] && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#D9534F", margin: 0 }}>{errors[key]}</p>}
    </div>
  )
  return (
    <form onSubmit={handleSubmit} style={{ background: "#FAF8F3", border: "1px solid #E7DED1", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["Home","Work","Other"].map(l => (
          <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
            style={form.label === l
              ? { background: "linear-gradient(135deg,#D4AF37,#B8860B)", color: "#fff", border: "none", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }
              : { background: "#FFFFFF", color: "#6F655A", border: "1px solid #E7DED1", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1/-1" }}>{field("full_name","Full Name *","Your full name")}</div>
        <div>{field("phone","Phone *","10-digit number",{numeric:true,max:10})}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={lbl}>State *</label>
          <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}
            style={{ ...inp, borderColor: errors.state ? "#D9534F" : "#E7DED1" }}
            onFocus={e=>e.target.style.borderColor="#C8A23A"} onBlur={e=>e.target.style.borderColor=errors.state?"#D9534F":"#E7DED1"}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p style={{ fontFamily:"'Inter',sans-serif",fontSize:11,color:"#D9534F",margin:0 }}>{errors.state}</p>}
        </div>
        <div style={{ gridColumn: "1/-1" }}>{field("address1","Address Line 1 *","House/Flat, Street, Area")}</div>
        <div style={{ gridColumn: "1/-1" }}>{field("address2","Address Line 2","Landmark (optional)")}</div>
        <div>{field("city","City *","City")}</div>
        <div>{field("pincode","PIN Code *","6-digit PIN",{numeric:true,max:6})}</div>
      </div>
      <label style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Inter',sans-serif", fontSize:13, color:"#6F655A", cursor:"pointer" }}>
        <input type="checkbox" checked={form.is_default} onChange={e=>setForm(f=>({...f,is_default:e.target.checked}))} style={{ accentColor:"#D4AF37" }} />
        Set as default address
      </label>
      <div style={{ display:"flex", gap:10 }}>
        <button type="button" onClick={onCancel} className="btn-ghost" style={{ flex:1, height:44, fontSize:13 }}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary" style={{ flex:1, height:44, fontSize:13, opacity:saving?0.7:1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />} Save Address
        </button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const buyNowData = location.state?.buyNow || null
  const isBuyNow = !!buyNowData
  const items = isBuyNow
    ? [{ id: `buynow_${buyNowData.product.id}`, product_id: buyNowData.product.id, quantity: buyNowData.quantity, products: buyNowData.product, custom_name: buyNowData.custom_name || null, custom_photo_url: buyNowData.custom_photo_url || null }]
    : cartItems
  const total = items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)
  const fileRef = useRef(null)

  const getShippingCost = (addr) => {
    if (!addr) return 100
    const state = (addr.state || "").toLowerCase().trim()
    return ["andhra pradesh","telangana","ap","ts"].some(s => state.includes(s)) ? 80 : 100
  }

  const [addresses, setAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState("address")
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [upiRef, setUpiRef] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [savingAddr, setSavingAddr] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchAddresses(user.id).then(addrs => {
      setAddresses(addrs)
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
      setAddresses(updated); setSelectedId(newAddr.id); setShowNewForm(false)
      toast.success("Address saved")
    } catch (e) { toast.error(e.message || "Failed") }
    finally { setSavingAddr(false) }
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return }
    setScreenshot(file); setScreenshotPreview(URL.createObjectURL(file))
  }

  const handleSubmitOrder = async () => {
    if (!screenshot) { toast.error("Please upload payment screenshot"); return }
    const addr = addresses.find(a => a.id === selectedId)
    if (!addr) { toast.error("Please select delivery address"); return }
    setSubmitting(true)
    try {
      const shipping = getShippingCost(addr)
      const ext = screenshot.name.split(".").pop()
      const path = `payment-screenshots/${user.id}_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, screenshot, { contentType: screenshot.type })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)
      const ns1Items = items.filter(i => (i.products?.custom_id || "").toUpperCase().startsWith("NS1"))
      const ns0Items = items.filter(i => !ns1Items.includes(i))
      const orderGroups = []
      if (ns0Items.length > 0) orderGroups.push(["NS0", ns0Items])
      if (ns1Items.length > 0) orderGroups.push(["NS1", ns1Items])
      if (orderGroups.length === 0) orderGroups.push(["NS0", items])
      const createdOrderIds = []
      for (const [series, groupItems] of orderGroups) {
        const groupSubtotal = groupItems.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)
        const isFirstGroup = createdOrderIds.length === 0
        const groupTotal = groupSubtotal + (isFirstGroup ? shipping : 0)
        let seqNum = 1
        try {
          const { data: seqData, error: seqErr } = await supabase.rpc("get_next_series_number", { p_series: series })
          if (!seqErr && seqData != null) { seqNum = Number(seqData) } else {
            const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_series", series)
            seqNum = (count || 0) + 1
          }
        } catch { seqNum = Date.now() % 1000 + 1 }
        const displayOrderId = `${series}-${String(seqNum).padStart(3, "0")}`
        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          user_id: user.id, total_amount: groupTotal, payment_status: "pending_verification",
          payment_method: "upi", payment_screenshot_url: urlData.publicUrl,
          upi_ref: upiRef.trim(), address: JSON.stringify(addr),
          order_status: "pending", order_series: series, display_order_id: displayOrderId,
        }).select().single()
        if (orderErr) throw orderErr
        await supabase.from("order_items").insert(groupItems.map(item => ({
          order_id: order.id, product_id: item.product_id, quantity: item.quantity,
          price: item.products?.price || 0, custom_name: item.custom_name || null, custom_photo_url: item.custom_photo_url || null,
        })))
        createdOrderIds.push(displayOrderId)
      }
      if (!isBuyNow) await clearCart(user.id)
      setStep("success")
      toast.success("Order placed! Awaiting payment verification.")
    } catch (e) { toast.error(e.message || "Failed to place order") }
    finally { setSubmitting(false) }
  }

  const selectedAddr = addresses.find(a => a.id === selectedId)
  const shipping = getShippingCost(selectedAddr)
  const grandTotal = total + shipping

  if (step === "success") {
    return (
      <div style={{ background: "#F8F5F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}
          style={{ background: "#FFFFFF", borderRadius: 24, padding: "48px 32px", textAlign: "center", maxWidth: 440, width: "100%", boxShadow: "0 8px 40px rgba(44,36,27,0.12)", border: "1px solid #E7DED1" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(200,162,58,0.12)", border: "2px solid rgba(200,162,58,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} style={{ color: "#C8A23A" }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, color: "#2C241B", margin: "0 0 10px" }}>Order Placed!</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6F655A", lineHeight: 1.6, margin: "0 0 8px" }}>Your order is pending payment verification.</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A", lineHeight: 1.6, margin: "0 0 32px" }}>We will confirm once payment is verified. You will be notified on WhatsApp.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => navigate("/orders")} className="btn-primary" style={{ height: 46, padding: "0 24px", fontSize: 13 }}>View Orders</button>
            <button onClick={() => navigate("/")} className="btn-ghost" style={{ height: 46, padding: "0 20px", fontSize: 13 }}>Shop More</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "#F3EEE6", borderBottom: "1px solid #E7DED1" }}>
        <div className="container-lux" style={{ paddingTop: "clamp(16px,3vw,28px)", paddingBottom: "clamp(14px,2.5vw,24px)" }}>
          <span className="eyebrow">{isBuyNow ? "Quick Purchase" : "Checkout"}</span>
          <h1 className="heading-xl" style={{ marginBottom: 0 }}>
            {isBuyNow ? <>Buy <span className="text-gold-accent">Now</span></> : <>Complete Your <span className="text-gold-accent">Order</span></>}
          </h1>
        </div>
      </div>

      <div className="container-lux" style={{ paddingTop: "clamp(20px,3vw,32px)", paddingBottom: 80 }}>
        {/* Buy Now banner */}
        {isBuyNow && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(200,162,58,0.08)", border: "1px solid rgba(200,162,58,0.25)", borderRadius: 12, padding: "10px 16px", marginBottom: 20, color: "#A88422" }}>
            <Zap size={14} style={{ flexShrink: 0 }} />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, margin: 0 }}>
              Buying <strong>{buyNowData.product.name}</strong> directly — your cart is unchanged.
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24, background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 14, padding: "12px 20px" }}>
          {["Delivery Address", "Payment"].map((label, i) => {
            const s = i === 0 ? "address" : "payment"
            const done = (i === 0 && step === "payment")
            const active = step === s
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i === 0 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif", flexShrink: 0,
                    background: done ? "#22C55E" : active ? "linear-gradient(135deg,#D4AF37,#B8860B)" : "#F3EEE6",
                    color: done || active ? "#fff" : "#8F857A",
                    border: done || active ? "none" : "1px solid #E7DED1" }}>
                    {done ? <Check size={13} /> : i + 1}
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#2C241B" : done ? "#22C55E" : "#8F857A" }}>{label}</span>
                </div>
                {i === 0 && <div style={{ flex: 1, height: 1, background: step === "payment" ? "#C8A23A" : "#E7DED1", margin: "0 16px", borderRadius: 1 }} />}
              </div>
            )
          })}
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "start" }} className="lg:grid-cols-[1fr_360px]">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* STEP 1: Address */}
            {step === "address" && (
              <div style={{ background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 20, padding: "clamp(16px,3vw,24px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: "#2C241B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={16} style={{ color: "#C8A23A" }} /> Delivery Address
                  </h2>
                  {!showNewForm && (
                    <button onClick={() => setShowNewForm(true)}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(200,162,58,0.08)", border: "1px solid rgba(200,162,58,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#A88422", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                      <Plus size={12} /> Add New
                    </button>
                  )}
                </div>
                {loading ? (
                  <div style={{ height: 80, background: "#F3EEE6", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {showNewForm && <NewAddressForm onSave={handleSaveNew} onCancel={() => addresses.length > 0 && setShowNewForm(false)} saving={savingAddr} />}
                    {addresses.map(addr => (
                      <div key={addr.id} onClick={() => { setSelectedId(addr.id); setShowNewForm(false) }}
                        style={{ border: selectedId === addr.id ? "2px solid #C8A23A" : "1.5px solid #E7DED1", background: selectedId === addr.id ? "rgba(200,162,58,0.04)" : "#FAFAF8", borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(200,162,58,0.12)", color: "#A88422", borderRadius: 999, padding: "2px 8px", display: "inline-block", marginBottom: 6 }}>{addr.label}</span>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: "#2C241B", margin: "0 0 3px" }}>{addr.full_name} &middot; {addr.phone}</p>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A", margin: 0, lineHeight: 1.5 }}>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}, {addr.city}, {addr.state} &ndash; {addr.pincode}</p>
                          </div>
                          {selectedId === addr.id && (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#B8860B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Check size={12} style={{ color: "#fff" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { if (!selectedId) { toast.error("Select an address"); return } setStep("payment") }}
                  disabled={!selectedId || loading} className="btn-primary"
                  style={{ width: "100%", marginTop: 18, height: 50, fontSize: 14, opacity: (!selectedId || loading) ? 0.4 : 1, cursor: (!selectedId || loading) ? "not-allowed" : "pointer" }}>
                  Continue to Payment &rarr;
                </button>
              </div>
            )}

            {/* STEP 2: Payment */}
            {step === "payment" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* UPI Card */}
                <div style={{ background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 20, padding: "clamp(16px,3vw,24px)" }}>
                  <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: "#2C241B", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Smartphone size={16} style={{ color: "#C8A23A" }} /> Pay via UPI
                  </h2>

                  {/* QR + Details Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
                    {/* QR Code */}
                    <div style={{ textAlign: "center", flexShrink: 0, width: "100%", maxWidth: 160 }}>
                      <div style={{ width: "100%", maxWidth: 160, aspectRatio: "1", background: "#FFFFFF", borderRadius: 14, border: "2px solid #E7DED1", padding: 4, overflow: "hidden", margin: "0 auto" }}>
                        <img src={getQRUrl(UPI_ID, grandTotal)} alt="UPI QR Code" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                      </div>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#8F857A", marginTop: 6 }}>Scan to pay</p>
                    </div>

                    {/* Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: "min(100%, 220px)" }}>
                      {/* Amount */}
                      <div style={{ background: "linear-gradient(135deg,rgba(200,162,58,0.1),rgba(200,162,58,0.05))", border: "1.5px solid rgba(200,162,58,0.3)", borderRadius: 14, padding: "14px 16px" }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#A88422", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Amount to Pay</p>
                        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 800, color: "#2C241B", margin: 0 }}>{formatINR(grandTotal)}</p>
                      </div>

                      {/* UPI ID */}
                      <div style={{ background: "#F8F5F0", border: "1px solid #E7DED1", borderRadius: 12, padding: "12px 14px" }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#8F857A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 5px" }}>UPI ID</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#2C241B", margin: 0, flex: 1 }}>{UPI_ID}</p>
                          <button onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success("Copied!") }}
                            style={{ background: "rgba(200,162,58,0.12)", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "#A88422", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600 }}>
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      </div>

                      {/* Steps */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {["Open PhonePe / GPay / Paytm","Scan QR or enter UPI ID","Pay exact amount shown","Upload screenshot below"].map((s, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(200,162,58,0.15)", color: "#A88422", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</span>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A", margin: 0 }}>{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coming soon */}
                  <div style={{ background: "#FAF8F3", border: "1px solid #E7DED1", borderRadius: 10, padding: "10px 14px", textAlign: "center", marginBottom: 20 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", margin: 0 }}>
                      Credit/Debit Card &amp; Net Banking <span style={{ color: "#C8A23A", fontWeight: 600 }}>— Coming Soon</span>
                    </p>
                  </div>

                  {/* UPI Ref */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    <label style={lbl}>UPI Transaction Reference <span style={{ color: "#B8AFA8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <input value={upiRef} onChange={e => setUpiRef(e.target.value)} placeholder="e.g. 123456789012"
                      style={inp} onFocus={e => e.target.style.borderColor = "#C8A23A"} onBlur={e => e.target.style.borderColor = "#E7DED1"} />
                  </div>

                  {/* Screenshot Upload */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    <label style={lbl}>Payment Screenshot <span style={{ color: "#D9534F" }}>*</span></label>
                    <label style={{ display: "flex", alignItems: "center", gap: 14, background: "#FAF8F3", border: "2px dashed #E7DED1", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(200,162,58,0.5)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#E7DED1"}>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleScreenshotChange} />
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,162,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Upload size={18} style={{ color: "#C8A23A" }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: "#2C241B", margin: "0 0 2px" }}>{screenshot ? screenshot.name : "Upload payment screenshot"}</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", margin: 0 }}>JPG, PNG — max 10MB</p>
                      </div>
                    </label>
                    {screenshotPreview && (
                      <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
                        <img src={screenshotPreview} alt="Preview" style={{ height: 100, borderRadius: 10, objectFit: "cover", border: "1px solid #E7DED1" }} />
                        <button onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                          style={{ position: "absolute", top: -6, right: -6, background: "#EF4444", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>x</button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(200,162,58,0.06)", border: "1px solid rgba(200,162,58,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                    <AlertCircle size={14} style={{ color: "#A88422", marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#A88422", margin: 0, lineHeight: 1.6 }}>Order confirmed only after admin verifies your payment screenshot.</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep("address")} className="btn-ghost" style={{ height: 50, padding: "0 20px", fontSize: 13 }}>&larr; Back</button>
                  <button onClick={handleSubmitOrder} disabled={submitting || !screenshot} className="btn-primary"
                    style={{ flex: 1, height: 50, fontSize: 14, opacity: (submitting || !screenshot) ? 0.5 : 1, cursor: (submitting || !screenshot) ? "not-allowed" : "pointer" }}>
                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Placing Order...</> : "Place Order & Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 20, padding: "clamp(16px,3vw,24px)", height: "fit-content" }} className="lg:sticky lg:top-6">
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: "#2C241B", margin: "0 0 16px" }}>Order Summary</h2>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
              {items.map(item => (
                <div key={item.id || item.product_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.products?.images?.[0] && (
                    <img src={item.products.images[0]} alt={item.products.name}
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E7DED1", flexShrink: 0 }}
                      onError={e => e.target.style.display = "none"} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#2C241B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.products?.name}</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", margin: "2px 0 0" }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#2C241B", flexShrink: 0, margin: 0 }}>{formatINR((item.products?.price || 0) * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid #E7DED1", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A" }}>Subtotal</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#2C241B" }}>{formatINR(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A" }}>Shipping</span>
                  {selectedAddr && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#B8AFA8", margin: "1px 0 0" }}>
                    {["andhra pradesh","telangana"].some(s => (selectedAddr.state||"").toLowerCase().includes(s)) ? "AP/Telangana rate" : "Other states rate"}
                  </p>}
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#C8A23A" }}>+{formatINR(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E7DED1", paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: "#2C241B" }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 800, color: "#C8A23A" }}>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A" }}>Secure UPI Payment</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={14} style={{ color: "#C8A23A", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6F655A" }}>Fast delivery after verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
