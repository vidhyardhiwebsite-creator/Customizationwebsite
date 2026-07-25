import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart, ShieldCheck, Truck, Gift } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { formatINR } from '../utils/format'
import { isVideoUrl } from '../services/storageService'
import toast from 'react-hot-toast'

const FB = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=80'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const { toggleWishlist } = useWishlistStore()
  const navigate = useNavigate()
  const total = getTotal()
  const hasOos = items.some(i => i.products?.stock === 0)

  const handleRemove = async item => { await removeFromCart(item.id||item.product_id, user?.id); toast.success('Removed') }
  const handleSave = async item => {
    if (!user) { toast.error('Please login'); return }
    if (!item.products) return
    await toggleWishlist(item.products, user.id)
    await removeFromCart(item.id||item.product_id, user?.id)
    toast.success('Moved to wishlist!')
  }
  const handleQty = async (item, delta) => updateQuantity(item.id||item.product_id, item.quantity+delta, user?.id)

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" style={{ background:'#F8F5F0' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-warm-sm"
          style={{ background:'rgba(200,162,58,0.1)', border:'1px solid rgba(200,162,58,0.2)' }}>
          <ShoppingBag size={36} style={{ color:'#C8A23A' }}/>
        </div>
        <h2 className="heading-lg mb-3">Your cart is empty</h2>
        <p className="body-lg mb-8" style={{ maxWidth:360 }}>Discover our collection of premium personalised gifts crafted with love.</p>
        <Link to="/products" className="btn-primary" style={{ height:52, padding:'0 40px' }}>Explore Collection</Link>
      </div>
    )
  }

  return (
    <div style={{ background:'#F8F5F0', minHeight:'100vh' }}>
      <div className="container-lux section-gap-sm">
        <div className="mb-10">
          <span className="eyebrow">Your Selection</span>
          <h1 className="heading-xl">Shopping <span className="text-gold-accent">Cart</span></h1>
          <p className="body-md mt-1">{items.length} item{items.length!==1?'s':''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence>
              {items.map(item => {
                const product = item.products || {}
                const mediaUrl = product.images?.[0]
                return (
                  <motion.div key={item.id||item.product_id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20, scale:0.97 }}
                    transition={{ duration:0.3 }}
                    className="card-lux p-5 flex gap-5">
                    <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-[16px] overflow-hidden bg-[#F3EEE6] border border-[#E7DED1]">
                        {mediaUrl && isVideoUrl(mediaUrl)
                          ? <video src={mediaUrl} muted playsInline loop autoPlay className="w-full h-full object-cover"/>
                          : <img src={mediaUrl||FB} alt={product.name} className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product_id}`}>
                        <h3 className="font-inter font-semibold text-[15px] text-[#2C241B] hover:text-[#C8A23A] transition-colors line-clamp-2">{product.name}</h3>
                      </Link>
                      <p className="caption uppercase tracking-wider mt-1">{product.category}</p>
                      {item.custom_name && <p className="font-inter text-[12px] text-[#8F857A] mt-1">✏ "{item.custom_name}"</p>}
                      {product.stock===0 && <span className="badge badge-danger mt-2 inline-flex">Out of Stock</span>}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>handleQty(item,-1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E7DED1] bg-white text-[#6F655A] hover:border-[#C8A23A] hover:text-[#C8A23A] transition-all">
                            <Minus size={12}/>
                          </button>
                          <span className="font-inter font-bold text-[15px] text-[#2C241B] w-6 text-center">{item.quantity}</span>
                          <button onClick={()=>handleQty(item,1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E7DED1] bg-white text-[#6F655A] hover:border-[#C8A23A] hover:text-[#C8A23A] transition-all">
                            <Plus size={12}/>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-inter font-bold text-[17px] text-[#2C241B]">{formatINR((product.price||0)*item.quantity)}</span>
                          <button onClick={()=>handleSave(item)} className="text-[#8F857A] hover:text-[#C8A23A] transition-colors" title="Save for later"><Heart size={15}/></button>
                          <button onClick={()=>handleRemove(item)} className="text-[#8F857A] hover:text-[#D9534F] transition-colors" title="Remove"><Trash2 size={15}/></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[{ icon:<ShieldCheck size={16}/>, t:"Secure Checkout" }, { icon:<Truck size={16}/>, t:"Free Delivery" }, { icon:<Gift size={16}/>, t:"Gift Packaging" }].map(f=>(
                <div key={f.t} className="card-warm p-4 flex flex-col items-center gap-2 text-center">
                  <span style={{ color:'#C8A23A' }}>{f.icon}</span>
                  <p className="caption uppercase tracking-wider">{f.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card-lux p-7 h-fit sticky top-24">
            <div className="h-px w-full mb-6" style={{ background:'linear-gradient(90deg, transparent, #C8A23A, transparent)' }}/>
            <h2 className="heading-md mb-6">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map(item=>(
                <div key={item.id||item.product_id} className="flex justify-between gap-3">
                  <span className="font-inter text-[13px] text-[#6F655A] truncate">{item.products?.name} <span className="text-[#8F857A]">×{item.quantity}</span></span>
                  <span className="font-inter text-[13px] font-semibold text-[#2C241B] flex-shrink-0">{formatINR((item.products?.price||0)*item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E7DED1] pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="font-inter text-[#8F857A]">Subtotal</span>
                <span className="font-inter font-semibold text-[#2C241B]">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="font-inter text-[#8F857A]">Shipping</span>
                <span className="font-inter font-semibold text-[#2E7D32]">Free</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="font-inter text-[#8F857A]">Gift Packaging</span>
                <span className="font-inter font-semibold text-[#2E7D32]">Included</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 pb-5 border-t border-[#E7DED1] pt-5">
              <span className="font-playfair font-bold text-[17px] text-[#2C241B]">Total</span>
              <span className="font-playfair font-bold text-[1.6rem] text-gold-accent">{formatINR(total)}</span>
            </div>
            <button onClick={()=>navigate('/checkout')} disabled={hasOos||!user}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed" style={{ height:52 }}>
              Proceed to Checkout<ArrowRight size={16}/>
            </button>
            {!user && <p className="font-inter text-[12px] text-center mt-3 text-[#8F857A]"><Link to="/login" className="text-[#C8A23A] font-semibold hover:underline">Login</Link> to checkout</p>}
            {hasOos && <p className="font-inter text-[11px] text-center mt-2 text-[#D9534F]">Remove out-of-stock items to proceed</p>}
            <div className="flex items-center justify-center gap-1.5 mt-5 flex-wrap">
              <span className="font-inter text-[10px] uppercase tracking-wider text-[#8F857A] mr-1">Secure</span>
              {["UPI","VISA","MC","NB"].map(p=>(
                <span key={p} className="badge badge-gold">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
