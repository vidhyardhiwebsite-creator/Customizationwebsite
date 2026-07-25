import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Zap, ChevronLeft, ChevronRight, Star, Tag, Upload, X, ShieldCheck, Truck, Gift, Award, CheckCircle } from 'lucide-react'
import { fetchProductById, fetchProducts } from '../services/productService'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useRecentlyViewedStore } from '../store/recentlyViewedStore'
import { isVideoUrl } from '../services/storageService'
import { formatINR } from '../utils/format'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

const FB = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToCart } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const { addProduct } = useRecentlyViewedStore()

  const [product, setProduct]     = useState(null)
  const [all,     setAll]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [imgIdx,  setImgIdx]      = useState(0)
  const [customName,       setCustomName]       = useState('')
  const [customPhoto,      setCustomPhoto]      = useState(null)
  const [customPhotoPreview, setCustomPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{
    setLoading(true); setImgIdx(0)
    Promise.all([fetchProductById(id), fetchProducts()]).then(([prod,allP])=>{
      const final = prod || allP.find(p=>p.custom_id===id) || null
      setProduct(final); setAll(allP); if(final) addProduct(final); setLoading(false)
    })
  },[id])

  const wishlisted = product ? isWishlisted(product.id) : false

  const uploadPhoto = async () => {
    if (!customPhoto) return null
    setUploading(true)
    try {
      const ext = customPhoto.name.split('.').pop()
      const path = `customizations/${user.id}_${product.id}_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, customPhoto, { contentType:customPhoto.type })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setUploading(false); return data.publicUrl
    } catch(e) { toast.error('Photo upload failed: '+e.message); setUploading(false); return null }
  }

  const validate = () => {
    if (product.allow_custom_name && !customName.trim()) { toast.error(`Please enter: ${product.custom_name_label||'Text'}`); return false }
    if (product.allow_custom_photo && !customPhoto)     { toast.error(`Please upload: ${product.custom_photo_label||'Photo'}`); return false }
    return true
  }

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return }
    if (!validate()) return
    const photoUrl = await uploadPhoto()
    await addToCart(product, user.id, { custom_name:customName.trim()||null, custom_photo_url:photoUrl })
    toast.success('Added to cart!')
  }
  const handleBuyNow = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return }
    if (!validate()) return
    const photoUrl = await uploadPhoto()
    navigate('/checkout', { state:{ buyNow:{ product, quantity:1, custom_name:customName.trim()||null, custom_photo_url:photoUrl } } })
  }
  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return }
    const added = await toggleWishlist(product, user.id)
    toast.success(added?'Saved to wishlist!':'Removed from wishlist')
  }

  if (loading) {
    return (
      <div style={{ background:'#F8F5F0', minHeight:'100vh' }}>
        <div className="container-lux section-gap-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            <div className="skeleton rounded-2xl" style={{ aspectRatio:'1' }}/>
            <div className="space-y-5 pt-4">
              <div className="skeleton h-3 w-28 rounded"/>
              <div className="skeleton h-9 w-3/4 rounded-xl"/>
              <div className="skeleton h-10 w-1/3 rounded-xl"/>
              <div className="skeleton h-24 w-full rounded-xl"/>
              <div className="skeleton h-14 w-full rounded-full"/>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background:'#F8F5F0' }}>
        <h2 className="heading-lg mb-4">Product not found</h2>
        <button onClick={()=>navigate('/products')} className="btn-primary" style={{ height:48 }}>Browse Collection</button>
      </div>
    )
  }

  const images = product.images || []

  return (
    <>
      <Helmet>
        <title>{product.name} � Vidhyrathi</title>
        <meta name="description" content={product.description||`Personalised ${product.name}`}/>
        <meta property="og:image" content={images[0]}/>
      </Helmet>

      <div style={{ background:'#F8F5F0', minHeight:'100vh' }}>
        <div className="container-lux section-gap-sm">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-inter text-[12px] text-[#8F857A] mb-10">
            <Link to="/" className="hover:text-[#C8A23A] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#C8A23A] transition-colors">Products</Link>
            {product.category&&<><span>/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#C8A23A] transition-colors">{product.category}</Link></>}
            <span>/</span>
            <span className="text-[#6F655A] truncate max-w-[180px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mb-20">

            {/* -- Gallery -- */}
            <div>
              <div className="relative rounded-[24px] overflow-hidden bg-[#F3EEE6] shadow-warm-lg mb-4" style={{ aspectRatio:'1', border:'1px solid #E7DED1' }}>
                {isVideoUrl(images[imgIdx])
                  ? <video key={imgIdx} src={images[imgIdx]} autoPlay muted loop playsInline className="w-full h-full object-cover"/>
                  : <motion.img key={imgIdx} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}
                      src={images[imgIdx]||FB} alt={product.name}
                      className="w-full h-full object-cover" onError={e=>e.target.src=FB}/>}
                {images.length>1&&(<>
                  <button onClick={()=>setImgIdx(i=>(i-1+images.length)%images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 btn-icon shadow-warm-md"><ChevronLeft size={18}/></button>
                  <button onClick={()=>setImgIdx(i=>(i+1)%images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn-icon shadow-warm-md"><ChevronRight size={18}/></button>
                </>)}
                <button onClick={handleWishlist}
                  className="absolute top-4 right-4 btn-icon shadow-warm-md">
                  <Heart size={16} className={wishlisted?"fill-[#D9534F] text-[#D9534F]":"text-[#6F655A]"}/>
                </button>
              </div>
              {images.length>1&&(
                <div className="flex gap-2 flex-wrap">
                  {images.map((img,i)=>(
                    <button key={i} onClick={()=>setImgIdx(i)}
                      className={`w-16 h-16 rounded-[12px] overflow-hidden border-2 transition-all ${i===imgIdx?"shadow-gold":"border-[#E7DED1] opacity-60 hover:opacity-100"}`}
                      style={i===imgIdx?{borderColor:"#C8A23A"}:{}}>
                      {isVideoUrl(img)
                        ?<video src={img} muted playsInline className="w-full h-full object-cover bg-[#F3EEE6]"/>
                        :<img src={img} alt="" className="w-full h-full object-cover bg-[#F3EEE6]" onError={e=>e.target.src=FB}/>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* -- Info -- */}
            <div className="flex flex-col">
              <span className="eyebrow">{product.category}</span>
              <h1 className="heading-xl mb-4" style={{ fontSize:"clamp(1.8rem,3vw,2.3rem)" }}>{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} size={15} className="fill-[#C8A23A] text-[#C8A23A]"/>)}</div>
                <span className="font-inter text-[13px] text-[#8F857A]">(24 verified reviews)</span>
                <span className="badge badge-success"><CheckCircle size={9}/>In Stock</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-playfair font-bold text-[2rem] text-gold-accent">{formatINR(product.price)}</span>
                {product.compare_price>product.price&&<>
                  <span className="font-inter text-[15px] text-[#8F857A] line-through">{formatINR(product.compare_price)}</span>
                  <span className="badge badge-bronze">{Math.round((1-product.price/product.compare_price)*100)}% Off</span>
                </>}
              </div>

              <p className="body-md mb-6">{product.description}</p>

              {/* Stock */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="card-warm px-4 py-2.5 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stock>0?'bg-[#2E7D32]':'bg-[#D9534F]'}`}/>
                  <span className={`font-inter text-[13px] font-semibold ${product.stock>0?'text-[#2E7D32]':'text-[#D9534F]'}`}>
                    {product.stock>0?`${product.stock} in stock`:'Out of Stock'}
                  </span>
                </div>
                {product.category==='Bangles'&&product.size&&(
                  <div className="card-warm px-4 py-2.5 flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-[12px] text-[#8F857A]">Sizes:</span>
                    {product.size.split(',').map(s=>s.trim()).filter(Boolean).map(s=>(
                      <span key={s} className="badge badge-gold">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags?.length>0&&(
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map(tag=>(
                    <span key={tag} className="badge badge-bronze flex items-center gap-1"><Tag size={9}/>{tag}</span>
                  ))}
                </div>
              )}

              {/* Personalisation */}
              {(product.allow_custom_name||product.allow_custom_photo)&&(
                <div className="rounded-2xl p-6 mb-6 space-y-5"
                  style={{ background:'rgba(200,162,58,0.06)', border:'1px solid rgba(200,162,58,0.2)' }}>
                  <p className="font-inter font-semibold text-[14px] text-[#2C241B] flex items-center gap-2">
                    <Award size={16} style={{ color:'#C8A23A' }}/>Personalise Your Gift
                  </p>
                  {product.allow_custom_name&&(
                    <div>
                      <label className="font-inter text-[12px] font-medium text-[#6F655A] mb-2 block">
                        {product.custom_name_label||'Personalisation Text'} <span className="text-[#D9534F]">*</span>
                      </label>
                      <input value={customName} onChange={e=>setCustomName(e.target.value)}
                        placeholder={`Enter ${product.custom_name_label||'your text'}...`}
                        maxLength={80} className="input-warm"/>
                      <p className="font-inter text-[11px] text-[#8F857A] mt-1 text-right">{customName.length}/80</p>
                    </div>
                  )}
                  {product.allow_custom_photo&&(
                    <div>
                      <label className="font-inter text-[12px] font-medium text-[#6F655A] mb-2 block">
                        {product.custom_photo_label||'Upload Your Photo'} <span className="text-[#D9534F]">*</span>
                      </label>
                      {customPhotoPreview?(
                        <div className="relative inline-block">
                          <img src={customPhotoPreview} alt="Custom" className="h-28 w-28 object-cover rounded-xl border-2" style={{ borderColor:'#C8A23A' }}/>
                          <button type="button" onClick={()=>{setCustomPhoto(null);setCustomPhotoPreview(null)}}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#D9534F] text-white rounded-full flex items-center justify-center shadow-warm-sm">
                            <X size={11}/>
                          </button>
                        </div>
                      ):(
                        <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 border-dashed"
                          style={{ borderColor:'rgba(200,162,58,0.3)', background:'rgba(200,162,58,0.04)' }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(200,162,58,0.6)'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(200,162,58,0.3)'}>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e=>{
                              const f=e.target.files?.[0]; if(!f) return
                              if(f.size>10*1024*1024){toast.error('Max 10MB');return}
                              setCustomPhoto(f); setCustomPhotoPreview(URL.createObjectURL(f))
                            }}/>
                          <Upload size={20} style={{ color:'#C8A23A' }}/>
                          <div>
                            <p className="font-inter font-semibold text-[14px] text-[#2C241B]">Click to upload photo</p>
                            <p className="font-inter text-[12px] text-[#8F857A]">JPG, PNG � max 10MB</p>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-5">
                <button onClick={handleAddToCart} disabled={product.stock===0||uploading}
                  className="flex-1 btn-secondary disabled:opacity-40 disabled:cursor-not-allowed" style={{ height:52, fontSize:14 }}>
                  {uploading?<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>Uploading...</>
                    :<><ShoppingCart size={17}/>Add to Cart</>}
                </button>
                <button onClick={handleBuyNow} disabled={product.stock===0||uploading}
                  className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed" style={{ height:52, fontSize:14 }}>
                  <Zap size={17}/>Buy Now
                </button>
              </div>

              {/* Delivery promises */}
              <div className="grid grid-cols-3 gap-3">
                {[{icon:<Truck size={14}/>,t:"Free Shipping"},{icon:<Gift size={14}/>,t:"Gift Ready"},{icon:<ShieldCheck size={14}/>,t:"Secure Pay"}].map(f=>(
                  <div key={f.t} className="card-warm p-3 flex flex-col items-center gap-1.5 text-center">
                    <span style={{ color:'#C8A23A' }}>{f.icon}</span>
                    <p className="caption uppercase">{f.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related products */}
          {(()=>{
            const related = all.filter(p=>p.id!==product.id&&p.category===product.category).sort((a,b)=>a.price-b.price)
            if(!related.length) return null
            return (
              <section className="mb-10">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <span className="eyebrow">You May Also Like</span>
                    <h2 className="heading-lg">More <span className="text-gold-accent">{product.category}</span></h2>
                  </div>
                  <Link to={`/products?category=${encodeURIComponent(product.category)}`}
                    className="flex items-center gap-1.5 font-inter font-semibold text-[14px] text-[#C8A23A] hover:gap-2.5 transition-all">
                    View All<ChevronRight size={14}/>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                  {related.slice(0,12).map(p=><ProductCard key={p.id} product={p}/>)}
                </div>
              </section>
            )
          })()}
        </div>
      </div>
    </>
  )
}

