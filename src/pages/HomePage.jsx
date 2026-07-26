import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Star, ShieldCheck, Truck, Award, Heart, ChevronLeft, ChevronRight, Upload, Eye, ShoppingBag, Package, CheckCircle, Sparkles, Zap, Gift, Pen, Image } from "lucide-react"
import { fetchProducts } from "../services/productService"
import { formatINR } from "../utils/format"
import PromoBanners from "../components/PromoBanners"
import ReviewsSection from "../components/ReviewsSection"
import { getSetting } from "../services/settingsService"

/* ── Reveal on scroll ── */
const fadeUp = { hidden:{ opacity:0, y:28 }, show:{ opacity:1, y:0, transition:{ duration:0.6, ease:[0.25,0.46,0.45,0.94] } } }
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }

function Reveal({ children, className="", delay=0, style={} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:"-60px" })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView?"show":"hidden"} transition={{ delay }} className={className} style={style}>
      {children}
    </motion.div>
  )
}

/* ── Static content ── */
const DEFAULT_HERO_IMGS = [
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=80",
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
]

const STATS = [
  { value:"50,000+", label:"Happy Customers", icon:<Heart size={22}/> },
  { value:"1,00,000+", label:"Orders Delivered", icon:<Package size={22}/> },
  { value:"4.9 ★", label:"Avg. Rating", icon:<Star size={22}/> },
  { value:"48 Hours", label:"Express Dispatch", icon:<Zap size={22}/> },
]

const CATEGORIES = [
  { name:"Photo Frames",    img:"https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80", to:"/products?category=Photo+Frames" },
  { name:"Mugs & Bottles",  img:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80", to:"/products?category=Mugs" },
  { name:"T-Shirts",        img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", to:"/products?category=T-Shirts" },
  { name:"Keychains",       img:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80", to:"/products?category=Keychains" },
  { name:"Wallets",         img:"https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", to:"/products?category=Wallets" },
  { name:"Mobile Pouches",  img:"https://images.unsplash.com/photo-1609942071884-qddbf0b9c69d?w=500&q=80", to:"/products?category=Mobile+Pouches" },
  { name:"Corporate Gifts", img:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80", to:"/products?category=Corporate+Gifts" },
  { name:"Gift Boxes",      img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80", to:"/products?category=Gift+Boxes" },
]

const HOW_STEPS = [
  { n:"01", title:"Choose Product",    desc:"Browse our curated collection",           icon:<ShoppingBag size={22}/> },
  { n:"02", title:"Upload Your Photo", desc:"Add a cherished image",                   icon:<Upload size={22}/> },
  { n:"03", title:"Personalise",       desc:"Add names, dates, messages",              icon:<Pen size={22}/> },
  { n:"04", title:"Preview Design",    desc:"Live preview before confirming",          icon:<Eye size={22}/> },
  { n:"05", title:"Place Order",       desc:"Secure checkout, multiple payment modes", icon:<CheckCircle size={22}/> },
  { n:"06", title:"Delivered!",        desc:"Gift-ready packaging at your doorstep",   icon:<Gift size={22}/> },
]

const WHY_US = [
  { title:"Premium Materials",    desc:"Museum-grade acrylic, solid walnut, premium fabric",    icon:<Award size={20}/> },
  { title:"HD Printing",          desc:"Archival-quality 1440 DPI for vivid colour",             icon:<Image size={20}/> },
  { title:"Handcrafted Finish",   desc:"Every piece reviewed by our craftspeople",               icon:<Sparkles size={20}/> },
  { title:"Gift-Ready Packaging", desc:"Luxury box with ribbon — no extra charge",               icon:<Gift size={20}/> },
  { title:"Fast Delivery",        desc:"Same-day dispatch. 1–3 business day delivery",           icon:<Truck size={20}/> },
  { title:"Secure Payments",      desc:"256-bit SSL. UPI, cards, net banking accepted",          icon:<ShieldCheck size={20}/> },
  { title:"Easy Returns",         desc:"Hassle-free 7-day return policy",                        icon:<ArrowRight size={20}/> },
  { title:"24×7 Support",         desc:"Our team is always a message away",                      icon:<Heart size={20}/> },
]

const TESTIMONIALS = [
  { name:"Priya Sharma",  city:"Mumbai",    product:"Personalised Photo Frame",
    review:"Absolutely blown away by the quality. The golden finish is breathtaking — my parents were in tears when they saw it.",
    avatar:"https://i.pravatar.cc/80?img=47" },
  { name:"Rahul Mehta",   city:"Bangalore", product:"Wooden Engraved Frame",
    review:"The engraving surpassed all expectations. Crystal clear, premium finish. My colleague was genuinely moved.",
    avatar:"https://i.pravatar.cc/80?img=12" },
  { name:"Sneha Patel",   city:"Ahmedabad", product:"Corporate Gift Sets",
    review:"Ordered 50 corporate gifts. Every piece was flawless. The team went above and beyond.",
    avatar:"https://i.pravatar.cc/80?img=45" },
  { name:"Arjun Nair",    city:"Chennai",   product:"Custom Photo Mug",
    review:"Sharp photo print, gorgeous packaging. The perfect birthday surprise for my mum — she loved it.",
    avatar:"https://i.pravatar.cc/80?img=23" },
  { name:"Kavya Reddy",   city:"Hyderabad", product:"Printed T-Shirt",
    review:"Outstanding print quality. No cracks after multiple washes. Exactly as previewed. Truly premium.",
    avatar:"https://i.pravatar.cc/80?img=56" },
]

const GALLERY = [
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
  "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&q=80",
]

const FB = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80"

/* ── Section heading component ── */
function SectionHead({ eyebrow, title, subtitle, center=false, action=null }) {
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <span className="section-label">{eyebrow}</span>
      <h2 className="heading-xl">{title}</h2>
      <div className={`gold-divider${center?" gold-divider-center":""}`} />
      {subtitle && (
        <p className="body-lg" style={{ marginTop:14, maxWidth: center ? 520 : 540, ...(center ? { margin:"14px auto 0" } : {}) }}>
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop:10 }}>{action}</div>}
    </div>
  )
}

/* ── Mini card (Best Sellers horizontal scroll) ── */
function MiniCard({ product }) {
  const [wished, setWished] = useState(false)
  return (
    <div className="card-lux group relative overflow-hidden flex-shrink-0"
      style={{ width:"clamp(160px, 42vw, 240px)", cursor:"pointer" }}>
      <div className="img-zoom relative overflow-hidden rounded-t-[20px] bg-[#F3EEE6]" style={{ aspectRatio:"1" }}>
        <img src={product.images?.[0]||FB} alt={product.name}
          className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>
        <div className="product-overlay rounded-t-[20px]"/>
        <button onClick={()=>setWished(w=>!w)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 shadow-warm-sm border border-[#E7DED1]">
          <Heart size={13} className={wished?"fill-[#D9534F] text-[#D9534F]":"text-[#8F857A]"}/>
        </button>
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Link to={`/products/${product.id}`} className="btn-primary w-full justify-center" style={{ height:38, fontSize:11 }}>
            Personalise
          </Link>
        </div>
      </div>
      <div style={{ padding:"12px 14px 14px" }}>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8F857A", marginBottom:3, lineHeight:1 }}>{product.category}</p>
        <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:13, color:"#2C241B", lineHeight:1.35, marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.name}</h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:14, color:"#2C241B" }}>{formatINR(product.price)}</span>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            <Star size={11} className="fill-[#C8A23A] text-[#C8A23A]"/>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#8F857A" }}>4.9</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Featured product grid card ── */
function FeatCard({ product }) {
  const [wished, setWished] = useState(false)
  return (
    <div className="card-lux group relative overflow-hidden h-full flex flex-col">
      <div className="img-zoom relative overflow-hidden rounded-t-[20px] bg-[#F3EEE6]" style={{ aspectRatio:"4/3" }}>
        <img src={product.images?.[0]||FB} alt={product.name}
          className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>
        <div className="product-overlay rounded-t-[20px]"/>
        <button onClick={()=>setWished(w=>!w)}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 shadow-warm-sm border border-[#E7DED1]">
          <Heart size={14} className={wished?"fill-[#D9534F] text-[#D9534F]":"text-[#8F857A]"}/>
        </button>
        {product.compare_price>product.price && (
          <span className="absolute top-3 left-3 z-10 badge badge-bronze">
            {Math.round((1-product.price/product.compare_price)*100)}% Off
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Link to={`/products/${product.id}`} className="btn-primary flex-1 justify-center" style={{ height:40, fontSize:12 }}>Personalise</Link>
          <Link to={`/products/${product.id}`} className="btn-icon flex-shrink-0" style={{ background:"rgba(255,255,255,0.9)" }}>
            <Eye size={14} className="text-[#2C241B]"/>
          </Link>
        </div>
      </div>
      <div style={{ padding:"14px 16px 16px", flex:1, display:"flex", flexDirection:"column" }}>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8F857A", marginBottom:4, lineHeight:1 }}>{product.category}</p>
        <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:14, color:"#2C241B", lineHeight:1.35, marginBottom:"auto", paddingBottom:10, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }} className="group-hover:text-[#A88422] transition-colors">{product.name}</h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:6, minWidth:0 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:16, color:"#2C241B" }}>{formatINR(product.price)}</span>
            {product.compare_price>product.price && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#8F857A", textDecoration:"line-through" }}>{formatINR(product.compare_price)}</span>}
          </div>
          <div style={{ display:"flex", gap:1.5, flexShrink:0 }}>
            {[...Array(5)].map((_,i)=><Star key={i} size={11} className="fill-[#C8A23A] text-[#C8A23A]"/>)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   HOMEPAGE
══════════════════════════════════════════ */
export default function HomePage() {
  const [products,  setProducts]  = useState([])
  const [tIdx,      setTIdx]      = useState(0)
  const scrollRef                 = useRef(null)
  const [heroImg,   setHeroImg]   = useState(0)
  const [heroImgs,  setHeroImgs]  = useState(DEFAULT_HERO_IMGS)

  useEffect(()=>{ fetchProducts({limit:12}).then(r=>setProducts(r||[])).catch(()=>{}) },[])
  useEffect(()=>{ const t=setInterval(()=>setTIdx(i=>(i+1)%TESTIMONIALS.length),5500); return()=>clearInterval(t) },[])
  useEffect(()=>{ const t=setInterval(()=>setHeroImg(i=>(i+1)%heroImgs.length),4000); return()=>clearInterval(t) },[heroImgs.length])

  // Load hero images from admin settings
  useEffect(()=>{
    getSetting('hero_images').then(val=>{
      if(val){ try{ const p=JSON.parse(val); if(Array.isArray(p)&&p.length){ setHeroImgs(p); setHeroImg(0) } }catch{} }
    }).catch(()=>{})
  },[])

  const featured    = products.filter(p=>p.is_featured).slice(0,8)
  const bestSellers = products.slice(0,10)

  return (
    <>
      <Helmet>
        <title>Vidhyrathi — Premium Personalised Gifts</title>
        <meta name="description" content="India's most loved personalised gifting brand. Custom photo frames, mugs, T-shirts, corporate gifts — crafted with love, delivered with care."/>
      </Helmet>

      {/* ════════ 1. HERO ════════ */}
      <section style={{ background:"#F8F5F0", paddingTop:36, paddingBottom:48, overflow:"hidden" }}>
        <div className="container-lux">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left — copy */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:[0.25,0.46,0.45,0.94]}}
              className="flex flex-col items-start gap-6 sm:gap-7">
              <div>
                <span className="eyebrow">Premium Personalised Gifts</span>
                <h1 className="heading-xl mb-3 sm:mb-4" style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)", maxWidth:560, lineHeight:1.12 }}>
                  Every Gift<br/>
                  <em className="text-gold-accent not-italic">Tells A Story.</em>
                </h1>
                <p className="body-lg" style={{ maxWidth:520, fontSize:"clamp(0.9rem,1.8vw,1.05rem)" }}>
                  Create personalised gifts that preserve memories forever. Beautifully crafted for birthdays, anniversaries, weddings, festivals, and every special occasion.
                </p>
              </div>

              {/* Mobile Hero Image Carousel */}
              <div className="block lg:hidden w-full">
                <div className="relative rounded-[24px] overflow-hidden shadow-warm-xl aspect-[4/3] sm:aspect-[16/10]">
                  <AnimatePresence mode="wait">
                    <motion.img key={heroImg} src={heroImgs[heroImg]} alt="Premium Gift"
                      initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:0.7}}
                      className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>
                  </AnimatePresence>
                  <div className="absolute inset-0" style={{ background:"linear-gradient(160deg, transparent 55%, rgba(44,36,27,0.35) 100%)" }}/>
                  <div className="absolute left-3 top-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-warm-md border border-[#E7DED1] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(200,162,58,0.12)" }}>
                      <Star size={14} className="fill-[#C8A23A] text-[#C8A23A]"/>
                    </div>
                    <div>
                      <p className="font-inter font-bold text-[13px] text-[#2C241B] leading-none">4.9 ★</p>
                      <p className="font-inter text-[9.5px] text-[#8F857A] mt-0.5">50K+ Reviews</p>
                    </div>
                  </div>
                  <div className="absolute right-3 bottom-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-warm-md border border-[#E7DED1] flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32] flex-shrink-0"/>
                    <p className="font-inter font-semibold text-[11px] text-[#2C241B]">48hr Express Delivery</p>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="w-full max-w-md py-1">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {[
                    { icon:<Award size={13.5}/>,      t:"Premium Quality"  },
                    { icon:<ShieldCheck size={13.5}/>, t:"Secure Payments"  },
                    { icon:<Sparkles size={13.5}/>,    t:"Made in India"    },
                    { icon:<Truck size={13.5}/>,       t:"Fast Delivery"    },
                  ].map(b => (
                    <div key={b.t} className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-semibold text-center" style={{
                      background:"rgba(200,162,58,0.08)",
                      border:"1px solid rgba(200,162,58,0.24)",
                      color:"#997316",
                      fontFamily:"'Inter',sans-serif",
                      whiteSpace:"nowrap",
                    }}>
                      {b.icon}<span className="truncate">{b.t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-1">
                <Link to="/products" className="btn-primary w-full sm:w-auto justify-center" style={{ height:48, padding:"0 28px", fontSize:13 }}>
                  <Sparkles size={14}/>Customise Now
                </Link>
                <Link to="/products" className="btn-secondary w-full sm:w-auto justify-center" style={{ height:48, padding:"0 26px", fontSize:13 }}>
                  Explore Collection<ArrowRight size={14}/>
                </Link>
              </div>
            </motion.div>

            {/* Right — Desktop Image Carousel */}
            <motion.div initial={{opacity:0,x:32}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.15,ease:[0.25,0.46,0.45,0.94]}}
              className="relative hidden lg:block w-full">
              <div className="relative rounded-[32px] overflow-hidden shadow-warm-xl aspect-[5/4]">
                <AnimatePresence mode="wait">
                  <motion.img key={heroImg} src={heroImgs[heroImg]} alt="Premium Gift"
                    initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:0.7}}
                    className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>
                </AnimatePresence>
                <div className="absolute inset-0" style={{ background:"linear-gradient(160deg, transparent 55%, rgba(44,36,27,0.35) 100%)" }}/>
              </div>

              {/* Rating badge */}
              <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{delay:0.9,duration:0.5}}
                className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl px-5 py-4 shadow-warm-lg anim-float"
                style={{ border:"1px solid #E7DED1" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(200,162,58,0.12)" }}>
                    <Star size={18} className="fill-[#C8A23A] text-[#C8A23A]"/>
                  </div>
                  <div>
                    <p className="font-inter font-bold text-[18px] text-[#2C241B] leading-none">4.9 ★</p>
                    <p className="font-inter text-[12px] text-[#8F857A] mt-0.5">50K+ Reviews</p>
                  </div>
                </div>
              </motion.div>

              {/* Delivery badge */}
              <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{delay:1.1,duration:0.5}}
                className="absolute -right-6 bottom-16 bg-white rounded-2xl px-4 py-3 shadow-warm-lg anim-float" style={{ border:"1px solid #E7DED1", animationDelay:"1s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2E7D32] flex-shrink-0"/>
                  <p className="font-inter font-semibold text-[13px] text-[#2C241B]">48hr Express Delivery</p>
                </div>
              </motion.div>

              {/* Carousel dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroImgs.map((_,i)=>(
                  <button key={i} onClick={()=>setHeroImg(i)}
                    className={`rounded-full transition-all ${i===heroImg?"w-5 h-2 bg-white":"w-2 h-2 bg-white/50"}`}/>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ 2. TRUST MARQUEE ════════ */}
      <div style={{ background:"#2C241B", padding:"clamp(14px,2.5vw,20px) 0", overflow:"hidden", borderTop:"1px solid rgba(200,162,58,0.2)", borderBottom:"1px solid rgba(200,162,58,0.2)" }}>
        <div className="marquee-track anim-marquee">
          {[...Array(4)].map((_,i)=>(
            <span key={i} className="inline-flex items-center">
              {["Premium Quality Guaranteed","50,000+ Happy Customers","Made With Love In India","100% Personalised","Gift-Ready Packaging","Fast & Secure Delivery"].map(text=>(
                <span key={text} style={{ display:"flex", alignItems:"center", gap:10, padding:"0 clamp(16px,3vw,36px)", fontFamily:"'Inter',sans-serif", fontSize:"clamp(10px,1.4vw,12px)", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)", whiteSpace:"nowrap" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#C8A23A", flexShrink:0 }}/>
                  {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ 3. STATS ════════ */}
      <section style={{ background:"#F3EEE6", borderBottom:"1px solid #E7DED1" }}>
        <div className="container-lux" style={{ paddingTop:"clamp(32px,5vw,56px)", paddingBottom:"clamp(32px,5vw,56px)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"clamp(12px,2.5vw,24px)" }}
            className="lg:grid-cols-4">
            {STATS.map((s,i)=>(
              <Reveal key={s.label} delay={i*0.07}>
                <div className="stat-card">
                  <div style={{ width:"clamp(40px,5vw,52px)", height:"clamp(40px,5vw,52px)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto clamp(12px,2vw,16px)", background:"rgba(200,162,58,0.10)", border:"1px solid rgba(200,162,58,0.2)", color:"#C8A23A" }}>
                    {s.icon}
                  </div>
                  <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:800, fontSize:"clamp(1.5rem,3.5vw,2.2rem)", color:"#2C241B", lineHeight:1, margin:0, marginBottom:6 }}>{s.value}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(10px,1.4vw,12px)", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#8F857A", margin:0 }}>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 4. PROMO BANNERS ════════ */}
      <div style={{ background:"#F8F5F0", paddingTop:"clamp(20px,3vw,32px)", paddingBottom:"clamp(4px,1vw,8px)" }}>
        <PromoBanners />
      </div>

      {/* ════════ 5. CATEGORIES ════════ */}
      <section style={{ background:"#F8F5F0" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ marginBottom:"clamp(24px,4vw,40px)" }}>
            <SectionHead
              eyebrow="Our Collections"
              title={<>Shop By <span className="text-gold-accent">Category</span></>}
              subtitle="From cherished photo memories to impressive corporate gifts — find the perfect personalised gift for every occasion."
            />
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true,margin:"-50px"}}
            style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:24 }}
            className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 lg:gap-5">
            {CATEGORIES.map(cat=>(
              <motion.div key={cat.name} variants={fadeUp}>
                <Link to={cat.to} className="group block relative overflow-hidden rounded-[20px] bg-[#F3EEE6] shadow-warm-sm" style={{ aspectRatio:"4/3", display:"block" }}>
                  <div className="img-zoom absolute inset-0">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>
                  </div>
                  {/* gradient only at bottom for text legibility */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(180deg, transparent 35%, rgba(15,11,8,0.55) 62%, rgba(10,7,4,0.88) 100%)" }}/>
                  {/* gold border hover */}
                  <div className="absolute inset-0 rounded-[20px] border-2 border-transparent group-hover:border-[rgba(200,162,58,0.5)] transition-all duration-300 pointer-events-none"/>
                  {/* text label — same padding as FeatCard info area */}
                  <div className="absolute left-0 right-0 bottom-0 z-10 pointer-events-none" style={{ padding:"0 14px 14px" }}>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", margin:"0 0 3px", lineHeight:1 }}>
                      Gifts
                    </p>
                    <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:13, lineHeight:1.3, color:"#FFFFFF", margin:0 }} className="group-hover:text-[#F3D37A] transition-colors">
                      {cat.name}
                    </h3>
                    <p style={{ display:"flex", alignItems:"center", gap:4, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#E4C55A", marginTop:4 }} className="group-hover:translate-x-1 transition-transform">
                      Shop Now <ArrowRight size={10}/>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ 6. FEATURED PRODUCTS ════════ */}
      <section style={{ background:"#F3EEE6", borderTop:"1px solid #E7DED1" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ marginBottom:"clamp(24px,4vw,48px)" }}>
            <div style={{ display:"flex", flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <SectionHead
                eyebrow="Handpicked For You"
                title={<>Featured <span className="text-gold-accent">Products</span></>}
              />
              <Link to="/products" className="view-all" style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:14, color:"#C8A23A", textDecoration:"none", flexShrink:0, whiteSpace:"nowrap", marginBottom:6 }}
                onMouseEnter={e=>e.currentTarget.style.gap="10px"} onMouseLeave={e=>e.currentTarget.style.gap="6px"}>
                View All Products<ArrowRight size={14}/>
              </Link>
            </div>
          </Reveal>
          {featured.length>0 ? (
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true,margin:"-50px"}}
              style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}
              className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 lg:gap-5">
              {featured.map(p=>(
                <motion.div key={p.id} variants={fadeUp} style={{ height:"100%" }}><FeatCard product={p}/></motion.div>
              ))}
            </motion.div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}
              className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 lg:gap-5">
              {[...Array(8)].map((_,i)=>(
                <div key={i} className="card-lux overflow-hidden">
                  <div className="skeleton" style={{ aspectRatio:"4/3", borderRadius:"20px 20px 0 0" }}/>
                  <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
                    <div className="skeleton" style={{ height:10, width:80, borderRadius:6 }}/>
                    <div className="skeleton" style={{ height:14, width:"100%", borderRadius:6 }}/>
                    <div className="skeleton" style={{ height:18, width:100, borderRadius:6 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ 7. HOW IT WORKS ════════ */}
      <section style={{ background:"#F8F5F0" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ textAlign:"center", marginBottom:"clamp(32px,5vw,56px)" }}>
            <SectionHead
              eyebrow="Simple Process"
              title={<>How It <span className="text-gold-accent">Works</span></>}
              subtitle="Creating your perfect personalised gift takes just a few simple steps."
              center
            />
          </Reveal>
          <div style={{ position:"relative" }}>
            {/* Connecting line desktop */}
            <div className="hidden lg:block" style={{ position:"absolute", top:40, left:"8.33%", right:"8.33%", height:1, background:"linear-gradient(90deg, transparent, rgba(200,162,58,0.25) 20%, rgba(200,162,58,0.25) 80%, transparent)", pointerEvents:"none" }}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}
              className="md:grid-cols-3 lg:grid-cols-6 sm:gap-4 lg:gap-6">
              {HOW_STEPS.map((step,i)=>(
                <Reveal key={step.n} delay={i*0.07}>
                  <div className="group" style={{ textAlign:"center" }}>
                    <div style={{ position:"relative", width:"clamp(64px,9vw,80px)", height:"clamp(64px,9vw,80px)", borderRadius:20, margin:"0 auto clamp(14px,2.5vw,20px)", display:"flex", alignItems:"center", justifyContent:"center", background:"#FFFFFF", border:"1px solid #E7DED1", boxShadow:"0 2px 16px rgba(44,36,27,0.07)", transition:"all 0.3s ease" }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,162,58,0.4)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(200,162,58,0.18)" }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor="#E7DED1"; e.currentTarget.style.boxShadow="0 2px 16px rgba(44,36,27,0.07)" }}>
                      <span style={{ position:"absolute", top:-10, right:-10, width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#FFFFFF", fontFamily:"'Inter',sans-serif", background:"linear-gradient(135deg, #D4AF37, #A88422)", boxShadow:"0 2px 8px rgba(200,162,58,0.4)" }}>{step.n}</span>
                      <span style={{ color:"#C8A23A" }}>{step.icon}</span>
                    </div>
                    <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:"clamp(12px,1.6vw,14px)", color:"#2C241B", margin:"0 0 6px" }}>{step.title}</h3>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(11px,1.3vw,12px)", color:"#8F857A", lineHeight:1.55, margin:0 }}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal style={{ textAlign:"center", marginTop:"clamp(32px,5vw,56px)" }}>
            <Link to="/products" className="btn-primary" style={{ height:52, padding:"0 36px", fontSize:14 }}>
              <Sparkles size={15}/>Start Creating Your Gift
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ════════ 8. WHY CHOOSE US ════════ */}
      <section style={{ background:"#F3EEE6", borderTop:"1px solid #E7DED1" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ marginBottom:"clamp(24px,4vw,48px)" }}>
            <SectionHead
              eyebrow="Our Promise"
              title={<>Why Choose <span className="text-gold-accent">Vidhyrathi</span></>}
              subtitle="We don't just make gifts — we craft unforgettable experiences that last a lifetime."
            />
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true,margin:"-50px"}}
            style={{ display:"grid", gridTemplateColumns:"repeat(1,1fr)", gap:12 }}
            className="sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-5">
            {WHY_US.map(item=>(
              <motion.div key={item.title} variants={fadeUp} style={{ height:"100%" }}>
                <div className="why-card">
                  <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(200,162,58,0.09)", border:"1px solid rgba(200,162,58,0.2)", color:"#A88422" }}>
                    {item.icon}
                  </div>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:14, color:"#2C241B", margin:0, lineHeight:1.3 }}>{item.title}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"#6F655A", margin:0, lineHeight:1.65 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ 9. BEST SELLERS ════════ */}
      <section style={{ background:"#F8F5F0" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ marginBottom:"clamp(20px,3.5vw,36px)" }}>
            <div style={{ display:"flex", flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <SectionHead eyebrow="Top Picks" title={<>Best <span className="text-gold-accent">Sellers</span></>} />
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginBottom:6 }}>
                <button onClick={()=>scrollRef.current?.scrollBy({left:-280,behavior:"smooth"})} className="btn-icon" style={{ width:38, height:38 }}><ChevronLeft size={16}/></button>
                <button onClick={()=>scrollRef.current?.scrollBy({left:280,behavior:"smooth"})}  className="btn-icon" style={{ width:38, height:38 }}><ChevronRight size={16}/></button>
                <Link to="/products" style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:13, color:"#C8A23A", textDecoration:"none", whiteSpace:"nowrap" }}>
                  View All<ArrowRight size={13}/>
                </Link>
              </div>
            </div>
          </Reveal>
          <div ref={scrollRef} className="h-carousel" style={{ paddingBottom:12 }}>
            {(bestSellers.length>0?bestSellers:[...Array(6)].map((_,i)=>({id:i,name:`Gift ${i+1}`,category:"Gift",price:499+i*100,images:[]}))).map(p=>(
              <MiniCard key={p.id} product={p}/>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 10. TESTIMONIALS ════════ */}
      <section style={{ background:"#F3EEE6", borderTop:"1px solid #E7DED1" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ textAlign:"center", marginBottom:"clamp(28px,4vw,48px)" }}>
            <SectionHead
              eyebrow="Customer Stories"
              title={<>What Our <span className="text-gold-accent">Customers Say</span></>}
              center
            />
          </Reveal>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            {/* Featured rotating card */}
            <AnimatePresence mode="wait">
              <motion.div key={tIdx} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.4}}
                className="card-lux" style={{ padding:"clamp(24px,5vw,56px)", position:"relative", overflow:"hidden", textAlign:"center", marginBottom:24 }}>
                <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2, background:"linear-gradient(90deg, transparent, #C8A23A, transparent)" }}/>
                <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:20 }}>
                  {[...Array(5)].map((_,i)=><Star key={i} size={20} className="fill-[#C8A23A] text-[#C8A23A]"/>)}
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1rem,2.5vw,1.3rem)", fontStyle:"italic", fontWeight:400, lineHeight:1.8, color:"#2C241B", textAlign:"center", maxWidth:540, margin:"0 auto clamp(24px,4vw,36px)" }}>
                  "{TESTIMONIALS[tIdx].review}"
                </p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
                  <img src={TESTIMONIALS[tIdx].avatar} alt={TESTIMONIALS[tIdx].name} style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:"2px solid #E7DED1", flexShrink:0, boxShadow:"0 2px 12px rgba(200,162,58,0.2)" }}/>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:15, color:"#2C241B", lineHeight:1.3, margin:0 }}>{TESTIMONIALS[tIdx].name}</p>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#8F857A", margin:"3px 0 0", lineHeight:1 }}>{TESTIMONIALS[tIdx].city}&nbsp;·&nbsp;{TESTIMONIALS[tIdx].product}</p>
                  </div>
                  <span className="badge badge-success"><CheckCircle size={9}/>&nbsp;Verified</span>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:32 }}>
              {TESTIMONIALS.map((_,i)=>(
                <button key={i} onClick={()=>setTIdx(i)} style={{ width:i===tIdx?24:8, height:8, borderRadius:999, border:"none", cursor:"pointer", padding:0, background:i===tIdx?"#C8A23A":"#E7DED1", transition:"all 0.3s ease" }}/>
              ))}
            </div>
            {/* Mini cards — responsive 1col mobile, 3col desktop */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(1,1fr)", gap:12 }} className="sm:grid-cols-3 sm:gap-4">
              {TESTIMONIALS.slice(0,3).map((t,i)=>(
                <Reveal key={t.name} delay={i*0.07}>
                  <button onClick={()=>setTIdx(i)} style={{ width:"100%", textAlign:"left", padding:"clamp(14px,2.5vw,20px)", background:"#FAF8F3", border:`1px solid ${tIdx===i?"rgba(200,162,58,0.45)":"#E7DED1"}`, borderRadius:20, cursor:"pointer", transition:"all 0.3s ease", display:"flex", flexDirection:"column", gap:10, boxShadow:tIdx===i?"0 4px 20px rgba(200,162,58,0.12)":"0 2px 10px rgba(44,36,27,0.05)" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,162,58,0.45)"; e.currentTarget.style.transform="translateY(-3px)" }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=tIdx===i?"rgba(200,162,58,0.45)":"#E7DED1"; e.currentTarget.style.transform="none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={t.avatar} alt={t.name} style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:"1px solid #E7DED1", flexShrink:0 }}/>
                      <div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:13, color:"#2C241B", margin:0, lineHeight:1.3 }}>{t.name}</p>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#8F857A", margin:"2px 0 0", lineHeight:1 }}>{t.city}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:2 }}>
                      {[...Array(5)].map((_,j)=><Star key={j} size={11} className="fill-[#C8A23A] text-[#C8A23A]"/>)}
                    </div>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#6F655A", lineHeight:1.65, fontStyle:"italic", margin:0, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>"{t.review}"</p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 11. REVIEWS SECTION ════════ */}
      <section style={{ background:"#F8F5F0" }} className="section-gap">
        <ReviewsSection />
      </section>

      {/* ════════ 12. INSTAGRAM GALLERY ════════ */}
      <section style={{ background:"#F3EEE6", borderTop:"1px solid #E7DED1" }} className="section-gap">
        <div className="container-lux">
          <Reveal style={{ textAlign:"center", marginBottom:"clamp(28px,4vw,48px)" }}>
            <SectionHead
              eyebrow="@vidhyrathi"
              title={<>Follow Our <span className="text-gold-accent">Story</span></>}
              subtitle="Tag us with #vidhyrathi to be featured in our community gallery."
              center
            />
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }} className="sm:grid-cols-3 md:grid-cols-4 sm:gap-3 md:gap-4">
            {GALLERY.map((img,i)=>(
              <Reveal key={i} delay={i*0.04}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className={`group relative block overflow-hidden rounded-[18px] bg-[#F3EEE6] shadow-warm-sm${i===0?" sm:col-span-2 sm:row-span-2":""}`}
                  style={{ aspectRatio:"1", display:"block" }}>
                  <div className="img-zoom absolute inset-0">
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" onError={e=>e.target.src=FB}/>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[18px] flex items-center justify-center" style={{ background:"rgba(200,162,58,0.15)" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(44,36,27,0.16)" }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ color:"#C8A23A" }}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 13. CORPORATE GIFTS ════════ */}
      <section style={{ background:"#F8F5F0" }} className="section-gap">
        <div className="container-lux">
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"clamp(32px,5vw,64px)", alignItems:"center" }} className="lg:grid-cols-2">
            <Reveal>
              <SectionHead
                eyebrow="Corporate Solutions"
                title={<>Premium Corporate<br/><span className="text-gold-accent">Gifting Solutions</span></>}
                subtitle="Personalised gifts for employees, clients, conferences & events. Brand your gifting at scale — minimum 10 pieces, maximum impact."
              />
              <div style={{ display:"flex", flexWrap:"wrap", gap:"clamp(10px,2vw,16px)", margin:"clamp(20px,3vw,32px) 0" }}>
                {["Bulk Orders","Brand Customisation","Same-Day Dispatch","Dedicated Manager"].map(f=>(
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, color:"#6F655A" }}>
                    <CheckCircle size={14} style={{ color:"#C8A23A", flexShrink:0 }}/>{f}
                  </div>
                ))}
              </div>
              <Link to="/contact" className="btn-primary" style={{ height:52, padding:"0 36px", fontSize:14 }}>
                Request Bulk Quote<ArrowRight size={15}/>
              </Link>
            </Reveal>
            <Reveal delay={0.15}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {heroImgs.concat(GALLERY.slice(0,1)).slice(0,4).map((img,i)=>(
                  <div key={i} className="img-zoom overflow-hidden rounded-[20px] shadow-warm-md bg-[#F3EEE6]" style={{ aspectRatio:"1" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" onError={e=>e.target.src=FB}/>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════ 14. BOTTOM MARQUEE ════════ */}
      <div style={{ background:"#2C241B", borderTop:"1px solid rgba(200,162,58,0.2)", padding:"clamp(14px,2.5vw,20px) 0", overflow:"hidden" }}>
        <div className="marquee-track anim-marquee">
          {[...Array(4)].map((_,i)=>(
            <span key={i} className="inline-flex items-center">
              {["Premium Quality Guaranteed","50,000+ Happy Customers","Made With Love In India","100% Personalised","Gift-Ready Packaging","Fast & Secure Delivery"].map(text=>(
                <span key={text} style={{ display:"flex", alignItems:"center", gap:10, padding:"0 clamp(16px,3vw,36px)", fontFamily:"'Inter',sans-serif", fontSize:"clamp(10px,1.4vw,12px)", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)", whiteSpace:"nowrap" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"#C8A23A", flexShrink:0 }}/>
                  {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

