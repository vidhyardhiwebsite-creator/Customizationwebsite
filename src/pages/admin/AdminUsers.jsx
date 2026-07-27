import { useEffect, useState, useCallback } from "react"
import { Users, ShoppingBag, DollarSign, Search, Heart, ShoppingCart, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { formatINR } from "../../utils/format"
import { supabase } from "../../lib/supabase"

const ADMIN_WHATSAPP = "919848760606"

const WA_ICON = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function AdminUsers() {
  const { orders, loadOrders } = useAdminStore()
  const [search, setSearch]             = useState("")
  const [expanded, setExpanded]         = useState(null)
  const [userDetails, setUserDetails]   = useState({})
  const [allUsers, setAllUsers]         = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        supabase.rpc("get_all_carts"),
        supabase.rpc("get_all_wishlists"),
      ])
      const cartRows     = cartRes.data     || []
      const wishlistRows = wishlistRes.data || []

      const userMap = {}
      orders.forEach(o => {
        const key = o.user_id || "unknown"
        let addrObj = {}
        try { addrObj = typeof o.address === "string" ? JSON.parse(o.address) : (o.address || {}) } catch {}
        const name  = addrObj.full_name || "Customer"
        const phone = addrObj.phone     || ""
        if (!userMap[key]) userMap[key] = { userId: key, name, phone, orders: 0, totalSpent: 0, lastOrder: null }
        userMap[key].orders += 1
        if (o.payment_status === "paid") userMap[key].totalSpent += o.total_amount || 0
        if (!userMap[key].lastOrder || new Date(o.created_at) > new Date(userMap[key].lastOrder)) userMap[key].lastOrder = o.created_at
        if (phone && !userMap[key].phone) userMap[key].phone = phone
      })

      const cartByUser = {}
      cartRows.forEach(row => {
        const uid = row.user_id
        if (!cartByUser[uid]) cartByUser[uid] = []
        cartByUser[uid].push({ id: row.id, quantity: row.quantity, products: { name: row.product_name, price: row.product_price, images: row.product_images, category: row.product_category, custom_id: row.product_custom_id } })
        if (!userMap[uid]) userMap[uid] = { userId: uid, name: "Customer", phone: "", orders: 0, totalSpent: 0, lastOrder: null }
      })

      const wishlistByUser = {}
      wishlistRows.forEach(row => {
        const uid = row.user_id
        if (!wishlistByUser[uid]) wishlistByUser[uid] = []
        wishlistByUser[uid].push({ id: row.id, products: { name: row.product_name, price: row.product_price, images: row.product_images, category: row.product_category, custom_id: row.product_custom_id } })
        if (!userMap[uid]) userMap[uid] = { userId: uid, name: "Customer", phone: "", orders: 0, totalSpent: 0, lastOrder: null }
      })

      const detailsMap = {}
      Object.keys(userMap).forEach(uid => {
        detailsMap[uid] = { cart: cartByUser[uid] || [], wishlist: wishlistByUser[uid] || [] }
      })
      setUserDetails(detailsMap)
      setAllUsers(Object.values(userMap).sort((a, b) => b.totalSpent - a.totalSpent))
    } catch (e) {
      console.error("Failed to fetch users:", e)
    }
    setLoadingUsers(false)
  }, [orders])

  useEffect(() => { loadOrders() }, [])
  useEffect(() => { if (orders.length >= 0) fetchAllUsers() }, [orders.length])

  const users = allUsers.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.includes(search)
  )

  const notifyWhatsApp = (user, type) => {
    const phone   = user.phone?.replace(/\D/g, "")
    const details = userDetails[user.userId]
    let msg = ""
    if (type === "cart" && details?.cart?.length) {
      const items = details.cart.map(i => `${i.products?.name} (₹${i.products?.price})`).join(", ")
      msg = encodeURIComponent(`Hi ${user.name}! 👋\n\nYou have items in your cart at Vidhyrathi:\n${items}\n\nComplete your purchase: ${window.location.origin}/cart\n\n✨ Vidhyrathi`)
    } else if (type === "wishlist" && details?.wishlist?.length) {
      const items = details.wishlist.map(i => `${i.products?.name} (₹${i.products?.price})`).join(", ")
      msg = encodeURIComponent(`Hi ${user.name}! 👋\n\nYour wishlist at Vidhyrathi:\n${items}\n\nShop now: ${window.location.origin}/wishlist\n\n✨ Vidhyrathi`)
    } else {
      msg = encodeURIComponent(`Hi ${user.name}! 👋\n\nCheck out our latest personalized gifts!\n${window.location.origin}\n\n✨ Vidhyrathi`)
    }
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Customer ${user.name} has no phone on file`)}`, "_blank")
  }

  const totalRevenue = allUsers.reduce((s, u) => s + u.totalSpent, 0)
  const paidCount    = orders.filter(o => o.payment_status === "paid").length
  const avgOrderValue = paidCount ? Math.round(totalRevenue / paidCount) : 0

  const tierStyle = (tier) => {
    if (tier === "Gold")   return { color: '#C8A23A', background: 'rgba(200,162,58,0.12)',  border: '1px solid rgba(200,162,58,0.3)'  }
    if (tier === "Silver") return { color: '#8F857A', background: 'rgba(143,133,122,0.1)',  border: '1px solid rgba(143,133,122,0.25)' }
    return                        { color: '#A88422', background: 'rgba(168,132,34,0.1)',   border: '1px solid rgba(168,132,34,0.25)'  }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '100%', minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, paddingBottom: 12, borderBottom: '1px solid #E7DED1', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>
            Users
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '3px 0 0' }}>
            Customer activity, cart &amp; wishlist
          </p>
        </div>
        <button onClick={fetchAllUsers} disabled={loadingUsers}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
            color: '#FFF', fontFamily: "'Inter',sans-serif", fontWeight: 600,
            fontSize: 12, borderRadius: 10, border: 'none', cursor: 'pointer',
            opacity: loadingUsers ? 0.6 : 1, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(200,162,58,0.3)',
          }}>
          <RefreshCw size={12} style={{ animation: loadingUsers ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards — 2-col mobile, 3-col desktop ── */}
      <div style={{ display: 'grid', gap: 10 }} className="kpi-grid-users">
        {[
          { icon: Users,       label: 'Total Customers',  value: allUsers.length,           iconColor: '#C8A23A', bg: 'rgba(200,162,58,0.1)'  },
          { icon: DollarSign,  label: 'Total Revenue',     value: formatINR(totalRevenue),   iconColor: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
          { icon: ShoppingBag, label: 'Avg Order Value',   value: formatINR(avgOrderValue),  iconColor: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
        ].map((k, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 12, padding: 'clamp(12px,2vw,18px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={14} style={{ color: k.iconColor }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 'clamp(14px,2.5vw,20px)', color: '#2C241B', margin: '0 0 2px', lineHeight: 1.1 }}>{k.value}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: 0 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8F857A', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or user ID..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 10,
            paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
            fontSize: 13, color: '#2C241B', outline: 'none', fontFamily: "'Inter',sans-serif",
          }}
          onFocus={e => e.target.style.borderColor = '#C8A23A'}
          onBlur={e => e.target.style.borderColor = '#E7DED1'}
        />
      </div>

      {/* ── User List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loadingUsers && allUsers.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #C8A23A', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#8F857A' }}>
            No customers yet
          </div>
        ) : users.map(u => {
          const tier    = u.totalSpent >= 20000 ? "Gold" : u.totalSpent >= 8000 ? "Silver" : "Bronze"
          const ts      = tierStyle(tier)
          const details = userDetails[u.userId]
          const isOpen  = expanded === u.userId
          return (
            <div key={u.userId} style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 12, overflow: 'hidden' }}>

              {/* Row header */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => setExpanded(isOpen ? null : u.userId)}
                onMouseEnter={e => e.currentTarget.style.background = '#FAF8F3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,162,58,0.12)', border: '1px solid rgba(200,162,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 14, color: '#C8A23A' }}>{u.name[0]?.toUpperCase()}</span>
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: '1px 0 0' }}>
                    {u.orders} order{u.orders !== 1 ? 's' : ''} · {formatINR(u.totalSpent)}
                  </p>
                </div>

                {/* Tier + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, ...ts }}>{tier}</span>
                  {isOpen
                    ? <ChevronUp  size={13} style={{ color: '#8F857A' }} />
                    : <ChevronDown size={13} style={{ color: '#8F857A' }} />
                  }
                </div>
              </div>

              {/* Expanded detail panel */}
              {isOpen && details && (
                <div style={{ borderTop: '1px solid #F3EEE6', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Cart + Wishlist grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12 }} className="user-detail-grid">

                    {/* Cart */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#8F857A', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShoppingCart size={11} /> Cart ({details.cart.length})
                        </p>
                        {details.cart.length > 0 && (
                          <button onClick={() => notifyWhatsApp(u, "cart")}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#25D366', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            <WA_ICON /> Remind
                          </button>
                        )}
                      </div>
                      {details.cart.length === 0
                        ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#B8AFA8' }}>Cart is empty</p>
                        : details.cart.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F5F0', borderRadius: 8, padding: '7px 10px', marginBottom: 4 }}>
                            {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.products?.name}</p>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: '1px 0 0' }}>Qty: {item.quantity} · {formatINR(item.products?.price)}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>

                    {/* Wishlist */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#8F857A', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Heart size={11} /> Wishlist ({details.wishlist.length})
                        </p>
                        {details.wishlist.length > 0 && (
                          <button onClick={() => notifyWhatsApp(u, "wishlist")}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#25D366', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            <WA_ICON /> Remind
                          </button>
                        )}
                      </div>
                      {details.wishlist.length === 0
                        ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#B8AFA8' }}>Wishlist is empty</p>
                        : details.wishlist.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F5F0', borderRadius: 8, padding: '7px 10px', marginBottom: 4 }}>
                            {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#2C241B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.products?.name}</p>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#8F857A', margin: '1px 0 0' }}>{formatINR(item.products?.price)}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* WhatsApp CTA */}
                  <button onClick={() => notifyWhatsApp(u, "general")}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', padding: '9px 0',
                      background: '#25D366', border: 'none', borderRadius: 10,
                      fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: '#FFF',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                    }}>
                    <WA_ICON /> Send WhatsApp Message
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
