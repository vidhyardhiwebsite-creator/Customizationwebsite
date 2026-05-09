import { supabase } from '../lib/supabase'
import { mockProducts } from '../data/products'

// Try Supabase first, fall back to mock data
export async function fetchProducts(filters = {}) {
  try {
    let query = supabase.from('products').select('*')
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,custom_id.ilike.%${filters.search}%`)
    }
    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error || !data?.length) return applyFilters(mockProducts, filters)
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
  else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return result
}
