import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useWishlistStore } from '../store/wishlistStore'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  const products = items.map(i => i.products).filter(Boolean)

  if (products.length === 0) {
    return (
      <>
        <Helmet><title>Wishlist — Vidhyrathi</title></Helmet>
        <div style={{ background: '#F8F5F0', minHeight: '100vh' }}
          className="flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-warm-sm"
            style={{ background: 'rgba(200,162,58,0.1)', border: '1px solid rgba(200,162,58,0.2)' }}>
            <Heart size={36} style={{ color: '#C8A23A' }} />
          </div>
          <h2 className="heading-lg mb-3">Your wishlist is empty</h2>
          <p className="body-md mb-8" style={{ maxWidth: 360 }}>Save pieces you love to revisit later.</p>
          <Link to="/products" className="btn-primary" style={{ height: 52, padding: '0 36px' }}>
            Browse Collection
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet><title>Wishlist — Vidhyrathi</title></Helmet>
      <div style={{ background: '#F8F5F0', minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ background: '#F3EEE6', borderBottom: '1px solid #E7DED1' }}>
          <div className="container-lux" style={{ paddingTop: 'clamp(20px,3vw,32px)', paddingBottom: 'clamp(16px,2.5vw,28px)' }}>
            <span className="eyebrow" style={{ marginBottom: 6 }}>Saved Items</span>
            <h1 className="heading-xl">
              My <span className="text-gold-accent">Wishlist</span>
              <span className="font-inter font-normal text-[#8F857A] ml-3"
                style={{ fontSize: 'clamp(0.9rem,2vw,1.1rem)' }}>
                ({products.length})
              </span>
            </h1>
          </div>
        </div>

        <div className="container-lux" style={{ paddingTop: 'clamp(20px,3vw,32px)', paddingBottom: 'clamp(40px,6vw,72px)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </>
  )
}
