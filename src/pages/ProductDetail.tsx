import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { getProductBySlug, getProducts } from '@/services/products'
import type { Product } from '@/types'
import { useCart } from '@/context/AppContext'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem, isFavorite, toggleFavorite } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  const [cep, setCep] = useState('')
  const [shippingCalc, setShippingCalc] = useState<{ days: number; price: number } | null>(null)

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
        setLoading(true)
        const prod = await getProductBySlug(slug)
        if (prod) {
          setProduct(prod)
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0])
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0])

          const relRes = await getProducts({
            category: prod.category,
            perPage: 5,
          })
          setRelatedProducts(relRes.items.filter((p) => p.id !== prod.id).slice(0, 4))
        }
      } catch (err) {
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-neutral-200/60 animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-neutral-200/60 animate-pulse w-1/4" />
            <div className="h-8 bg-neutral-200/60 animate-pulse w-3/4" />
            <div className="h-6 bg-neutral-200/60 animate-pulse w-1/3" />
            <div className="h-24 bg-neutral-200/60 animate-pulse w-full pt-4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
          Produto não encontrado
        </h2>
        <p className="text-xs text-neutral-500">
          A peça que você procura pode ter sido esgotada ou descontinuada.
        </p>
        <Link to="/categoria/todas">
          <Button className="bg-neutral-950 text-white font-medium text-xs rounded-none uppercase tracking-wider px-6 h-10">
            Voltar ao Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  const images =
    product.images_urls && product.images_urls.length > 0
      ? product.images_urls
      : [
          `https://img.usecurling.com/p/800/1000?q=${product.category}%20fitness%20apparel&seed=${product.slug}`,
        ]

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null

  const isFav = isFavorite(product.id)
  const pixPrice = product.price * 0.95

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor)
  }

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor)
    navigate('/checkout')
  }

  const handleCalcShipping = (e: React.FormEvent) => {
    e.preventDefault()
    if (cep.length >= 8) {
      const free = product.price * quantity >= 299
      setShippingCalc({
        days: 3,
        price: free ? 0 : 29.9,
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      {/* Breadcrumb Clean & Discreto */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-400 font-medium overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-neutral-950 transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link
          to={`/categoria/${product.category}`}
          className="hover:text-neutral-950 transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Grid Principal: Galeria Clean à esquerda + Painel de Compra à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Galeria de Fotos Minimalista (Estilo Boutique Fit / Muv Fit) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
          {/* Miniaturas laterais no Desktop */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0 pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition-all ${
                    selectedImageIdx === idx
                      ? 'border-neutral-950 opacity-100'
                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Imagem Principal Grande */}
          <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden group">
            <img
              src={images[selectedImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Badges sutis */}
            {discountPercent && discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-neutral-950 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1">
                -{discountPercent}% OFF
              </span>
            )}

            {/* Botão Favoritar */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-4 right-4 p-2 text-neutral-700 hover:text-neutral-950 transition-colors z-10"
              aria-label="Favoritar"
            >
              <Heart
                className={`w-5 h-5 stroke-[1.5] ${
                  isFav ? 'fill-neutral-950 text-neutral-950' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Informações de Compra (Clean, Tipografia Forte, Alto Espaço) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1.5 border-b border-neutral-200/70 pb-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Bloco de Preços Clean */}
          <div className="space-y-1 border-b border-neutral-200/70 pb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-neutral-400 line-through">
                  R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500">
              ou em até <strong>6x de R$ {(product.price / 6).toFixed(2).replace('.', ',')}</strong>{' '}
              sem juros no cartão
            </p>

            <p className="text-xs text-neutral-800 font-semibold pt-1">
              R$ {pixPrice.toFixed(2).replace('.', ',')} à vista com 5% de desconto no Pix
            </p>

            {/* Comparação com site externo de referência (recurso preservado de forma clean) */}
            {product.external_site && (
              <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>
                  Referência de mercado: <strong>{product.external_site}</strong>
                </span>
                {product.external_url && (
                  <a
                    href={product.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-700 hover:text-neutral-950 font-medium"
                  >
                    <span>Fonte</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Seletor de Cores Minimalista */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-500">
                  Cor:
                </span>
                <span className="font-medium text-neutral-900">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-1.5 text-xs tracking-wider uppercase border transition-all ${
                      selectedColor === c
                        ? 'border-neutral-950 bg-neutral-950 text-white font-medium'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seletor de Tamanhos Minimalista (Clean como Muv Fit / Fit) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-500">
                  Tamanho:
                </span>
                <span className="font-medium text-neutral-900">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[44px] h-11 px-3 text-xs font-semibold tracking-wider uppercase border transition-all ${
                      selectedSize === sz
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantidade e Botões de Compra */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 bg-white h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 text-neutral-500 hover:text-neutral-950 h-full"
                  aria-label="Diminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-semibold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 text-neutral-500 hover:text-neutral-950 h-full"
                  aria-label="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-neutral-50 text-neutral-950 border border-neutral-950 font-semibold h-12 rounded-none text-xs uppercase tracking-wider"
              >
                Adicionar à Sacola
              </Button>
            </div>

            <Button
              onClick={handleBuyNow}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-semibold h-12 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Comprar Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Simulação de Frete Clean */}
          <div className="pt-4 border-t border-neutral-200/70 space-y-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-neutral-600 block">
              Calcular Frete e Prazo
            </span>
            <form onSubmit={handleCalcShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Digite seu CEP..."
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="flex-1 px-3 py-2 border border-neutral-300 text-xs bg-white outline-none focus:border-neutral-950"
              />
              <Button
                type="submit"
                variant="outline"
                className="text-xs uppercase font-semibold h-9 px-4 rounded-none border-neutral-300 hover:bg-neutral-50"
              >
                Calcular
              </Button>
            </form>

            {shippingCalc && (
              <div className="pt-2 text-xs text-neutral-700 flex justify-between border-t border-neutral-100">
                <span>Entrega Expressa ({shippingCalc.days} dias):</span>
                <span className="font-semibold">
                  {shippingCalc.price === 0
                    ? 'GRÁTIS'
                    : `R$ ${shippingCalc.price.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
            )}
          </div>

          {/* Vantagens Resumidas */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200/70 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-neutral-800 stroke-[1.5] shrink-0" />
              <span>Troca grátis em até 30 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-800 stroke-[1.5] shrink-0" />
              <span>Tecido blackout testado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição e Especificações do Produto (Estilo Editorial) */}
      <div className="border-t border-neutral-200/70 pt-12 space-y-6 max-w-4xl">
        <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-950">
          Detalhes da Peça
        </h2>
        <p className="text-sm text-neutral-600 leading-relaxed font-normal">
          {product.description}
        </p>

        {product.composition && (
          <div className="pt-4 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
              Composição & Cuidados
            </span>
            <p className="text-xs text-neutral-800 font-medium">{product.composition}</p>
          </div>
        )}
      </div>

      {/* Produtos Semelhantes Clean */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 border-t border-neutral-200/70 pt-16">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-950">
              Você Também Pode Gostar
            </h2>
            <Link
              to={`/categoria/${product.category}`}
              className="text-xs uppercase tracking-wider font-medium text-neutral-500 hover:text-neutral-950 flex items-center gap-1"
            >
              Ver Mais em {product.category} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
