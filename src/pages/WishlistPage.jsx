import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  const products = items.map(i => i.products).filter(Boolean)

  if (products.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="text-[#C9956C] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Your wishlist is empty</h2>
        <p className="text-[#8A8AAA] mb-6">Save pieces you love to revisit later</p>
        <Link to="/products" className="px-8 py-3 bg-[#1B2B5E] text-white font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
        My Wishlist <span className="text-[#8A8AAA] text-lg font-normal">({products.length})</span>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
