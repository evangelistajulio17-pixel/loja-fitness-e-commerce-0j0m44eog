import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, CartProvider } from '@/context/AppContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Catalog from '@/pages/Catalog'
import ProductDetail from '@/pages/ProductDetail'
import Promotions from '@/pages/Promotions'
import SearchPage from '@/pages/SearchPage'
import Favorites from '@/pages/Favorites'
import CartPage from '@/pages/Cart'
import CheckoutPage from '@/pages/Checkout'
import MyAccount from '@/pages/MyAccount'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import AdminDashboard from '@/pages/Admin'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'

// Se estiver rodando como arquivo estático, Live Server com index.html na URL ou subpasta sem reescrita de rotas,
// o HashRouter ou basename dinâmico garante que nenhuma rota quebre e a tela não fique em branco.
const isStaticOrFile =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
    window.location.pathname.endsWith('.html') ||
    window.location.port === '5500' ||
    window.location.port === '5501' ||
    window.location.port === '5502' ||
    window.location.pathname.includes('/dist/') ||
    window.location.pathname.includes('loja-fitness-local'))

const RouterComponent = isStaticOrFile ? HashRouter : BrowserRouter

export default function App() {
  return (
    <RouterComponent>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categoria/:categoria" element={<Catalog />} />
              <Route path="/produto/:slug" element={<ProductDetail />} />
              <Route path="/promocoes" element={<Promotions />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/minha-conta" element={<MyAccount />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </RouterComponent>
  )
}
