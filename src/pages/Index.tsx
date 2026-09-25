import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Tag,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react'
import { getProducts, getCategories } from '@/services/products'
import type { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const HERO_SLIDES = [
  {
    tag: 'COLEÇÃO OFICIAL 2025',
    title: 'VISTA-SE PARA VENCER.',
    subtitle:
      'Roupas fitness inteligentes com tecnologia Dry-Fit, zero transparência e compressão muscular graduada.',
    cta: 'Explorar Catálogo',
    link: '/categoria/camisetas',
    bgGradient: 'from-slate-950 via-slate-900 to-emerald-950',
    accentText: 'Tecnologia que Respira com Você',
  },
  {
    tag: 'QUEIMA DE ESTOQUE FITNESS',
    title: 'ATÉ 50% OFF EM PRODUTOS SELECIONADOS.',
    subtitle:
      'Mais de 100 itens autênticos de grandes marcas como Growth, Darkness, Live!, Morrison e Calf Expert.',
    cta: 'Ver Ofertas do Dia',
    link: '/promocoes',
    bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    accentText: 'Preços Verificados em Tempo Real',
  },
  {
    tag: 'ZERO TRANSPARÊNCIA COMPROVADA',
    title: 'LEGGINGS & BERMUDAS DE ALTA DENSIDADE.',
    subtitle:
      'Segurança absoluta para o seu agachamento livre. Tecidos blackout testados em condições extremas de luz.',
    cta: 'Conhecer Linha Power',
    link: '/categoria/leggings',
    bgGradient: 'from-slate-900 via-emerald-950 to-slate-950',
    accentText: 'Máxima Performance e Conforto',
  },
]

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [newestProducts, setNewestProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  // Newsletter email state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [featuredRes, saleRes, newestRes, catList] = await Promise.all([
          getProducts({ isFeatured: true, perPage: 8 }),
          getProducts({ isOnSale: true, perPage: 8 }),
          getProducts({ sort: 'newest', perPage: 8 }),
          getCategories(),
        ])

        setFeaturedProducts(featuredRes.items)
        setSaleProducts(saleRes.items)
        setNewestProducts(newestRes.items)
        setCategories(catList)
      } catch (err) {
        console.error('Error loading home data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Auto carousel slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
    }
  }

  const currentSlide = HERO_SLIDES[activeSlide]

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO CAROUSEL */}
      <section className="relative overflow-hidden bg-slate-950 min-h-[520px] lg:min-h-[580px] flex items-center">
        {/* Background glow and subtle mesh */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} transition-all duration-1000 opacity-95`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentSlide.tag}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-serif leading-[1.08]">
              {currentSlide.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              {currentSlide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={currentSlide.link}>
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 group transition-all"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/promocoes">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-slate-700 hover:bg-slate-800 hover:text-white font-bold text-sm px-6 h-12 rounded-xl"
                >
                  Ver Cupons Ativos
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 font-semibold border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Roupas & Acessórios (Sem Tênis)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pagamento Direto no Site</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel slide indicators */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. BARRA DE VANTAGENS OFICIAIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Frete Grátis Brasil</h4>
              <p className="text-[11px] text-slate-500">Em compras a partir de R$ 299</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pagamento no Site</h4>
              <p className="text-[11px] text-slate-500">Pix com aprovação imediata</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Troca Fácil 30 Dias</h4>
              <p className="text-[11px] text-slate-500">Primeira troca 100% gratuita</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Preços Verificados</h4>
              <p className="text-[11px] text-slate-500">Transparência com fontes reais</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIAS EM DESTAQUE (CARDS COM FOTOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Navegue por Categoria
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif tracking-tight mt-1">
              Guarda-Roupa Esportivo Completo
            </h2>
          </div>
          <Link
            to="/categoria/camisetas"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.name}`}
              className="group relative flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-3 hover:border-emerald-500 hover:shadow-md transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 mb-2.5 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                <img
                  src={
                    cat.image_url || `https://img.usecurling.com/p/200/200?q=${cat.name}%20fitness`
                  }
                  alt={cat.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {cat.display_name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PRODUTOS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                Mais Procurados
              </Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Seleção Especial
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif tracking-tight mt-1">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Explorar catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. BANNER PROMOCIONAL VIBRANTE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 p-8 sm:p-12 text-white shadow-xl shadow-emerald-600/10">
          <div className="relative z-10 max-w-xl space-y-4">
            <Badge className="bg-white text-emerald-700 font-extrabold text-xs px-3 py-1">
              CUPOM EXCLUSIVO
            </Badge>
            <h3 className="text-3xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
              GANHE 10% OFF EXTRA NA PRIMEIRA COMPRA
            </h3>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-normal">
              Utilize o código promocional{' '}
              <span className="font-black bg-emerald-900/40 px-2 py-0.5 rounded text-white tracking-wider border border-white/20">
                FITNESS10
              </span>{' '}
              no checkout para garantir desconto automático no subtotal da sua sacola.
            </p>
            <div className="pt-2">
              <Link to="/promocoes">
                <Button className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md">
                  Ver Todas as Ofertas e Cupons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LANÇAMENTOS E MAIS RECENTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Novidades da Semana
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif tracking-tight mt-1">
              Lançamentos de Performance
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Ver todas novidades <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. PROMOÇÕES COM COMPARAÇÃO DE PREÇOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-600 text-white font-bold text-[10px]">Preço Baixo</Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Compre e Economize
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif tracking-tight mt-1">
              Ofertas Imperdíveis
            </h2>
          </div>
          <Link
            to="/promocoes"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Ver página de promoções <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER VIP */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Comunidade FitWear VIP
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-serif">
            Receba Cupons Exclusivos e Alertas de Promoção
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Cadastre seu e-mail para receber descontos relâmpago e lançamentos das principais marcas
            fitness antes de todo mundo.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold max-w-md mx-auto flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Inscrição confirmada! Use o cupom BEMVINDO15 na sua compra.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                placeholder="Seu melhor e-mail..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 h-12 rounded-xl text-xs"
              >
                Cadastrar
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
