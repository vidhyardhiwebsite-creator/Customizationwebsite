import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { User, Mail, LogOut, MapPin, Plus, Edit2, Trash2, Star, Check } from "lucide-react"
import { fetchAddresses, saveAddress, updateAddress, deleteAddress, setDefaultAddress } from "../services/addressService"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import toast from "react-hot-toast"

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry"
]

const EMPTY_ADDR = { label: "Home", full_name: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "", is_default: false }

const inp = "w-full bg-white border border-[#E7DED1] rounded-xl px-3 py-2.5 text-sm text-[#2C241B] placeholder-[#8F857A] focus:outline-none focus:border-[#C8A23A] transition-colors"
const lbl = "text-[11px] text-[#6F655A] mb-1 block font-semibold uppercase tracking-wide"

function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_ADDR)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (form.full_name.trim().length < 3) e.full_name = "Name must be at least 3 characters"
    if (!form.phone.match(/^\d{10}$/)) e.phone = "10-digit number required"
    if (!form.address1.trim()) e.address1 = "Required"
    if (!form.city.trim()) e.city = "Required"
    if (!form.state.trim()) e.state = "Please select a state"
    if (!form.pincode.match(/^\d{6}$/)) e.pincode = "6-digit PIN required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form) }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3" style={{ background: "#FAF8F3", border: "1px solid #E7DED1" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-2">
          {["Home", "Work", "Other"].map(l => (
            <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={form.label === l
                ? { background: "linear-gradient(135deg,#D4AF37,#B8860B)", color: "#fff", border: "none" }
                : { background: "#FFFFFF", color: "#6F655A", border: "1px solid #E7DED1" }}>
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[#6F655A] cursor-pointer font-medium">
          <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-[#C8A23A]" />
          Set as default
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={lbl}>Full Name *</label>
          <input value={form.full_name || ""} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your name" className={inp} />
          {errors.full_name && <p className="text-[#D9534F] text-xs mt-0.5">{errors.full_name}</p>}
        </div>
        <div>
          <label className={lbl}>Phone *</label>
          <input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit number" maxLength={10} inputMode="numeric" type="tel" className={inp} />
          {errors.phone && <p className="text-[#D9534F] text-xs mt-0.5">{errors.phone}</p>}
        </div>
        <div className="col-span-2">
          <label className={lbl}>Address Line 1 *</label>
          <input value={form.address1 || ""} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))} placeholder="House/Flat, Street" className={inp} />
          {errors.address1 && <p className="text-[#D9534F] text-xs mt-0.5">{errors.address1}</p>}
        </div>
        <div className="col-span-2">
          <label className={lbl}>Address Line 2</label>
          <input value={form.address2 || ""} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))} placeholder="Landmark (optional)" className={inp} />
        </div>
        <div>
          <label className={lbl}>City *</label>
          <input value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className={inp} />
          {errors.city && <p className="text-[#D9534F] text-xs mt-0.5">{errors.city}</p>}
        </div>
        <div>
          <label className={lbl}>State *</label>
          <select value={form.state || ""} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={inp}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-[#D9534F] text-xs mt-0.5">{errors.state}</p>}
        </div>
        <div>
          <label className={lbl}>PIN Code *</label>
          <input value={form.pincode || ""} onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="6-digit PIN" maxLength={6} inputMode="numeric" type="tel" className={inp} />
          {errors.pincode && <p className="text-[#D9534F] text-xs mt-0.5">{errors.pincode}</p>}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1" style={{ height: 40, fontSize: 13 }}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60" style={{ height: 40, fontSize: 13 }}>
          {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Address
        </button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editAddr, setEditAddr] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchAddresses(user.id).then(setAddresses).catch(() => {})
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/")
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editAddr) {
        const updated = await updateAddress(editAddr.id, user.id, form)
        setAddresses(a => a.map(x => x.id === editAddr.id ? updated : x))
        toast.success("Address updated")
      } else {
        const newAddr = await saveAddress(user.id, form)
        setAddresses(a => form.is_default ? [newAddr, ...a.map(x => ({ ...x, is_default: false }))] : [...a, newAddr])
        toast.success("Address saved")
      }
      setShowForm(false)
      setEditAddr(null)
    } catch (e) {
      toast.error(e.message || "Failed to save address")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteAddress(id, user.id)
    setAddresses(a => a.filter(x => x.id !== id))
    toast.success("Address removed")
  }

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id, user.id)
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })))
    toast.success("Default address updated")
  }

  return (
    <>
      <Helmet>
        <title>My Profile — Vidhyrathi</title>
      </Helmet>
      <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>

        {/* Page header */}
        <div style={{ background: "#F3EEE6", borderBottom: "1px solid #E7DED1" }}>
          <div className="container-lux" style={{ paddingTop: "clamp(20px,3vw,32px)", paddingBottom: "clamp(16px,2.5vw,28px)" }}>
            <span className="eyebrow" style={{ marginBottom: 6 }}>Account</span>
            <h1 className="heading-xl" style={{ marginBottom: 0 }}>My <span className="text-gold-accent">Profile</span></h1>
          </div>
        </div>

        <div className="container-lux" style={{ paddingTop: "clamp(20px,3vw,32px)", paddingBottom: "clamp(40px,6vw,72px)" }}>
          <div className="max-w-2xl mx-auto space-y-6">

            {/* User Info Card */}
            <div className="card-lux p-6">
              <div className="flex items-center gap-4 mb-6">
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="avatar"
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      style={{ border: "2px solid #C8A23A" }} />
                  : <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(200,162,58,0.12)", border: "2px solid rgba(200,162,58,0.3)" }}>
                      <User size={28} style={{ color: "#C8A23A" }} />
                    </div>
                }
                <div>
                  <p className="font-playfair font-bold text-[18px] text-[#2C241B] leading-tight">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || "User"}
                  </p>
                  <p className="font-inter text-[13px] text-[#6F655A] flex items-center gap-1.5 mt-1">
                    <Mail size={13} style={{ color: "#C8A23A" }} /> {user?.email}
                  </p>
                </div>
              </div>
              <button onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-inter text-[14px] font-semibold transition-all"
                style={{ border: "1px solid rgba(217,83,79,0.3)", color: "#D9534F", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(217,83,79,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>

            {/* Addresses Card */}
            <div className="card-lux p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-inter font-semibold text-[15px] text-[#2C241B] flex items-center gap-2">
                  <MapPin size={16} style={{ color: "#C8A23A" }} /> Saved Addresses
                </h2>
                {!showForm && !editAddr && (
                  <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1 font-inter text-[12px] font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{ color: "#C8A23A", border: "1px solid rgba(200,162,58,0.35)", background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(200,162,58,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Plus size={13} /> Add New
                  </button>
                )}
              </div>

              <AnimatePresence>
                {(showForm && !editAddr) && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
                    <AddressForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {addresses.length === 0 && !showForm && (
                  <p className="font-inter text-[13px] text-center py-8 text-[#8F857A]">No saved addresses yet</p>
                )}
                {addresses.map(addr => (
                  <div key={addr.id}>
                    {editAddr?.id === addr.id ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <AddressForm initial={editAddr} onSave={handleSave} onCancel={() => setEditAddr(null)} saving={saving} />
                      </motion.div>
                    ) : (
                      <div className="rounded-xl p-4 transition-all"
                        style={{
                          border: addr.is_default ? "1.5px solid rgba(200,162,58,0.5)" : "1px solid #E7DED1",
                          background: addr.is_default ? "rgba(200,162,58,0.05)" : "#FAF8F3",
                        }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                                style={{ background: "rgba(200,162,58,0.12)", color: "#A88422" }}>
                                {addr.label}
                              </span>
                              {addr.is_default && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold"
                                  style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}>
                                  <Check size={10} /> Default
                                </span>
                              )}
                            </div>
                            <p className="font-inter font-semibold text-[13px] text-[#2C241B]">{addr.full_name} · {addr.phone}</p>
                            <p className="font-inter text-[12px] text-[#6F655A] mt-0.5">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}</p>
                            <p className="font-inter text-[12px] text-[#6F655A]">{addr.city}, {addr.state} – {addr.pincode}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!addr.is_default && (
                              <button onClick={() => handleSetDefault(addr.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                style={{ color: "#8F857A", background: "transparent" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#C8A23A"; e.currentTarget.style.background = "rgba(200,162,58,0.1)" }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#8F857A"; e.currentTarget.style.background = "transparent" }}
                                title="Set as default">
                                <Star size={14} />
                              </button>
                            )}
                            <button onClick={() => setEditAddr(addr)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ color: "#8F857A", background: "transparent" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#C8A23A"; e.currentTarget.style.background = "rgba(200,162,58,0.1)" }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#8F857A"; e.currentTarget.style.background = "transparent" }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(addr.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ color: "#8F857A", background: "transparent" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#D9534F"; e.currentTarget.style.background = "rgba(217,83,79,0.08)" }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#8F857A"; e.currentTarget.style.background = "transparent" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
