import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Tag,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/context/AppContext'
import { getProducts, getCategories, getCoupons } from '@/services/products'
import { getOrders } from '@/services/orders'
import type { Product, Category, Coupon, Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>(
    'overview',
  )
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Product Form State (New / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'camisetas',
    price: 99.9,
    compare_at_price: 129.9,
    brand: 'Growth Apparel',
    external_site: 'Growth Supplements',
    external_url: 'https://www.gsuplementos.com.br',
    external_price: 119.9,
    price_verified_at: '24/02/2025',
    is_on_sale: false,
    is_featured: false,
    inventory: 100,
    sizes: 'P, M, G, GG',
    colors: 'Preto, Cinza',
    composition: '100% Poliamida Dry-Fit',
  })

  // Coupon Form State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: 10,
    description: '',
  })

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [prodRes, ordRes, coupRes, catRes] = await Promise.all([
        getProducts({ perPage: 150 }),
        getOrders(),
        getCoupons(),
        getCategories(),
      ])
      setProducts(prodRes.items)
      setOrders(ordRes)
      setCoupons(coupRes)
      setCategories(catRes)
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      // Allow viewing but inform if not admin
      return
    }
    loadAdminData()
  }, [isAdmin])

  // Overview metrics calculations
  const totalRevenue = orders.reduce(
    (acc, curr) => acc + (curr.status === 'pago' ? curr.total : 0),
    0,
  )
  const pendingOrders = orders.filter((o) => o.status === 'pendente').length

  // Chart data: Sales by category distribution
  const categoryCounts = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat.name).length
    return { name: cat.display_name, total: count }
  })

  const COLORS = [
    '#22c55e',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f97316',
    '#eab308',
    '#64748b',
  ]

  // Sales Trend Mock Data based on current orders + baseline
  const salesHistory = [
    { day: 'Dia 1', vendas: 1200 },
    { day: 'Dia 5', vendas: 2400 },
    { day: 'Dia 10', vendas: 3800 },
    { day: 'Dia 15', vendas: 5100 },
    { day: 'Dia 20', vendas: 7400 },
    { day: 'Dia 25', vendas: 9200 },
    { day: 'Hoje', vendas: totalRevenue > 0 ? 9200 + totalRevenue : 11500 },
  ]

  // Update order status in PocketBase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await pb.collection('orders').update(orderId, { status: newStatus })
      toast({
        title: 'Status atualizado',
        description: `O pedido agora está como "${newStatus}".`,
      })
      loadAdminData()
    } catch (err) {
      console.error('Error updating order:', err)
      toast({
        title: 'Erro ao atualizar',
        description: 'Verifique permissões.',
        variant: 'destructive',
      })
    }
  }

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.slug.toLowerCase().replace(/\s+/g, '-'),
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        compare_at_price: productForm.compare_at_price
          ? Number(productForm.compare_at_price)
          : undefined,
        brand: productForm.brand,
        external_site: productForm.external_site,
        external_url: productForm.external_url,
        external_price: productForm.external_price ? Number(productForm.external_price) : undefined,
        price_verified_at: productForm.price_verified_at,
        is_on_sale: productForm.is_on_sale,
        is_featured: productForm.is_featured,
        inventory: Number(productForm.inventory),
        sizes: productForm.sizes.split(',').map((s) => s.trim()),
        colors: productForm.colors.split(',').map((c) => c.trim()),
        composition: productForm.composition,
        images_urls: [
          `https://img.usecurling.com/p/600/600?q=${encodeURIComponent(productForm.category + ' fitness apparel')}&seed=${productForm.slug}`,
          `https://img.usecurling.com/p/600/600?q=${encodeURIComponent(productForm.category + ' workout')}&seed=${productForm.slug}-2`,
        ],
      }

      if (editingProductId) {
        await pb.collection('products').update(editingProductId, payload)
        toast({ title: 'Produto atualizado!' })
      } else {
        await pb.collection('products').create(payload)
        toast({ title: 'Produto cadastrado com sucesso!' })
      }

      setIsProductModalOpen(false)
      loadAdminData()
    } catch (err) {
      console.error('Error saving product:', err)
      toast({
        title: 'Erro ao salvar produto',
        description: 'Verifique se o slug é único.',
        variant: 'destructive',
      })
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente remover este produto do catálogo?')) return
    try {
      await pb.collection('products').delete(id)
      toast({ title: 'Produto removido!' })
      loadAdminData()
    } catch (err) {
      console.error('Error deleting product:', err)
      toast({ title: 'Erro ao excluir produto', variant: 'destructive' })
    }
  }

  // Create Coupon
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pb.collection('coupons').create({
        code: couponForm.code.toUpperCase().trim(),
        discount_percent: Number(couponForm.discount_percent),
        description: couponForm.description,
        is_active: true,
      })
      toast({ title: 'Cupom criado!' })
      setIsCouponModalOpen(false)
      loadAdminData()
    } catch {
      toast({ title: 'Erro ao criar cupom', variant: 'destructive' })
    }
  }

  // Access Guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-serif">
          Acesso Restrito ao Administrador
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Esta rota é reservada aos gestores da FitWear Store Brasil. Faça login com o e-mail de
          superadministrador.
        </p>
        <Link to="/login">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-11 px-8">
            Entrar como Administrador
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PAINEL ADMINISTRATIVO FITWEAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            Gestão do E-commerce Fitness
          </h1>
          <p className="text-xs text-slate-400">
            Catálogo 100% oficial de vestuário e acessórios • Total de produtos: {products.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadAdminData}
            variant="outline"
            size="sm"
            className="text-white border-slate-700 hover:bg-slate-800 text-xs font-bold rounded-xl h-10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </Button>
          <Button
            onClick={() => {
              setEditingProductId(null)
              setProductForm({
                name: '',
                slug: '',
                description: '',
                category: 'camisetas',
                price: 99.9,
                compare_at_price: 129.9,
                brand: 'Growth Apparel',
                external_site: 'Growth Supplements',
                external_url: 'https://www.gsuplementos.com.br',
                external_price: 119.9,
                price_verified_at: '24/02/2025',
                is_on_sale: false,
                is_featured: false,
                inventory: 100,
                sizes: 'P, M, G, GG',
                colors: 'Preto, Cinza',
                composition: '100% Poliamida Dry-Fit',
              })
              setIsProductModalOpen(true)
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl h-10 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Button>
        </div>
      </div>

      {/* Navegação entre Abas do Painel */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visão Geral & Métricas
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Produtos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pedidos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'coupons'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cupons ({coupons.length})
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL COM RECHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Faturamento Confirmado
                </span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-950 font-serif">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                +18.4% em relação ao mês anterior
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Produtos no Catálogo
                </span>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-950 font-serif">
                {products.length} itens
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                100% Roupas e Acessórios (Sem tênis)
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pedidos Realizados
                </span>
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-950 font-serif">
                {orders.length} pedidos
              </div>
              <p className="text-[11px] text-amber-600 font-semibold">
                {pendingOrders} aguardando pagamento
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Conversão no Site
                </span>
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-950 font-serif">4.8%</div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Aprovação imediata de Pix e Cartão
              </p>
            </div>
          </div>

          {/* Gráficos Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico 1: Vendas */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Crescimento de Faturamento (R$ BRL)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesHistory}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Vendas']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="vendas" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Breakdown por Categoria */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Distribuição do Catálogo por Categoria
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryCounts}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry.name || ''}: ${(entry as unknown as { total: number }).total || 0}`
                      }
                    >
                      {categoryCounts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CRUD DE PRODUTOS */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Produtos Cadastrados ({products.length})
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie preços, marcas parceiras, fontes externas e promoções
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Foto & Nome</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Marca</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Fonte Externa</th>
                  <th className="p-3">Promoção</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 50).map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images_urls?.[0]}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                        />
                        <div className="max-w-[200px] truncate">
                          <Link
                            to={`/produto/${prod.slug}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 truncate block"
                          >
                            {prod.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">{prod.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 capitalize font-semibold">{prod.category}</td>
                    <td className="p-3 font-semibold text-slate-800">{prod.brand}</td>
                    <td className="p-3 font-black text-slate-900">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-3">
                      {prod.external_site ? (
                        <span className="text-[11px] text-slate-500 truncate block max-w-[120px]">
                          {prod.external_site} (R$ {prod.external_price?.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      {prod.is_on_sale ? (
                        <Badge className="bg-rose-100 text-rose-700 text-[10px]">OFF Ativo</Badge>
                      ) : (
                        <span className="text-slate-400">Padrão</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProductId(prod.id)
                            setProductForm({
                              name: prod.name,
                              slug: prod.slug,
                              description: prod.description,
                              category: prod.category,
                              price: prod.price,
                              compare_at_price: prod.compare_at_price || 0,
                              brand: prod.brand,
                              external_site: prod.external_site || '',
                              external_url: prod.external_url || '',
                              external_price: prod.external_price || 0,
                              price_verified_at: prod.price_verified_at || '24/02/2025',
                              is_on_sale: !!prod.is_on_sale,
                              is_featured: !!prod.is_featured,
                              inventory: prod.inventory || 100,
                              sizes: prod.sizes?.join(', ') || 'P, M, G, GG',
                              colors: prod.colors?.join(', ') || 'Preto, Cinza',
                              composition: prod.composition || '',
                            })
                            setIsProductModalOpen(true)
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: GESTÃO DE PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Gestão de Pedidos ({orders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Mude o status de pedidos para pago, enviado ou entregue
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">ID & Data</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Método</th>
                  <th className="p-3">Status Atual</th>
                  <th className="p-3 text-right">Alterar Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      #{ord.id.slice(0, 8).toUpperCase()}
                      <br />
                      <span className="text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(ord.created).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
                      <span className="text-slate-400 text-[11px]">{ord.customer_email}</span>
                    </td>
                    <td className="p-3 font-black text-slate-900">
                      R$ {ord.total.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-3 uppercase font-semibold text-[11px]">
                      {ord.payment_method.replace('_', ' ')}
                    </td>
                    <td className="p-3">
                      <Badge className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-800"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: GESTÃO DE CUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cupons de Desconto</h2>
              <p className="text-xs text-slate-500">
                Crie novos códigos promocionais para os clientes
              </p>
            </div>
            <Button
              onClick={() => setIsCouponModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo Cupom
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-emerald-700">{c.code}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                    {c.discount_percent}% OFF
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE PRODUTO (NOVO / EDITAR) */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-serif">
              {editingProductId ? 'Editar Produto Fitness' : 'Cadastrar Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label className="font-bold">Nome do Produto</Label>
                <Input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Camiseta Dry-Fit High Performance"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Slug (URL amigável)</Label>
                <Input
                  required
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  placeholder="camiseta-dry-fit-high-performance"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Categoria</Label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                >
                  <option value="camisetas">Camisetas</option>
                  <option value="regatas">Regatas</option>
                  <option value="calcas">Calças</option>
                  <option value="leggings">Leggings</option>
                  <option value="shorts">Shorts</option>
                  <option value="jaquetas">Jaquetas</option>
                  <option value="moletons">Moletons</option>
                  <option value="acessorios">Acessórios (Sem tênis)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Preço de Venda (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Preço Comparativo Riscado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.compare_at_price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, compare_at_price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Marca</Label>
                <Input
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="Growth, Darkness, Live!, etc."
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Nome do Site Externo (Referência)</Label>
                <Input
                  value={productForm.external_site}
                  onChange={(e) =>
                    setProductForm({ ...productForm, external_site: e.target.value })
                  }
                  placeholder="Ex: Netshoes, Amazon"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="font-bold">URL da Fonte Externa</Label>
                <Input
                  value={productForm.external_url}
                  onChange={(e) => setProductForm({ ...productForm, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Preço na Fonte Externa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.external_price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, external_price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Tamanhos (separados por vírgula)</Label>
                <Input
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  placeholder="P, M, G, GG"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="font-bold">Descrição Completa</Label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl"
                  placeholder="Detalhes tecnológicos, conforto e ajuste..."
                />
              </div>

              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_on_sale}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_on_sale: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold">Marcar em Promoção</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold">Destaque na Home</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Salvar Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE NOVO CUPOM */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Criar Novo Cupom</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCoupon} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="font-bold">Código do Cupom</Label>
              <Input
                required
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                }
                placeholder="EX: TREINO20"
                className="uppercase font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-bold">Percentual de Desconto (%)</Label>
              <Input
                type="number"
                min="1"
                max="90"
                required
                value={couponForm.discount_percent}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, discount_percent: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="font-bold">Descrição para o Usuário</Label>
              <Input
                required
                value={couponForm.description}
                onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                placeholder="Ex: 20% OFF em todo o catálogo fitness"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCouponModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Criar Cupom
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
