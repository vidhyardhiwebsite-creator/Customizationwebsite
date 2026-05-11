import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { fetchProducts } from '../services/productService'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'

  // If search exactly matches a category name, treat it as a category filter
  const matchedCategory = CATEGORIES.find(c => c.toLowerCase() === search.toLowerCase())

  useEffect(() => {
    if (matchedCategory && !category) {
      // Auto-switch to category filter
      const params = new URLSearchParams(searchParams)
      params.set('category', matchedCategory)
      params.delete('search')
      setSearchParams(params, { replace: true })
      return
    }
    setLoading(true)
    fetchProducts({ category, search, sort }).then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [category, search, sort])

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = category || search

  return (
    <>
      <Helmet>
        <title>{category ? `${category} – NaShe Jewels` : 'All Jewelry – NaShe Jewels'}</title>
        <meta name="description" content={`Shop ${category || 'all'} jewelry at NaShe Jewels. Premium handcrafted Indian jewelry.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {category || 'All Jewelry'}
          </h1>
          {search && <p className="text-[#4A4A6A] text-sm">Search results for: <span className="text-[#C9956C] font-medium">"{search}"</span></p>}
          <p className="text-[#8A8AAA] text-sm mt-1">{loading ? '...' : `${products.length} pieces`}</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('category', '')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!category ? 'bg-[#1B2B5E] text-white' : 'bg-white text-[#4A4A6A] hover:text-[#1B2B5E] border border-[#E8E0D5]'}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat || search.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#1B2B5E] text-white'
                    : 'bg-white text-[#4A4A6A] hover:text-[#1B2B5E] border border-[#E8E0D5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-[#8A8AAA] hover:text-red-500 transition-colors">
                <X size={12} /> Clear
              </button>
            )}
            <select
              value={sort}
              onChange={e => setFilter('sort', e.target.value)}
              className="bg-white border border-[#E8E0D5] text-[#4A4A6A] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B2B5E]"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">💎</p>
            <p className="text-[#4A4A6A] text-lg">No jewelry found</p>
            <p className="text-[#8A8AAA] text-sm mt-2">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-[#1B2B5E] text-white rounded-lg text-sm font-medium hover:bg-[#2A3F7E] transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
