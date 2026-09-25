import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RotateCcw, CreditCard, ShieldCheck, Check } from 'lucide-react'
import { getProducts, getCategories } from '@/services/products'
import type { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'

const HERO_SLIDES = [
  {
    tag: 'NOVA COLEÇÃO',
    title: 'Alta Performance com Design Essencial',
    subtitle:
      'Modelagens precisas em poliamida e tecidos dry-fit de alta densidade. Zero transparência no agachamento e respirabilidade contínua.',
    cta: 'Explorar Coleção',
    link: '/categoria/todas',
    image:
      'https://img.usecurling.com/p/1600/900?q=fitness%20woman%20activewear%20clean%20minimalist&seed=hero1',
  },
  {
    tag: 'LINHA POWER COMPRESSÃO',
    title: 'Leggings e Shorts que Acompanham seu Ritmo',
    subtitle:
      'Cós anatômico de sustentação firme sem enrolar. Conforto térmico comprovado para treinos de hipertrofia e corrida.',
    cta: 'Ver Leggings',
    link: '/categoria/leggings',
    image:
      'https://img.usecurling.com/p/1600/900?q=workout%20apparel%20editorial%20minimalist&seed=hero2',
  },
  {
    tag: 'MASCULINO & FEMININO',
    title: 'Camisetas e Regatas com Toque de Seda',
    subtitle:
      'Secagem ultrarrápida com corte atlético limpo, dos dias mais quentes às sessões intensas na academia.',
    cta: 'Ver Camisetas',
    link: '/categoria/camisetas',
    image:
      'https://img.usecurling.com/p/1600/900?q=athlete%20training%20gym%20apparel%20clean&seed=hero3',
  },
]

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [newestProducts, setNewestProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6500)
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
    <div className="space-y-20 lg:space-y-24 pb-24">
      {/* 1. HERO EDITORIAL CLEAN (inspirado em Fit e Muv Fit) */}
      <section className="relative w-full overflow-hidden bg-neutral-900 text-white min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex items-center">
        {/* Background image com overlay suave */}
        <div className="absolute inset-0">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center brightness-75 transition-opacity duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-xl space-y-6">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-300 block">
              {currentSlide.tag}
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              {currentSlide.title}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed font-normal max-w-lg">
              {currentSlide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link to={currentSlide.link}>
                <Button
                  size="lg"
                  className="bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-xs uppercase tracking-wider px-8 h-12 rounded-none transition-all"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Indicadores de Slide Clean */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-[3px] transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. BARRA DE BENEFÍCIOS MINIMALISTA (Estilo Muv Fit / FitLoja) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-neutral-200/80">
          <div className="flex items-center gap-3.5">
            <CreditCard className="w-5 h-5 text-neutral-800 stroke-[1.5] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                Até 12x Sem Juros
              </h4>
              <p className="text-[11px] text-neutral-500">Parcele no cartão de crédito</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <Truck className="w-5 h-5 text-neutral-800 stroke-[1.5] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                Frete Grátis
              </h4>
              <p className="text-[11px] text-neutral-500">Para compras acima de R$ 299</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <RotateCcw className="w-5 h-5 text-neutral-800 stroke-[1.5] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                Primeira Troca Grátis
              </h4>
              <p className="text-[11px] text-neutral-500">Em até 30 dias após receber</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <ShieldCheck className="w-5 h-5 text-neutral-800 stroke-[1.5] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                Compra 100% Segura
              </h4>
              <p className="text-[11px] text-neutral-500">Pagamento direto na loja</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIAS COM FOTOS E TIPOGRAFIA MINIMALISTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
              Guarda-Roupa Esportivo
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Compre por Categoria
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.name}`}
              className="group flex flex-col items-center text-center space-y-2.5"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-none border border-neutral-200/60">
                <img
                  src={
                    cat.image_url ||
                    `https://img.usecurling.com/p/300/300?q=${cat.name}%20fitness%20clean`
                  }
                  alt={cat.display_name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-800 group-hover:text-neutral-950 transition-colors">
                {cat.display_name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PRODUTOS EM DESTAQUE (Grid Arejado, White Space Abundante) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
              Curadoria Especial
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Mais Vendidos da Coleção
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Coleção Completa <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-200/60 animate-pulse" />
                <div className="h-4 bg-neutral-200/60 animate-pulse w-3/4" />
                <div className="h-4 bg-neutral-200/60 animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. BANNER EDITORIAL CLEAN (Substitui o antigo gradiente berrante) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-neutral-950 text-white p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg space-y-4 text-left">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-neutral-400 block">
              Benefício Exclusivo
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight">
              10% OFF na Primeira Compra
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              Use o código promocional{' '}
              <strong className="text-white underline font-semibold">FITNESS10</strong> no checkout
              e garanta desconto automático em qualquer peça da loja.
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/promocoes">
              <Button className="bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-xs uppercase tracking-wider px-8 h-12 rounded-none transition-all">
                Ver Cupons & Ofertas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. LANÇAMENTOS E NOVIDADES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
              Lançamentos
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Novidades em Performance
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Novidades <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
          {newestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. OFERTAS & PROMOÇÕES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 block mb-1">
              Descontos Especiais
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Peças Selecionadas com Até 50% OFF
            </h2>
          </div>
          <Link
            to="/promocoes"
            className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Todas as Ofertas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER MINIMALISTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pt-10">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400 block">
          Newsletter
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 uppercase">
          Fique por Dentro dos Lançamentos
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Assine para receber convites antecipados de novas coleções, cupons de desconto e
          reposições de estoque.
        </p>

        {newsletterSubscribed ? (
          <div className="p-4 bg-neutral-100 text-neutral-900 text-xs font-medium max-w-md mx-auto flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Obrigado por se inscrever! Use o cupom BEMVINDO15 na sua próxima compra.</span>
          </div>
        ) : (
          <form
            onSubmit={handleNewsletter}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-3"
          >
            <input
              type="email"
              required
              placeholder="Digite seu e-mail..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
            />
            <Button
              type="submit"
              className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold px-6 h-11 text-xs uppercase tracking-wider rounded-none"
            >
              Inscrever
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
