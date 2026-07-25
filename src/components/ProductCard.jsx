import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { formatINR } from '../utils/format'
import toast from 'react-hot-toast'

const isVideo = url => url && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)
const FB = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const { user } = useAuthStore()
  const { addToCart } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  const handleCart = async e => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { toast.error('Please login to add to cart'); return }
    try { await addToCart(product, user.id); toast.success('Added to cart!') }
    catch(err) { toast.error(err.message || 'Failed') }
  }
  const handleWish = async e => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { toast.error('Please login'); return }
    const added = await toggleWishlist(product, user.id)
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist')
  }

  const media = product.images?.[0] || FB
  const mediaIsVideo = isVideo(media)

  return (
    <motion.div
      whileHover={{ y:-4 }}
      transition={{ duration:0.3, ease:[0.25,0.46,0.45,0.94] }}
      onHoverStart={()=>setHovered(true)}
      onHoverEnd={()=>setHovered(false)}
      className="card-lux group relative overflow-hidden flex flex-col"
    >
      <Link to={`/products/${product.id}`}>
        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-[#F3EEE6] rounded-t-[20px]" style={{ aspectRatio:"1" }}>
          {mediaIsVideo ? (
            <video src={media} muted loop playsInline autoPlay
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"/>
          ) : (
            <img src={media} alt={product.name} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              onError={e=>e.target.src=FB}/>
          )}

          {/* Overlay */}
          <div className="product-overlay rounded-t-[20px]"/>

          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-[#F8F5F0]/80 flex items-center justify-center">
              <span className="badge badge-bronze">Out of Stock</span>
            </div>
          )}

          {/* Discount badge */}
          {product.compare_price>product.price && (
            <span className="absolute top-3 left-3 z-10 badge badge-bronze">
              {Math.round((1-product.price/product.compare_price)*100)}% Off
            </span>
          )}

          {/* Wishlist */}
          <button onClick={handleWish}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 border border-[#E7DED1] shadow-warm-sm">
            <Heart size={14} className={wishlisted?"fill-[#D9534F] text-[#D9534F]":"text-[#8F857A]"}/>
          </button>

          {/* Hover CTA */}
          <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex gap-2">
            <Link to={`/products/${product.id}`}
              className="btn-primary flex-1 justify-center" style={{ height:40, fontSize:12 }}
              onClick={e=>e.stopPropagation()}>Personalise</Link>
            <Link to={`/products/${product.id}`}
              className="btn-icon flex-shrink-0" style={{ background:"rgba(255,255,255,0.95)" }}
              onClick={e=>e.stopPropagation()}>
              <Eye size={14} className="text-[#2C241B]"/>
            </Link>
          </div>
        </div>

        {/* ── Info ── */}
        <div style={{ padding:"12px 18px 10px" }} className="flex-1 flex flex-col">
          {/* Category eyebrow */}
          <p style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:10, fontWeight:700,
            letterSpacing:"0.12em",
            textTransform:"uppercase",
            color:"#8F857A",
            marginBottom:4,
            lineHeight:1,
          }}>
            {product.category}
          </p>
          {/* Product name */}
          <h3 style={{
            fontFamily:"'Inter',sans-serif",
            fontWeight:600,
            fontSize:13,
            color:"#2C241B",
            lineHeight:1.35,
            marginBottom:8,
            display:"-webkit-box",
            WebkitLineClamp:2,
            WebkitBoxOrient:"vertical",
            overflow:"hidden",
          }} className="group-hover:text-[#A88422] transition-colors">
            {product.name}
          </h3>
          {/* Price + rating — flush to bottom */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto", gap:8 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
              <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:15, color:"#2C241B" }}>
                {formatINR(product.price)}
              </span>
              {product.compare_price > product.price && (
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#8F857A", textDecoration:"line-through" }}>
                  {formatINR(product.compare_price)}
                </span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
              <Star size={10} className="fill-[#C8A23A] text-[#C8A23A]"/>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#8F857A" }}>4.9</span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Add to cart ── */}
      <div style={{ padding:"0 18px 14px" }}>
        <button onClick={handleCart} disabled={product.stock===0}
          className="w-full btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ height:36, fontSize:11, borderRadius:999, borderColor:"#E7DED1" }}>
          <ShoppingCart size={12}/> Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
