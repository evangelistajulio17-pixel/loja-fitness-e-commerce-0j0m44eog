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
  ChevronRight,
} from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
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
  'FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 299 PARA TODO O BRASIL',
  '10% OFF NA PRIMEIRA COMPRA COM O CUPOM FITNESS10',
  'PARCELAMENTO EM ATÉ 12X SEM JUROS NO CARTÃO DE CRÉDITO',
  'VESTUÁRIO FITNESS PREMIUM COM TECNOLOGIA DRY-FIT E ALTA DENSIDADE',
]

const CATEGORIES_NAV = [
  { slug: 'todas', label: 'Tudo' },
  { slug: 'camisetas', label: 'Camisetas' },
  { slug: 'regatas', label: 'Regatas' },
  { slug: 'calcas', label: 'Calças' },
  { slug: 'leggings', label: 'Leggings' },
  { slug: 'shorts', label: 'Shorts' },
  { slug: 'jaquetas', label: 'Jaquetas' },
  { slug: 'moletons', label: 'Moletons' },
  { slug: 'acessorios', label: 'Acessórios' },
  { slug: 'promocoes', label: 'OFF / Sale', isSpecial: true },
]

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth()
  const { items, cartCount, subtotal, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem } =
    useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
      setIsSearchOpen(false)
    }
  }

  const currentCategory = location.pathname.startsWith('/categoria/')
    ? location.pathname.replace('/categoria/', '')
    : location.pathname === '/promocoes'
      ? 'promocoes'
      : location.pathname === '/'
        ? 'todas'
        : ''

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans">
      {/* 1. TOPBAR CLEAN & SUTIL */}
      <div className="bg-neutral-950 text-neutral-300 py-2 px-4 text-[11px] tracking-wider uppercase font-medium text-center border-b border-neutral-800/80 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span className="truncate transition-opacity duration-300">
            {ANNOUNCEMENTS[announcementIdx]}
          </span>
        </div>
      </div>

      {/* 2. HEADER MINIMALISTA ESTILO BOUTIQUE FIT */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-neutral-700 hover:text-neutral-950 transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Logo Minimalista Clean */}
          <Link to="/" className="flex flex-col items-start group">
            <span className="text-xl sm:text-2xl font-extrabold tracking-[-0.04em] text-neutral-950 leading-none">
              FITWEAR
            </span>
            <span className="text-[9px] tracking-[0.24em] font-semibold text-neutral-400 uppercase mt-1">
              Store Brasil
            </span>
          </Link>

          {/* Categorias Centrais (Desktop) - Estilo Clean Fit / Muv Fit */}
          <nav className="hidden lg:flex items-center gap-7">
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
                  className={`text-[12px] uppercase tracking-wider transition-colors py-2 relative font-medium ${
                    isActive
                      ? 'text-neutral-950 font-semibold'
                      : cat.isSpecial
                        ? 'text-rose-600 hover:text-rose-700 font-semibold'
                        : 'text-neutral-500 hover:text-neutral-950'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-950 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Ações da Direita: Busca, Conta, Favoritos, Carrinho */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Campo de Busca Discreto Desktop */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex relative items-center w-48 lg:w-60"
            >
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-transparent focus:border-neutral-300 rounded-full transition-all outline-none placeholder:text-neutral-400 text-neutral-900"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Busca Mobile Trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Usuário / Conta */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-2 text-neutral-700 hover:text-neutral-950 transition-colors">
                    <UserIcon className="w-5 h-5 stroke-[1.5]" />
                    <span className="hidden xl:inline text-xs font-medium text-neutral-700 max-w-[80px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 mt-2 bg-white rounded-xl shadow-lg border border-neutral-100 p-1"
                >
                  <DropdownMenuLabel className="font-normal text-xs text-neutral-400 px-3 py-2">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-100" />
                  <DropdownMenuItem
                    onClick={() => navigate('/minha-conta')}
                    className="text-xs text-neutral-700 py-2 cursor-pointer rounded-lg hover:bg-neutral-50"
                  >
                    Meus Pedidos & Conta
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/favoritos')}
                    className="text-xs text-neutral-700 py-2 cursor-pointer rounded-lg hover:bg-neutral-50"
                  >
                    Lista de Desejos
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-neutral-100" />
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="text-xs text-neutral-900 font-semibold py-2 cursor-pointer rounded-lg hover:bg-neutral-50"
                      >
                        Painel Administrativo
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-neutral-100" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-rose-600 py-2 cursor-pointer rounded-lg hover:bg-rose-50"
                  >
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors"
                aria-label="Entrar na conta"
              >
                <UserIcon className="w-5 h-5 stroke-[1.5]" />
              </Link>
            )}

            {/* Favoritos */}
            <Link
              to="/favoritos"
              className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors relative"
              aria-label="Favoritos"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Carrinho Minimalista */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-neutral-900 hover:opacity-80 transition-opacity relative flex items-center"
              aria-label="Abrir sacola"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute 1.5 -top-0.5 -right-0.5 bg-neutral-950 text-white font-semibold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Busca Móvel Dropdown */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-neutral-100 bg-white p-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, categoria ou marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </form>
          </div>
        )}

        {/* Sub-menu Mobile em Rolagem Horizontal Clean */}
        <div className="lg:hidden border-t border-neutral-100 bg-white overflow-x-auto no-scrollbar">
          <div className="px-4 flex items-center gap-6 h-11 whitespace-nowrap text-xs font-medium">
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
                  className={`uppercase tracking-wider transition-colors relative py-2 ${
                    isActive
                      ? 'text-neutral-950 font-semibold'
                      : cat.isSpecial
                        ? 'text-rose-600 font-semibold'
                        : 'text-neutral-500'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-950" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* MOBILE MENU SHEET MINIMALISTA */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-sm p-0 flex flex-col bg-white border-r border-neutral-200"
        >
          <SheetHeader className="p-6 border-b border-neutral-100 text-left">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="font-black text-xl tracking-tight text-neutral-950">
                  FITWEAR STORE
                </SheetTitle>
                <p className="text-[10px] tracking-widest text-neutral-400 uppercase mt-0.5">
                  Performance & Estilo
                </p>
              </div>
              <SheetClose asChild>
                <button className="p-2 text-neutral-400 hover:text-neutral-950">
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* Links de Categorias */}
          <div className="flex-1 overflow-y-auto p-6 space-y-1">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
              Coleções
            </p>
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
                  className={`flex items-center justify-between py-3 text-sm transition-colors border-b border-neutral-50 ${
                    cat.isSpecial
                      ? 'text-rose-600 font-semibold'
                      : 'text-neutral-800 hover:text-neutral-950'
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </Link>
              )
            })}

            <div className="pt-6 mt-4 space-y-2">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                Minha Conta
              </p>
              {user ? (
                <>
                  <Link
                    to="/minha-conta"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-sm text-neutral-700"
                  >
                    <UserIcon className="w-4 h-4 text-neutral-400" />
                    Meus Pedidos & Dados
                  </Link>
                  <Link
                    to="/favoritos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-sm text-neutral-700"
                  >
                    <Heart className="w-4 h-4 text-neutral-400" />
                    Lista de Desejos
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-sm font-semibold text-neutral-900"
                    >
                      <ShieldCheck className="w-4 h-4 text-neutral-600" />
                      Painel Administrativo
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-2 text-sm text-rose-600 font-medium"
                  >
                    Sair da Conta
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      navigate('/login')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs rounded-none h-11 uppercase tracking-wider"
                  >
                    Entrar na Conta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* DRAWER DO CARRINHO CLEAN & MINIMALISTA */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-neutral-200"
        >
          <SheetHeader className="p-6 border-b border-neutral-100 flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="font-bold text-base tracking-tight text-neutral-950 uppercase">
                Sua Sacola ({cartCount})
              </SheetTitle>
            </div>
            <SheetClose asChild>
              <button className="p-1 text-neutral-400 hover:text-neutral-950">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </SheetClose>
          </SheetHeader>

          {/* Lista de itens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6 stroke-[1.25]" />
                </div>
                <h3 className="font-semibold text-neutral-800 text-sm">Sua sacola está vazia</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Descubra os lançamentos esportivos da coleção atual e monte seu look.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => setIsDrawerOpen(false)}
                    variant="outline"
                    className="text-xs tracking-wider uppercase font-semibold rounded-none border-neutral-300 hover:bg-neutral-50 px-6 h-10"
                  >
                    Explorar Coleção
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const prod = item.expand?.product
                const price = prod?.price || item.price_at_add || 0
                const img =
                  prod?.images_urls?.[0] ||
                  'https://img.usecurling.com/p/300/300?q=fitness%20apparel'
                const name = prod?.name || 'Produto'
                const brand = prod?.brand || 'FitWear'

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-5 border-b border-neutral-100 items-start"
                  >
                    <img
                      src={img}
                      alt={name}
                      className="w-20 h-24 object-cover bg-neutral-100 shrink-0 rounded-sm"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
                          {brand}
                        </span>
                        <h4 className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
                          {name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                          {item.selected_size && <span>Tam: {item.selected_size}</span>}
                          {item.selected_size && item.selected_color && <span>•</span>}
                          {item.selected_color && <span>Cor: {item.selected_color}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center border border-neutral-200 bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-neutral-500 hover:text-neutral-950"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-neutral-500 hover:text-neutral-950"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-950">
                            R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Rodapé do Drawer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/60 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Frete:</span>
                  <span className="font-medium text-neutral-900">
                    {subtotal >= 299 ? 'GRÁTIS' : 'Calculado no checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total estimado:</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsDrawerOpen(false)
                  navigate('/checkout')
                }}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-semibold h-12 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Finalizar Compra</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1">{children}</main>

      {/* 4. FOOTER EDITORIAL CLEAN & SOFISTICADO */}
      <footer className="bg-white border-t border-neutral-200 text-neutral-600 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-200">
            {/* Coluna 1: Marca & Manifesto Clean */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1">
                <span className="text-xl font-extrabold tracking-[-0.04em] text-neutral-950 block">
                  FITWEAR STORE BRASIL
                </span>
                <span className="text-[10px] tracking-[0.2em] font-medium text-neutral-400 uppercase block">
                  Loja Oficial Fitness
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm font-normal">
                Curadoria premium dedicada exclusivamente ao vestuário e acessórios esportivos de
                alta densidade. Peças testadas para treino intenso, agachamento livre e corrida sem
                transparência.
              </p>
              <div className="pt-1 flex items-center gap-4 text-xs text-neutral-400">
                <span>• Pagamento direto no site</span>
                <span>• Envio para todo o Brasil</span>
              </div>
            </div>

            {/* Coluna 2: Coleções */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-950 uppercase tracking-widest">
                Coleções
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/categoria/camisetas"
                    className="hover:text-neutral-950 transition-colors"
                  >
                    Camisetas Dry-Fit
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/regatas"
                    className="hover:text-neutral-950 transition-colors"
                  >
                    Regatas & Stringers
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/calcas" className="hover:text-neutral-950 transition-colors">
                    Calças Jogger
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/leggings"
                    className="hover:text-neutral-950 transition-colors"
                  >
                    Leggings Zero Transparência
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/shorts" className="hover:text-neutral-950 transition-colors">
                    Shorts & Bermudas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categoria/acessorios"
                    className="hover:text-neutral-950 transition-colors"
                  >
                    Acessórios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Atendimento */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-950 uppercase tracking-widest">
                Atendimento
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/minha-conta" className="hover:text-neutral-950 transition-colors">
                    Acompanhar Pedido
                  </Link>
                </li>
                <li>
                  <Link to="/promocoes" className="hover:text-neutral-950 transition-colors">
                    Cupons & Ofertas
                  </Link>
                </li>
                <li className="text-neutral-400">Segunda a Sexta: 09h às 18h</li>
                <li className="text-neutral-400">contato@fitwear.com.br</li>
              </ul>
            </div>

            {/* Coluna 4: Pagamentos & Segurança */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-950 uppercase tracking-widest">
                Pagamento no Site
              </h4>
              <p className="text-xs text-neutral-500">
                Pagamento seguro processado diretamente na finalização da compra:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-medium rounded-sm">
                  Pix com Aprovação Imediata
                </span>
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-medium rounded-sm">
                  Cartão em até 12x
                </span>
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-medium rounded-sm">
                  Boleto Bancário
                </span>
              </div>
            </div>
          </div>

          {/* Linha inferior de copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
            <p>
              © {new Date().getFullYear()} FitWear Store Brasil. CNPJ: 45.892.124/0001-90. Todos os
              direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Frete Grátis acima de R$ 299</span>
              <span>•</span>
              <span>Primeira Troca Grátis</span>
              <span>•</span>
              <span>Compra 100% Segura</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BANNER FLUTUANTE DE COOKIES DISCRETO */}
      {!cookiesAccepted && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white text-neutral-900 p-4 rounded-lg shadow-xl border border-neutral-200 animate-in fade-in">
          <p className="text-xs text-neutral-600 leading-relaxed mb-3">
            Utilizamos cookies para oferecer navegação rápida, segura e guardar seus itens na
            sacola.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCookiesAccepted(true)}
              className="text-xs text-neutral-600 border-neutral-300 hover:bg-neutral-50 h-8 rounded-none"
            >
              Recusar
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptCookies}
              className="bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-semibold h-8 rounded-none uppercase tracking-wider"
            >
              Aceitar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
