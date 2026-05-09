import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import OfferBanner from './components/OfferBanner'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useWishlistStore } from './store/wishlistStore'

// Storefront pages (code split)
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))

// Admin pages (code split)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { initialize, user } = useAuthStore()
  const { loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()

  useEffect(() => { initialize() }, [])

  useEffect(() => {
    if (user) {
      loadCart(user.id)
      loadWishlist(user.id)
    } else {
      loadCart(null)
    }
  }, [user])

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Admin routes — own layout, no storefront navbar/footer */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="banners" element={<AdminBanners />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="users" element={<AdminUsers />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Storefront routes */}
          <Route path="/*" element={
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
              <Navbar />
              <OfferBanner />
              <main className="flex-1">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/contact" element={<ContactPage />} />
                    <Route path="/refund-policy" element={<PolicyPage />} />
                    <Route path="/shipping-policy" element={<PolicyPage />} />
                    <Route path="/privacy-policy" element={<PolicyPage />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          } />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111',
              color: '#E5E5E5',
              border: '1px solid rgba(212,175,55,0.3)',
            },
            success: { iconTheme: { primary: '#D4AF37', secondary: '#000' } },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  )
}
