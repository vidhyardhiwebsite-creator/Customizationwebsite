import { useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, MapPin, ShoppingBag, DollarSign } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatINR } from '../../utils/format'

const COLORS = ['#D4AF37', '#F0D060', '#B8960C', '#8B6914', '#E8C84A', '#C9A227', '#FFD700', '#DAA520']

const TooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#999' },
}

export default function AdminAnalytics() {
  const { stats, orders, loadOrders, loadProducts, computeStats } = useAdminStore()

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).then(() => computeStats())
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Revenue by category
  const revenueByCategory = stats.categorySales

  // Monthly revenue (last 30 days grouped by week)
  const weeklyData = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7)
    const end = new Date(); end.setDate(end.getDate() - w * 7)
    const label = `Week ${4 - w}`
    const weekOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d >= start && d < end
    })
    weeklyData.push({
      week: label,
      orders: weekOrders.length,
      revenue: weekOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]" style={{ fontFamily: 'Georgia, serif' }}>Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Sales performance and insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: formatINR(stats.totalRevenue), color: 'text-[#D4AF37]' },
          { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Avg Order Value', value: formatINR(stats.totalOrders ? Math.round(stats.totalRevenue / stats.paidOrders || 0) : 0), color: 'text-green-400' },
          { icon: MapPin, label: 'Cities Reached', value: stats.cityData?.length || 0, color: 'text-purple-400' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className="text-2xl font-bold text-[#1B2B5E]">{k.value}</p>
            <p className="text-gray-500 text-xs mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-[#1B2B5E] font-medium mb-4">Revenue Trend (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.last14Days}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...TooltipStyle} formatter={(v, n) => [n === 'revenue' ? formatINR(v) : v, n]} />
            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#goldGrad)" strokeWidth={2} name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[#1B2B5E] font-medium mb-4">Weekly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 11 }} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Revenue Pie */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[#1B2B5E] font-medium mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TooltipStyle} formatter={v => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Analytics */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-[#1B2B5E] font-medium mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-[#D4AF37]" /> Location Analytics – Top Cities
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#999', fontSize: 11 }} width={80} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {stats.cityData.map((c, i) => (
              <div key={c.city} className="flex items-center gap-3">
                <span className="text-[#D4AF37] text-xs w-5 font-bold">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#1A1A2E] text-xs">{c.city}</span>
                    <span className="text-gray-500 text-xs">{c.count} orders</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.count / stats.cityData[0].count) * 100}%`,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-[#1B2B5E] font-medium mb-4">Best Selling Products</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 9 }} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} />
            <Tooltip {...TooltipStyle} />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} name="Units Sold">
              {stats.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
