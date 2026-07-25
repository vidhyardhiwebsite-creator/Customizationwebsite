import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Sparkles } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { useWishlistStore } from "../store/wishlistStore"
import toast from "react-hot-toast"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Reusable input field ── */
function Field({ label, type, value, onChange, placeholder, icon, rightEl, error, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#6F655A" }}>{label}</label>
        {hint && hint}
      </div>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#C8A23A", display: "flex", pointerEvents: "none" }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: icon ? "13px 44px 13px 42px" : "13px 44px 13px 16px",
            borderRadius: 12,
            border: error ? "1.5px solid #D9534F" : "1.5px solid #E7DED1",
            background: "#FDFCFB",
            color: "#2C241B",
            fontSize: 15,
            fontFamily: "'Inter',sans-serif",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = "#C8A23A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,162,58,0.1)" }}
          onBlur={e => { e.target.style.borderColor = error ? "#D9534F" : "#E7DED1"; e.target.style.boxShadow = "none" }}
        />
        {rightEl && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
            {rightEl}
          </span>
        )}
      </div>
      {error && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#D9534F", margin: 0 }}>{error}</p>}
    </div>
  )
}

export default function LoginPage() {
  const [mode, setMode]         = useState("login")
  const [form, setForm]         = useState({ name: "", email: "", password: "" })
  const [errors, setErrors]     = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuthStore()
  const { mergeLocalCart, loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || "/"

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGoogle = async () => {
    setGLoading(true)
    try { await signInWithGoogle() }
    catch (err) { toast.error(err.message || "Google sign-in failed"); setGLoading(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address"
    if (mode !== "forgot" && form.password.length < 8)    e.password = "Minimum 8 characters"
    if (mode === "signup" && !form.name.trim())            e.name = "Full name is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === "forgot") {
        await resetPassword(form.email)
        setResetSent(true)
      } else if (mode === "login") {
        const { user } = await signIn(form.email, form.password)
        await mergeLocalCart(user.id)
        await loadCart(user.id)
        await loadWishlist(user.id)
        toast.success("Welcome back!")
        navigate(from, { replace: true })
      } else {
        await signUp(form.email, form.password, form.name)
        setSignupDone(true)
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed")
    } finally { setLoading(false) }
  }

  const switchMode = m => { setMode(m); setErrors({}); setResetSent(false); setSignupDone(false); setForm(f => ({ ...f, password: "" })) }

  /* ── shared card style ── */
  const card = {
    background: "#FFFFFF",
    border: "1px solid #E7DED1",
    borderRadius: 24,
    padding: "40px 36px",
    boxShadow: "0 8px 40px rgba(44,36,27,0.10)",
    width: "100%",
    maxWidth: 440,
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #F8F5F0 0%, #F3EEE6 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
    }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25,0.46,0.45,0.94] }}
        style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

        {/* ── Brand header ── */}
        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, textDecoration: "none" }}>
            <img src="/logo.png" alt="Vidhyrathi"
              style={{ height: 56, width: "auto", objectFit: "contain", display: "block" }}/>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 26, color: "#2C241B", margin: 0, lineHeight: 1.2 }}>
            {mode === "login"  ? "Welcome Back" :
             mode === "signup" ? "Create Account" :
             "Reset Password"}
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#8F857A", marginTop: 6 }}>
            {mode === "login"  ? "Sign in to your Vidhyrathi account" :
             mode === "signup" ? "Join India's premium gifting brand" :
             "We'll send you a reset link"}
          </p>
        </div>

        {/* ── Card ── */}
        <div style={card}>

          {/* ── Signup done ── */}
          {signupDone ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(200,162,58,0.12)", border: "1px solid rgba(200,162,58,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Mail size={24} style={{ color: "#C8A23A" }}/>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 20, color: "#2C241B", marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6F655A", lineHeight: 1.6, marginBottom: 4 }}>
                We sent a confirmation link to
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "#C8A23A", marginBottom: 20 }}>{form.email}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", marginBottom: 24, lineHeight: 1.6 }}>
                Open that email and click the confirmation link to activate your account, then come back and sign in.
              </p>
              <button onClick={() => switchMode("login")} className="btn-primary" style={{ width: "100%", height: 50, fontSize: 14 }}>
                Go to Sign In
              </button>
            </div>

          ) : mode === "forgot" ? (
            <AnimatePresence mode="wait">
              <motion.div key="forgot" initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-16 }}>
                <button onClick={() => switchMode("login")}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6F655A", background: "none", border: "none", marginBottom: 24, cursor: "pointer", padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                  onMouseLeave={e => e.currentTarget.style.color = "#6F655A"}>
                  <ArrowLeft size={15}/> Back to Sign In
                </button>

                {resetSent ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(46,125,50,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Mail size={22} style={{ color: "#2E7D32" }}/>
                    </div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 16, color: "#2C241B", marginBottom: 8 }}>Reset link sent!</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6F655A", marginBottom: 24 }}>
                      Check <span style={{ color: "#C8A23A", fontWeight: 600 }}>{form.email}</span> for the reset link.
                    </p>
                    <button onClick={() => switchMode("login")} className="btn-primary" style={{ width: "100%", height: 50 }}>
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#6F655A", margin: 0, lineHeight: 1.6 }}>
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <Field label="Email Address" type="email" value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="your@email.com" icon={<Mail size={16}/>} error={errors.email}/>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", height: 50, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                      {loading ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/> : "Send Reset Link"}
                    </button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

          ) : (
            <AnimatePresence mode="wait">
              <motion.div key="auth" initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:16 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Google */}
                <button onClick={handleGoogle} disabled={gLoading}
                  style={{
                    width: "100%", height: 50, borderRadius: 12,
                    border: "1.5px solid #E7DED1", background: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: "#2C241B",
                    cursor: "pointer", transition: "all 0.2s", opacity: gLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,36,27,0.08)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.boxShadow = "none" }}>
                  {gLoading ? <div style={{ width: 18, height: 18, border: "2px solid #E7DED1", borderTopColor: "#C8A23A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/> : <GoogleIcon/>}
                  Continue with Google
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "#E7DED1" }}/>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", whiteSpace: "nowrap" }}>or use email</span>
                  <div style={{ flex: 1, height: 1, background: "#E7DED1" }}/>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", background: "#F3EEE6", borderRadius: 12, padding: 4, gap: 4 }}>
                  {["login","signup"].map(m => (
                    <button key={m} onClick={() => switchMode(m)}
                      style={{
                        flex: 1, height: 40, borderRadius: 9, border: "none", cursor: "pointer",
                        fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14,
                        transition: "all 0.2s",
                        background: mode === m ? "#FFFFFF" : "transparent",
                        color: mode === m ? "#2C241B" : "#8F857A",
                        boxShadow: mode === m ? "0 1px 6px rgba(44,36,27,0.1)" : "none",
                      }}>
                      {m === "login" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {mode === "signup" && (
                    <Field label="Full Name" type="text" value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="Your full name" icon={<User size={16}/>} error={errors.name}/>
                  )}

                  <Field label="Email Address" type="email" value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="your@email.com" icon={<Mail size={16}/>} error={errors.email}/>

                  <Field label="Password" type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="Min. 8 characters" icon={<Lock size={16}/>}
                    error={errors.password}
                    hint={
                      mode === "login" && (
                        <button type="button" onClick={() => switchMode("forgot")}
                          style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#C8A23A", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                          Forgot password?
                        </button>
                      )
                    }
                    rightEl={
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#8F857A", display: "flex", padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                        onMouseLeave={e => e.currentTarget.style.color = "#8F857A"}>
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    }
                  />

                  <button type="submit" disabled={loading} className="btn-primary"
                    style={{ width: "100%", height: 52, fontSize: 15, marginTop: 4, opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading
                      ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                      : <><Sparkles size={15}/>{mode === "login" ? "Sign In" : "Create Account"}</>}
                  </button>
                </form>

                {/* Toggle hint */}
                <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A", margin: 0 }}>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A23A", fontWeight: 600, fontSize: 13, fontFamily: "'Inter',sans-serif", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </p>

              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Back to shop */}
        <Link to="/" style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
          onMouseLeave={e => e.currentTarget.style.color = "#8F857A"}>
          <ArrowLeft size={13}/> Back to shop
        </Link>

      </motion.div>
    </div>
  )
}
