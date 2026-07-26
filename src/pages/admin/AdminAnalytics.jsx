import { useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, MapPin, ShoppingBag, DollarSign } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatINR } from '../../utils/format'

const GOLD_COLORS = ['#C8A23A', '#A88422', '#8B5E3C', '#D4AF37', '#6F655A', '#E4C55A', '#B8860B', '#2C241B']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DED1', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 4px 12px rgba(44,36,27,0.1)' }}>
      <p style={{ color: '#8F857A', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#C8A23A', margin: 0, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' || p.name === 'revenue' ? formatINR(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const card = {
  background: '#FFFFFF',
  border: '1px solid #E7DED1',
  borderRadius: 14,
  padding: 'clamp(14px,2vw,20px)',
  minWidth: 0,
  overflow: 'hidden',
}

const chartTitle = {
  fontFamily: "'Inter',sans-serif",
  fontWeight: 700,
  fontSize: 13,
  color: '#2C241B',
  margin: '0 0 14px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

export default function AdminAnalytics() {
  const { stats, orders, loadOrders, loadProducts, computeStats } = useAdminStore()

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).then(() => computeStats())
  }, [])

  if (!stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #C8A23A', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
      </div>
    )
  }

  // Weekly data (last 4 weeks)
  const weeklyData = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7)
    const end   = new Date(); end.setDate(end.getDate() - w * 7)
    const weekOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d >= start && d < end
    })
    weeklyData.push({
      week: `Wk ${4 - w}`,
      orders: weekOrders.length,
      revenue: weekOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    })
  }

  const KPIs = [
    { icon: DollarSign, label: 'Total Revenue',    value: formatINR(stats.totalRevenue),                                                            iconColor: '#C8A23A', bg: 'rgba(200,162,58,0.1)'  },
    { icon: ShoppingBag,label: 'Total Orders',      value: stats.totalOrders,                                                                        iconColor: '#2E7D32', bg: 'rgba(46,125,50,0.1)'   },
    { icon: TrendingUp,  label: 'Avg Order Value',  value: formatINR(stats.paidOrders ? Math.round(stats.totalRevenue / stats.paidOrders) : 0),      iconColor: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
    { icon: MapPin,      label: 'Cities Reached',   value: stats.cityData?.length || 0,                                                              iconColor: '#A855F7', bg: 'rgba(168,85,247,0.1)'  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2vw,20px)', maxWidth: '100%', minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{ paddingBottom: 12, borderBottom: '1px solid #E7DED1' }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#2C241B', margin: 0 }}>
          Analytics
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#8F857A', margin: '3px 0 0' }}>
          Sales performance and insights
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'clamp(8px,1.5vw,14px)' }}
        className="lg:grid-cols-4">
        {KPIs.map((k, i) => (
          <div key={i} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={15} style={{ color: k.iconColor }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 'clamp(14px,2.5vw,20px)', color: '#2C241B', margin: '0 0 2px', lineHeight: 1.1 }}>{k.value}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A', margin: 0 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Area Chart ── */}
      <div style={card}>
        <p style={chartTitle}><TrendingUp size={14} style={{ color: '#C8A23A' }} /> Revenue Trend (Last 14 Days)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.last14Days}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C8A23A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C8A23A" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
            <XAxis dataKey="date" tick={{ fill: '#8F857A', fontSize: 9 }} />
            <YAxis tick={{ fill: '#8F857A', fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#C8A23A" fill="url(#goldGrad)" strokeWidth={2} name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weekly Orders + Category Pie ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(8px,1.5vw,14px)' }}
        className="lg:grid-cols-2">
        <div style={card}>
          <p style={chartTitle}>Weekly Orders</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
              <XAxis dataKey="week" tick={{ fill: '#8F857A', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8F857A', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orders" fill="#C8A23A" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <p style={chartTitle}>Revenue by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.categorySales}
                cx="50%" cy="50%"
                outerRadius={75}
                dataKey="value" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.categorySales.map((_, i) => <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Location Analytics ── */}
      <div style={card}>
        <p style={chartTitle}>
          <MapPin size={14} style={{ color: '#C8A23A' }} /> Location Analytics — Top Cities
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}
          className="lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
              <XAxis type="number" tick={{ fill: '#8F857A', fontSize: 9 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8F857A', fontSize: 10 }} width={72} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#A88422" radius={[0, 4, 4, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.cityData.map((c, i) => (
              <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#C8A23A', width: 16, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#2C241B', fontWeight: 500 }}>{c.city}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#8F857A' }}>{c.count} orders</span>
                  </div>
                  <div style={{ height: 4, background: '#F3EEE6', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(c.count / stats.cityData[0].count) * 100}%`,
                      background: `linear-gradient(90deg, ${GOLD_COLORS[i % GOLD_COLORS.length]}, ${GOLD_COLORS[(i + 1) % GOLD_COLORS.length]})`,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best Selling Products ── */}
      <div style={card}>
        <p style={chartTitle}>Best Selling Products</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3EEE6" />
            <XAxis dataKey="name" tick={{ fill: '#8F857A', fontSize: 9 }} />
            <YAxis tick={{ fill: '#8F857A', fontSize: 9 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} name="Units Sold">
              {stats.topProducts.map((_, i) => <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
