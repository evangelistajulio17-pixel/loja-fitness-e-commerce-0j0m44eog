import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Percent,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ANNOUNCEMENTS = [
  '⚡ FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299',
  '🔥 ATÉ 50% OFF EM ROUPAS E ACESSÓRIOS SELECIONADOS',
  '🏷️ USE O CUPOM: "FITNESS10" E GANHE 10% OFF EXTRA',
  '🛡️ PRODUTOS 100% OFICIAIS COM COMPARAÇÃO DIRETA DE PREÇOS',
]

const CATEGORIES_NAV = [
  { slug: 'todas', label: 'Todos os Produtos' },
  { slug: 'camisetas', label: 'Camisetas' },
  { slug: 'regatas', label: 'Regatas' },
  { slug: 'calcas', label: 'Calças' },
  { slug: 'leggings', label: 'Leggings' },
  { slug: 'shorts', label: 'Shorts' },
  { slug: 'jaquetas', label: 'Jaquetas' },
  { slug: 'moletons', label: 'Moletons' },
  { slug: 'acessorios', label: 'Acessórios' },
  { slug: 'promocoes', label: '🔥 Promoções', isSpecial: true },
]

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth()
  const { items, cartCount, subtotal, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem } =
    useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // Announcement bar rotating index
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cookiesAccepted, setCookiesAccepted] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const consent = localStorage.getItem('fitwear_cookies_consent')
    if (!consent) {
      setCookiesAccepted(false)
    }
  }, [])

  const handleAcceptCookies = () => {
    localStorage.setItem('fitwear_cookies_consent', 'accepted')
    setCookiesAccepted(true)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  // Active category determination
  const currentCategory = location.pathname.startsWith('/categoria/')
    ? location.pathname.replace('/categoria/', '')
    : location.pathname === '/promocoes'
      ? 'promocoes'
      : location.pathname === '/'
        ? 'todas'
        : ''

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOPBAR ROTATIVA */}
      <div className="bg-slate-950 text-emerald-400 py-2 px-4 text-xs font-semibold tracking-wide text-center transition-all duration-500 flex items-center justify-center gap-2 border-b border-slate-800">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400 shrink-0" />
        <span className="truncate max-w-[90vw] transition-opacity duration-300">
          {ANNOUNCEMENTS[announcementIdx]}
        </span>
      </div>

      {/* 2. HEADER PRINCIPAL */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Oficial */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tighter text-slate-950 font-serif leading-none flex items-center gap-1">
                FITWEAR<span className="text-emerald-500">.</span>
              </span>
              <span className="text-[10px] tracking-widest text-emerald-600 font-bold uppercase">
                Loja Oficial Fitness
              </span>
            </div>
          </Link>

          {/* Barra de Busca Expansível */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative items-center"
          >
            <Input
              type="text"
              placeholder="Buscar camisetas, regatas, moletons, bonés, luvas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-2.5 bg-slate-100/90 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-full text-sm transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 h-8"
            >
              Buscar
            </Button>
          </form>

          {/* Ações: Usuário, Favoritos, Carrinho */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Usuário / Conta */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2.5 py-1.5 h-10 rounded-full hover:bg-slate-100"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 truncate max-w-[90px]">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal text-xs text-slate-500">
                    Conectado como <br />
                    <strong className="text-slate-900 font-medium">{user.email}</strong>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/minha-conta')}>
                    Minha Conta & Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favoritos')}>
                    Meus Favoritos
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="text-emerald-700 font-bold focus:bg-emerald-50 focus:text-emerald-800"
                      >
                        Painel Administrativo
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-700">
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 rounded-full px-3 h-10"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
            )}

            {/* Favoritos */}
            <Link
              to="/favoritos"
              className="relative p-2 text-slate-700 hover:text-emerald-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="sr-only">Favoritos</span>
            </Link>

            {/* Carrinho Trigger */}
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="relative rounded-full bg-slate-900 hover:bg-slate-800 text-white px-3.5 sm:px-4 h-10 flex items-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-xs font-bold">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 3. NAVEGAÇÃO DE CATEGORIAS (ABAS) */}
        <nav className="bg-white border-t border-slate-100 overflow-x-auto no-scrollbar shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 h-12 whitespace-nowrap">
            {CATEGORIES_NAV.map((cat) => {
              const isActive =
                (cat.slug === 'todas' && location.pathname === '/') ||
                (cat.slug === 'promocoes' && location.pathname === '/promocoes') ||
                currentCategory === cat.slug

              const targetUrl =
                cat.slug === 'todas'
                  ? '/'
                  : cat.slug === 'promocoes'
                    ? '/promocoes'
                    : `/categoria/${cat.slug}`

              return (
                <Link
                  key={cat.slug}
                  to={targetUrl}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : cat.isSpecial
                        ? 'text-rose-600 hover:bg-rose-50 font-bold'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* MOBILE MENU SHEET */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col bg-white">
          <SheetHeader className="p-5 border-b border-slate-100 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-extrabold text-xl tracking-tight flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  F
                </span>
                FITWEAR STORE
              </SheetTitle>
              <SheetClose asChild>
                <button className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </SheetClose>
            </div>
            <p className="text-xs text-slate-500 mt-1">Catálogo 100% de Roupas & Acessórios</p>
          </SheetHeader>

          {/* Busca mobile */}
          <div className="p-4 border-b border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Buscar no catálogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm rounded-lg"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>

          {/* Links de Categorias */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Categorias
            </div>
            {CATEGORIES_NAV.map((cat) => {
              const targetUrl =
                cat.slug === 'todas'
                  ? '/'
                  : cat.slug === 'promocoes'
                    ? '/promocoes'
                    : `/categoria/${cat.slug}`

              return (
                <Link
                  key={cat.slug}
                  to={targetUrl}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    cat.isSpecial
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )
            })}

            <div className="pt-4 border-t border-slate-100 my-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Minha Conta
              </div>
              {user ? (
                <>
                  <Link
                    to="/minha-conta"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    Meus Pedidos & Dados
                  </Link>
                  <Link
                    to="/favoritos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Lista de Desejos
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Painel do Administrador
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    Sair da Conta
                  </button>
                </>
              ) : (
                <div className="p-3">
                  <Button
                    onClick={() => {
                      navigate('/login')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Entrar ou Criar Conta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* DRAWER DO CARRINHO GLOBAL */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
          <SheetHeader className="p-5 border-b border-slate-100 flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <SheetTitle className="font-extrabold text-lg text-slate-900">
                Seu Carrinho ({cartCount})
              </SheetTitle>
            </div>
            <SheetClose asChild>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </SheetHeader>

          {/* Lista de itens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Seu carrinho está vazio</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore nosso catálogo com mais de 100 itens fitness e adicione suas roupas
                  favoritas.
                </p>
                <Button
                  onClick={() => setIsDrawerOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full px-6"
                >
                  Explorar Catálogo
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const prod = item.expand?.product
                const price = prod?.price || item.price_at_add || 0
                const img =
                  prod?.images_urls?.[0] ||
                  'https://img.usecurling.com/p/300/300?q=fitness%20clothing'
                const name = prod?.name || 'Produto'
                const brand = prod?.brand || 'FitWear'

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={img}
                      alt={name}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-200 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                          {brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          {item.selected_size && (
                            <span>
                              Tam: <strong>{item.selected_size}</strong>
                            </span>
                          )}
                          {item.selected_color && (
                            <span>
                              Cor: <strong>{item.selected_color}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-950">
                            R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title="Remover produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer do Drawer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete estimado:</span>
                  <span className="font-semibold text-emerald-600">
                    {subtotal >= 299 ? 'GRÁTIS' : 'Calculado no checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                  <span>Total estimado:</span>
                  <span className="text-emerald-600 text-base">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsDrawerOpen(false)
                  navigate('/checkout')
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pagamento 100% no site: Pix, Cartão ou Boleto</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 4. CONTEÚDO PRINCIPAL DA PÁGINA */}
      <main className="flex-1">{children}</main>

      {/* 5. FOOTER COMPLETO E OFICIAL */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Coluna 1: Marca & Missão */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-base shadow">
                  F
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-white font-serif">
                  FITWEAR<span className="text-emerald-400">.</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                A loja oficial de alta performance dedicada exclusivamente ao vestuário e acessórios
                esportivos. Trabalhamos com marcas autênticas de mercado, rigorosamente testadas
                contra transparência e desgaste. Aqui você compara preços de fontes reais e paga
                diretamente no site com total segurança.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  Site Seguro SSL 256-bit
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Sem Calçados (Só Roupas e Acessórios)
                </div>
              </div>
            </div>

            {/* Coluna 2: Categorias */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Categorias</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/categoria/camisetas"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Camisetas Dry-Fit
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/regatas"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Regatas & Stringers
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/calcas" className="hover:text-emerald-400 transition-colors">
                    Calças Jogger & Moletom
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/leggings"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Leggings Zero Transparência
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/shorts" className="hover:text-emerald-400 transition-colors">
                    Shorts 2 em 1 & Bermudas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/jaquetas"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Jaquetas Corta-Vento
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/moletons"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Moletons & Hoodies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/acessorios"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Cintos, Garrafas & Bonés
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Atendimento & Segurança */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Atendimento</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/minha-conta" className="hover:text-emerald-400 transition-colors">
                    Acompanhar Pedido
                  </Link>
                </li>
                <li>
                  <Link to="/promocoes" className="hover:text-emerald-400 transition-colors">
                    Cupons & Ofertas
                  </Link>
                </li>
                <li className="text-slate-400">Segunda a Sexta: 08h às 19h</li>
                <li className="text-slate-400">contato@fitwear.com.br</li>
                <li className="text-slate-400">São Paulo, SP - Brasil</li>
              </ul>
            </div>

            {/* Coluna 4: Formas de Pagamento no Site */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Pagamento no Site
              </h4>
              <p className="text-xs text-slate-400">
                Processamento direto com aprovação imediata no checkout:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-emerald-400">
                  Pix Instantâneo
                </span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">
                  Cartão em até 12x
                </span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">
                  Boleto Bancário
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                Entregas rápidas via Correios e Transportadoras credenciadas em todo o território
                nacional.
              </p>
            </div>
          </div>

          {/* Linha inferior */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © {new Date().getFullYear()} FitWear Store Brasil. Todos os direitos reservados. CNPJ:
              45.892.124/0001-90.
            </p>
            <div className="flex items-center gap-4">
              <span>Termos de Uso</span>
              <span>•</span>
              <span>Política de Privacidade</span>
              <span>•</span>
              <span>Troca Grátis 30 Dias</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BANNER FLUTUANTE DE COOKIES */}
      {!cookiesAccepted && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Utilizamos cookies essenciais para oferecer uma navegação rápida, segura e salvar seu
            carrinho de compras.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCookiesAccepted(true)}
              className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Recusar
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptCookies}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              Aceitar e Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
