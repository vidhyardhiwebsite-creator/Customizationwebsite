/**
 * Recommendation engine: same category + ±20% price + matching tags
 */
export function getRecommendations(product, allProducts, limit = 6) {
  if (!product || !allProducts?.length) return []

  const priceMin = product.price * 0.8
  const priceMax = product.price * 1.2

  let candidates = allProducts.filter(p => {
    if (p.id === product.id) return false
    return p.category === product.category
  })

  // Score by tag overlap
  const scored = candidates.map(p => {
    const sharedTags = (p.tags || []).filter(t => (product.tags || []).includes(t)).length
    const inPriceRange = p.price >= priceMin && p.price <= priceMax
    return { ...p, _score: sharedTags * 2 + (inPriceRange ? 1 : 0) }
  })

  // Sort by score descending
  scored.sort((a, b) => b._score - a._score)

  let results = scored.slice(0, limit)

  // Fallback: if fewer than 2, expand to whole category ignoring price
  if (results.length < 2) {
    results = allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, limit)
  }

  return results.map(({ _score, ...p }) => p)
}
