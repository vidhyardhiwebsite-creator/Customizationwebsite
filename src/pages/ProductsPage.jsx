import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { fetchProducts } from '../services/productService'
import { getSetting } from '../services/settingsService'
import { useCategoryStore } from '../store/categoryStore'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'

const SORT_OPTIONS = [
  { value:'newest',    label:'Newest First' },
  { value:'price_asc', label:'Price: Low ? High' },
  { value:'price_desc',label:'Price: High ? Low' },
]
const PAGE_SIZES  = [8, 12, 24, 48]
const DEFAULT_PS  = 12

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [pageSize,  setPageSize]  = useState(DEFAULT_PS)
  const [page,      setPage]      = useState(1)
  const { categories, loadCategories } = useCategoryStore()

  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const sort     = searchParams.get('sort')     || 'newest'

  useEffect(() => {
    getSetting('products_per_page').then(v => { const n=parseInt(v); if(n&&PAGE_SIZES.includes(n)) setPageSize(n) }).catch(()=>{})
    loadCategories()
  }, [])
  useEffect(() => { setPage(1) }, [category, search, sort, pageSize])

  const matchedCat = categories.find(c => c.toLowerCase() === search.toLowerCase())
  useEffect(() => {
    if (matchedCat && !category) {
      const p = new URLSearchParams(searchParams); p.set('category', matchedCat); p.delete('search')
      setSearchParams(p, { replace:true }); return
    }
    setLoading(true)
    fetchProducts({ category, search, sort }).then(d => { setProducts(d); setLoading(false) })
  }, [category, search, sort])

  const setFilter = (k,v) => { const p=new URLSearchParams(searchParams); v?p.set(k,v):p.delete(k); setSearchParams(p) }
  const clearAll  = () => setSearchParams({})
  const hasFilters = category || search

  const totalPages    = Math.ceil(products.length / pageSize)
  const paged         = products.slice((page-1)*pageSize, page*pageSize)

  return (
    <>
      <Helmet>
        <title>{category ? `${category} � Vidhyrathi` : 'All Products � Vidhyrathi'}</title>
        <meta name="description" content={`Shop ${category||'all'} personalised gifts at Vidhyrathi.`}/>
      </Helmet>

      <div style={{ background:'#F8F5F0', minHeight:'100vh' }}>
        {/* Page header */}
        <div style={{ background:'#F3EEE6', borderBottom:'1px solid #E7DED1' }}>
          <div className="container-lux" style={{ paddingTop:'clamp(20px,3vw,32px)', paddingBottom:'clamp(16px,2.5vw,28px)' }}>
            <span className="eyebrow" style={{ marginBottom: 6 }}>{category ? "Category" : search ? "Search Results" : "All Products"}</span>
            <h1 className="heading-xl" style={{ marginBottom: 4 }}>
              {category ? <><span className="text-gold-accent">{category}</span></>
               : search ? <>Results for "<span className="text-gold-accent">{search}</span>"</>
               : <>Our <span className="text-gold-accent">Collection</span></>}
            </h1>
            <p className="body-md">
              {loading ? "Loading..." : `${products.length} handcrafted piece${products.length!==1?"s":""} available`}
            </p>
          </div>
        </div>

        <div className="container-lux" style={{ paddingTop:'clamp(16px,2.5vw,32px)', paddingBottom:'clamp(40px,6vw,80px)' }}>
          {/* Filter row */}
          <div style={{ marginBottom: 'clamp(16px,4vw,32px)' }}>

            {/* Pills — swipeable on mobile, wraps on desktop */}
            <div className="pill-scroll">
              {["All",...categories].map(cat => {
                const isActive = cat==="All" ? !category : category===cat
                return (
                  <button key={cat} onClick={()=>setFilter('category',cat==="All"?"":cat)}
                    style={{
                      fontFamily:"'Inter',sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      padding: "7px 16px",
                      borderRadius: 999,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                      lineHeight: 1.4,
                      ...(isActive
                        ? { background:"linear-gradient(135deg,#D4AF37,#B8860B)", color:"#FFFFFF", border:"none", boxShadow:"0 3px 12px rgba(200,162,58,0.35)" }
                        : { background:"#FFFFFF", color:"#6F655A", border:"1px solid #E7DED1", boxShadow:"0 1px 4px rgba(44,36,27,0.05)" })
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor="#C8A23A"; e.currentTarget.style.color="#C8A23A" } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor="#E7DED1"; e.currentTarget.style.color="#6F655A" } }}>
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Sort row */}
            <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:14, borderTop:"1px solid #E7DED1", marginTop:12 }}>
              {hasFilters && (
                <button onClick={clearAll} style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Inter',sans-serif", fontSize:12, color:"#8F857A", background:"none", border:"none", cursor:"pointer", padding:0, flexShrink:0 }}
                  onMouseEnter={e=>e.currentTarget.style.color="#D9534F"}
                  onMouseLeave={e=>e.currentTarget.style.color="#8F857A"}>
                  <X size={12}/>Clear filters
                </button>
              )}
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#8F857A", whiteSpace:"nowrap" }}>Sort by</span>
                <select value={sort} onChange={e=>setFilter('sort',e.target.value)}
                  className="input-warm" style={{ width:'auto', height:36, padding:"0 10px", fontSize:13, borderRadius:999 }}>
                  {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Count + per page */}
          {!loading && products.length>0 && (
            <div className="flex items-center justify-between mb-8">
              <p className="font-inter text-[13px] text-[#8F857A]">
                Showing {(page-1)*pageSize+1}�{Math.min(page*pageSize,products.length)} of {products.length}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-inter text-[12px] text-[#8F857A]">Per page</span>
                <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}
                  className="input-warm text-[13px]" style={{ width:'auto', height:36, padding:"0 10px" }}>
                  {PAGE_SIZES.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {Array(pageSize).fill(0).map((_,i)=><SkeletonCard key={i}/>)}
            </div>
          ) : products.length===0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background:"rgba(200,162,58,0.1)", border:"1px solid rgba(200,162,58,0.2)" }}>
                <Search size={26} style={{ color:"#C8A23A" }}/>
              </div>
              <h3 className="heading-md mb-3">No products found</h3>
              <p className="body-md mb-8">Try adjusting your filters or browse all products</p>
              <button onClick={clearAll} className="btn-primary" style={{ height:48, padding:"0 32px" }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {paged.map((p,i)=>(
                  <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                    <ProductCard product={p}/>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages>1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button onClick={()=>{setPage(p=>Math.max(1,p-1));window.scrollTo({top:0,behavior:'smooth'})}}
                    disabled={page===1} className="btn-ghost" style={{ height:40, padding:"0 16px", fontSize:13, borderRadius:999 }}>
                    <ChevronLeft size={14}/>Prev
                  </button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'})}}
                      className="font-inter font-semibold text-[13px] w-9 h-9 rounded-full transition-all"
                      style={p===page
                        ? { background:"linear-gradient(135deg,#D4AF37,#B8860B)", color:"#FFFFFF" }
                        : { background:"#FFFFFF", color:"#6F655A", border:"1px solid #E7DED1" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={()=>{setPage(p=>Math.min(totalPages,p+1));window.scrollTo({top:0,behavior:'smooth'})}}
                    disabled={page===totalPages} className="btn-ghost" style={{ height:40, padding:"0 16px", fontSize:13, borderRadius:999 }}>
                    Next<ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

