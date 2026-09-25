import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RotateCcw, CreditCard, ShieldCheck, Check } from 'lucide-react'
import { getProducts, getCategories, getBrands } from '@/services/products'
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
    tag: 'DESTAQUES LIVE! & DLK',
    title: 'Power Compressão com Cós Anatômico',
    subtitle:
      'Leggings com cós transpassado em V da DLK e tecidos Sensil® Innergy da LIVE! com zero transparência no agachamento.',
    cta: 'Ver Coleção DLK & Live!',
    link: '/categoria/todas?marca=DLK',
    image:
      'https://img.usecurling.com/p/1600/900?q=workout%20apparel%20editorial%20minimalist&seed=hero2',
  },
  {
    tag: 'HONEY BE SEAMLESS',
    title: 'Tecnologia Sem Costura & Toque Macio',
    subtitle:
      'Cores exclusivas, cós largo de 11cm que não dobra e máxima elasticidade para seus treinos diários.',
    cta: 'Explorar Honey Be',
    link: '/categoria/todas?marca=Honey%20Be',
    image:
      'https://img.usecurling.com/p/1600/900?q=honey%20be%20fitness%20legging%20clean&seed=hero_honey',
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
  const [brands, setBrands] = useState<string[]>([])
  const [spotlightByBrand, setSpotlightByBrand] = useState<{
    'Live!': Product[]
    DLK: Product[]
    'Honey Be': Product[]
  }>({
    'Live!': [],
    DLK: [],
    'Honey Be': [],
  })
  const [activeLeaderTab, setActiveLeaderTab] = useState<'Live!' | 'DLK' | 'Honey Be'>('Live!')
  const [activeSlide, setActiveSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // Buscamos um número maior de itens para permitir reordenação e priorização das marcas líderes
        // (Live!, DLK e Honey Be em destaque no topo; WonderSize reduzido nas vitrines)
        const [featuredRes, saleRes, newestRes, catList, brandList, liveRes, dlkRes, honeyRes] =
          await Promise.all([
            getProducts({ isFeatured: true, perPage: 32 }),
            getProducts({ isOnSale: true, perPage: 32 }),
            getProducts({ sort: 'newest', perPage: 32 }),
            getCategories(),
            getBrands(),
            getProducts({ brand: 'Live!', perPage: 4 }),
            getProducts({ brand: 'DLK', perPage: 4 }),
            getProducts({ brand: 'Honey Be', perPage: 4 }),
          ])

        setSpotlightByBrand({
          'Live!': liveRes.items,
          DLK: dlkRes.items,
          'Honey Be': honeyRes.items,
        })

        // Função de pontuação/prioridade de marca para vitrines da Home:
        // Prioridade máxima: Live! / Live! Oficial, DLK, Honey Be
        // Prioridade neutra/média: Alto Giro, Oxer, Growth Apparel, Darkness, De Corpo
        // Prioridade reduzida na Home: WonderSize
        const getBrandPriority = (brandName?: string): number => {
          if (!brandName) return 10
          const b = brandName.toLowerCase()
          if (b.includes('live')) return 1
          if (b.includes('dlk')) return 2
          if (b.includes('honey')) return 3
          if (b.includes('alto giro')) return 4
          if (b.includes('corpo')) return 5
          if (b.includes('oxer')) return 6
          if (b.includes('growth')) return 7
          if (b.includes('darkness') || b.includes('integral')) return 8
          if (b.includes('wonder')) return 20 // WonderSize reduzido nas vitrines principais da Home
          return 10
        }

        const sortWithBrandPriority = (items: Product[], maxItems = 8): Product[] => {
          // Ordena priorizando Live!, DLK e Honey Be; WonderSize vai para o final
          const sorted = [...items].sort((a, b) => {
            const prioA = getBrandPriority(a.brand)
            const prioB = getBrandPriority(b.brand)
            return prioA - prioB
          })
          return sorted.slice(0, maxItems)
        }

        setFeaturedProducts(sortWithBrandPriority(featuredRes.items, 8))
        setSaleProducts(sortWithBrandPriority(saleRes.items, 8))
        setNewestProducts(sortWithBrandPriority(newestRes.items, 8))
        setCategories(catList)

        // Ordenação das marcas para a seção da Home:
        // Prioridade visual: Live!, DLK e Honey Be no topo
        // Em seguida: Alto Giro, De Corpo, Growth, Oxer, IntegralMédica
        // WonderSize reduzido para a posição final
        const prioritizedBrands = [...brandList].sort((a, b) => {
          const prioA = getBrandPriority(a)
          const prioB = getBrandPriority(b)
          if (prioA !== prioB) return prioA - prioB
          return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
        })

        setBrands(prioritizedBrands)
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

      {/* 3.1 MARCAS OFICIAIS - CURADORIA NACIONAL */}
      {/* Destaque máximo em Live!, DLK e Honey Be; WonderSize reduzido */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
              Curadoria Nacional
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Marcas Oficiais & Destaques
            </h2>
          </div>
          <Link
            to="/categoria/todas"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Catálogo Geral <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3.1.A - MARCAS LÍDERES EM DESTAQUE SUPERIOR (Live!, DLK, Honey Be) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950">
              Marcas Principais da Curadoria
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Live! Card Editorial Grande */}
            <Link
              to="/categoria/todas?marca=Live!"
              className="group relative overflow-hidden bg-neutral-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[170px] border border-neutral-900 transition-all hover:border-neutral-700 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    Linha Alta Performance
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 font-medium">
                    20% OFF
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold tracking-tight uppercase group-hover:underline">
                  LIVE!
                </h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2 max-w-xs font-light">
                  Tecnologia Sensil® Innergy, proteção UV50+ permanente e modelagens que esculpem o
                  corpo com zero transparência.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Ver Coleção Live!</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* DLK Card Editorial Grande */}
            <Link
              to="/categoria/todas?marca=DLK"
              className="group relative overflow-hidden bg-neutral-900 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[170px] border border-neutral-800 transition-all hover:border-neutral-600 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    Fabricação Própria
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 font-medium">
                    20% OFF
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold tracking-tight uppercase group-hover:underline">
                  DLK
                </h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2 max-w-xs font-light">
                  Leggings com cós transpassado anatômico em V, bolsos utilitários e tecidos
                  respiráveis de alta compressão.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Ver Coleção DLK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Honey Be Card Editorial Grande */}
            <Link
              to="/categoria/todas?marca=Honey%20Be"
              className="group relative overflow-hidden bg-neutral-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[170px] border border-neutral-900 transition-all hover:border-neutral-700 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    Conforto & Tendência
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 font-medium">
                    20% OFF
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold tracking-tight uppercase group-hover:underline">
                  Honey Be
                </h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2 max-w-xs font-light">
                  Tecnologia sem costura (seamless), cores contemporâneas e cós de sustentação ultra
                  firme que não enrola.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Ver Coleção Honey Be</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>

        {/* 3.1.B - DEMAIS MARCAS DA LOJA (Grid Secundário com WonderSize no final em tamanho discreto) */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 block">
            Outras Marcas & Especialidades Parceiras:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {brands
              // Filtra para exibir as demais marcas (não repetindo as 3 já destacadas no topo)
              .filter(
                (b) =>
                  !b.toLowerCase().includes('live') &&
                  !b.toLowerCase().includes('dlk') &&
                  !b.toLowerCase().includes('honey'),
              )
              .map((brandName) => {
                const isWonderSize = brandName.toLowerCase().includes('wonder')
                return (
                  <Link
                    key={brandName}
                    to={`/categoria/todas?marca=${encodeURIComponent(brandName)}`}
                    className={`group p-3 border transition-all flex flex-col justify-between min-h-[80px] ${
                      isWonderSize
                        ? 'bg-neutral-50/70 border-neutral-200/60 hover:border-neutral-400 opacity-80 hover:opacity-100'
                        : 'bg-white border-neutral-200/90 hover:border-neutral-950'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[11px] uppercase tracking-wider group-hover:underline ${
                          isWonderSize
                            ? 'font-medium text-neutral-600'
                            : 'font-bold text-neutral-900'
                        }`}
                      >
                        {brandName}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-normal">
                      {isWonderSize ? 'Moda Plus Size' : 'Ver Coleção'}
                    </span>
                  </Link>
                )
              })}
          </div>
        </div>
      </section>

      {/* 3.2 VITRINE EXCLUSIVA DAS MARCAS LÍDERES (Live!, DLK, Honey Be) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-neutral-100/50 py-10 border-y border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-1">
              Seleção Especial em Foco
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 uppercase">
              Vitrine das Marcas Líderes
            </h2>
          </div>

          {/* Abas das 3 Marcas em Destaque */}
          <div className="flex items-center gap-1 bg-white p-1 border border-neutral-200 shadow-2xs">
            {(['Live!', 'DLK', 'Honey Be'] as const).map((brandKey) => (
              <button
                key={brandKey}
                onClick={() => setActiveLeaderTab(brandKey)}
                className={`text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-all ${
                  activeLeaderTab === brandKey
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                {brandKey}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da marca ativa + Botão direto para a coleção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-neutral-500 font-normal">
            {activeLeaderTab === 'Live!' &&
              'Coleção LIVE! Oficial: alta performance com tecido Sensil®, proteção UV e secagem ultrarrápida.'}
            {activeLeaderTab === 'DLK' &&
              'Coleção DLK: leggings anatômicas com cós transpassado em V, bolsos utilitários e fabricação nacional.'}
            {activeLeaderTab === 'Honey Be' &&
              'Coleção Honey Be: linha seamless sem costura, cores exclusivas e sustentação anti-enrolamento.'}
          </p>
          <Link
            to={`/categoria/todas?marca=${encodeURIComponent(activeLeaderTab)}`}
            className="text-neutral-950 font-semibold hover:underline flex items-center gap-1 shrink-0 uppercase tracking-wider text-[11px]"
          >
            Ver catálogo completo de {activeLeaderTab} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid dos 4 produtos em foco da marca selecionada */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
          {spotlightByBrand[activeLeaderTab]?.map((product) => (
            <ProductCard key={product.id} product={product} />
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
