import { supabase } from '../lib/supabase'
import { mockProducts } from '../data/products'

// Check if Supabase has any products at all
async function hasSupabaseProducts() {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    return !error && count > 0
  } catch {
    return false
  }
}

// Try Supabase first, fall back to mock data only if Supabase has no products
export async function fetchProducts(filters = {}) {
  try {
    let query = supabase.from('products').select('*')
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.search) {
      // Search by name OR custom_id (product code)
      query = query.or(`name.ilike.%${filters.search}%,custom_id.ilike.%${filters.search}%`)
    }
    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
    else if (filters.category) query = query.order('price', { ascending: true }) // categories default to price asc
    else query = query.order('created_at', { ascending: false })

    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query

    // Only fall back to mock if there's a connection error (not just empty results)
    if (error) {
      console.warn('Supabase error, using mock data:', error.message)
      return applyFilters(mockProducts, filters)
    }

    // If Supabase returned data (even empty array for a filtered query), use it
    // Only fall back to mock if Supabase has NO products at all
    if (!data?.length) {
      const hasReal = await hasSupabaseProducts()
      if (!hasReal) return applyFilters(mockProducts, filters)
      return [] // Supabase has products but none match the filter
    }

    return data
  } catch {
    return applyFilters(mockProducts, filters)
  }
}

export async function fetchProductById(id) {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error || !data) return mockProducts.find(p => p.id === id) || null
    return data
  } catch {
    return mockProducts.find(p => p.id === id) || null
  }
}

function applyFilters(products, filters) {
  let result = [...products]
  if (filters.category) result = result.filter(p => p.category === filters.category)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      (p.custom_id || "").toLowerCase().includes(q)
    )
  }
  if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price)
  else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price)
  else if (filters.category) result.sort((a, b) => a.price - b.price) // categories default price asc
  else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return result
}
