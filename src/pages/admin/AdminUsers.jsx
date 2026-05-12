import { useEffect, useState } from "react"
import { Users, ShoppingBag, DollarSign, Search, Heart, ShoppingCart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useAdminStore } from "../../store/adminStore"
import { formatINR, formatDate } from "../../utils/format"
import { supabase } from "../../lib/supabase"

const ADMIN_WHATSAPP = "918639006849"

export default function AdminUsers() {
  const { orders, loadOrders } = useAdminStore()
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState(null)
  const [userDetails, setUserDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState({})

  useEffect(() => { loadOrders() }, [])

  const userMap = {}
  orders.forEach(o => {
    const key = o.user_id || "unknown"
    let addrObj = {}
    try { addrObj = typeof o.address === "string" ? JSON.parse(o.address) : (o.address || {}) } catch {}
    const name = addrObj.full_name || "Customer"
    const phone = addrObj.phone || ""
    if (!userMap[key]) userMap[key] = { userId: key, name, phone, orders: 0, totalSpent: 0, lastOrder: null }
    userMap[key].orders += 1
    if (o.payment_status === "paid") userMap[key].totalSpent += o.total_amount || 0
    if (!userMap[key].lastOrder || new Date(o.created_at) > new Date(userMap[key].lastOrder)) userMap[key].lastOrder = o.created_at
    if (phone && !userMap[key].phone) userMap[key].phone = phone
  })

  const users = Object.values(userMap).sort((a, b) => b.totalSpent - a.totalSpent)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.userId.includes(search))

  const loadUserDetails = async (userId) => {
    if (userDetails[userId]) { setExpanded(expanded === userId ? null : userId); return }
    setLoadingDetails(p => ({ ...p, [userId]: true }))
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        supabase.from("cart").select("*, products(name, price, images, category)").eq("user_id", userId),
        supabase.from("wishlist").select("*, products(name, price, images, category)").eq("user_id", userId),
      ])
      setUserDetails(p => ({ ...p, [userId]: { cart: cartRes.data || [], wishlist: wishlistRes.data || [] } }))
    } catch {}
    setLoadingDetails(p => ({ ...p, [userId]: false }))
    setExpanded(expanded === userId ? null : userId)
  }

  const notifyWhatsApp = (user, type) => {
    const phone = user.phone?.replace(/\D/g, "")
    const details = userDetails[user.userId]
    let msg = ""
    if (type === "cart" && details?.cart?.length) {
      const items = details.cart.map(i => `${i.products?.name} (?${i.products?.price})`).join(", ")
      msg = encodeURIComponent(`Hi ${user.name}! ??\n\nYou have items in your cart at NaShe Jewels:\n${items}\n\nComplete your purchase now: https://www.nashejewels.in/cart\n\n?? NaShe Jewels`)
    } else if (type === "wishlist" && details?.wishlist?.length) {
      const items = details.wishlist.map(i => `${i.products?.name} (?${i.products?.price})`).join(", ")
      msg = encodeURIComponent(`Hi ${user.name}! ??\n\nYour wishlist at NaShe Jewels:\n${items}\n\nShop now before they sell out: https://www.nashejewels.in/wishlist\n\n?? NaShe Jewels`)
    } else {
      msg = encodeURIComponent(`Hi ${user.name}! ??\n\nCheck out our latest jewelry collection at NaShe Jewels!\nhttps://www.nashejewels.in\n\n?? NaShe Jewels`)
    }
    if (phone) window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank")
    else window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Customer ${user.name} has no phone on file`)}`, "_blank")
  }

  const totalRevenue = users.reduce((s, u) => s + u.totalSpent, 0)
  const paidCount = orders.filter(o => o.payment_status === "paid").length
  const avgOrderValue = paidCount ? Math.round(totalRevenue / paidCount) : 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>Users</h1>
        <p className="text-gray-500 text-sm mt-1">Customer activity, cart & wishlist</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5"><Users size={18} className="text-[#1B2B5E] mb-3" /><p className="text-2xl font-bold text-[#1B2B5E]">{users.length}</p><p className="text-gray-500 text-xs mt-1">Total Customers</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><DollarSign size={18} className="text-green-400 mb-3" /><p className="text-2xl font-bold text-[#1B2B5E]">{formatINR(totalRevenue)}</p><p className="text-gray-500 text-xs mt-1">Total Revenue</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><ShoppingBag size={18} className="text-blue-400 mb-3" /><p className="text-2xl font-bold text-[#1B2B5E]">{formatINR(avgOrderValue)}</p><p className="text-gray-500 text-xs mt-1">Avg Order Value</p></div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or user ID..."
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-600 focus:outline-none focus:border-[#1B2B5E]" />
      </div>

      <div className="space-y-3">
        {users.length === 0 ? <div className="text-center py-12 text-gray-500">No customers yet</div>
        : users.map(u => {
          const tier = u.totalSpent >= 20000 ? "Gold" : u.totalSpent >= 8000 ? "Silver" : "Bronze"
          const tierColor = tier === "Gold" ? "text-[#1B2B5E] bg-[#1B2B5E]/10" : tier === "Silver" ? "text-gray-600 bg-gray-500/10" : "text-orange-400 bg-orange-500/10"
          const details = userDetails[u.userId]
          const isExpanded = expanded === u.userId
          return (
            <div key={u.userId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => loadUserDetails(u.userId)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1B2B5E]/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1B2B5E] text-sm font-bold">{u.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-[#1A1A2E] text-sm font-medium">{u.name}</p>
                    <p className="text-gray-500 text-xs">{u.orders} orders . {formatINR(u.totalSpent)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tierColor}`}>{tier}</span>
                  {loadingDetails[u.userId]
                    ? <div className="w-4 h-4 border-2 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
                    : isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />
                  }
                </div>
              </div>

              {isExpanded && details && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cart */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs font-medium flex items-center gap-1"><ShoppingCart size={12} /> Cart ({details.cart.length})</p>
                        {details.cart.length > 0 && (
                          <button onClick={() => notifyWhatsApp(u, "cart")}
                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
                            <MessageCircle size={11} /> Remind
                          </button>
                        )}
                      </div>
                      {details.cart.length === 0 ? <p className="text-gray-400 text-xs">Cart is empty</p>
                      : details.cart.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 mb-1">
                          {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-8 h-8 object-cover rounded" onError={e=>{e.target.style.display="none"}} />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A1A2E] text-xs truncate">{item.products?.name}</p>
                            <p className="text-gray-500 text-xs">Qty: {item.quantity} . {formatINR(item.products?.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Wishlist */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs font-medium flex items-center gap-1"><Heart size={12} /> Wishlist ({details.wishlist.length})</p>
                        {details.wishlist.length > 0 && (
                          <button onClick={() => notifyWhatsApp(u, "wishlist")}
                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
                            <MessageCircle size={11} /> Remind
                          </button>
                        )}
                      </div>
                      {details.wishlist.length === 0 ? <p className="text-gray-400 text-xs">Wishlist is empty</p>
                      : details.wishlist.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 mb-1">
                          {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-8 h-8 object-cover rounded" onError={e=>{e.target.style.display="none"}} />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A1A2E] text-xs truncate">{item.products?.name}</p>
                            <p className="text-gray-500 text-xs">{formatINR(item.products?.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp actions */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => notifyWhatsApp(u, "general")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/15 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/25 transition-all">
                      <MessageCircle size={13} /> Send WhatsApp Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
