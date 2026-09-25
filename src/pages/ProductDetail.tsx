import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Star,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ArrowRight,
  Info,
  Sparkles,
  Share2,
} from 'lucide-react'
import { getProductBySlug, getProducts } from '@/services/products'
import type { Product } from '@/types'
import { useCart } from '@/context/AppContext'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

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

  // CEP calculator simulation
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

          // Load related products in the same category
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 animate-pulse rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-slate-200 animate-pulse rounded w-1/4" />
            <div className="h-32 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-slate-800">Produto não encontrado</h2>
        <p className="text-xs text-slate-500">
          O produto que você procura pode ter sido esgotado ou renomeado.
        </p>
        <Link to="/categoria/todas">
          <Button className="bg-emerald-600 text-white font-bold text-xs rounded-xl">
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
          `https://img.usecurling.com/p/600/600?q=${product.category}%20clothing&seed=${product.slug}`,
        ]

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null

  const isFav = isFavorite(product.id)

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-semibold overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-slate-600">
          Início
        </Link>
        <span>/</span>
        <Link to={`/categoria/${product.category}`} className="hover:text-slate-600 capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Grid Principal do Produto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Galeria de Fotos */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
            <img
              src={images[selectedImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {discountPercent && discountPercent > 0 && (
              <Badge className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow">
                -{discountPercent}% OFF
              </Badge>
            )}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 shadow-md transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIdx === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
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
        </div>

        {/* Informações de Compra */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                <span className="text-slate-400 font-normal">
                  ({product.rating_count || 120} avaliações)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Bloco de Preços */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-950 font-serif">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-base text-slate-400 line-through">
                  R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 font-medium">
              ou até <strong>3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong>{' '}
              sem juros no cartão
            </div>

            {/* Recurso de Transparência e Comparação com Fonte Externa */}
            {product.external_site && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Preço verificado no mercado:</span>
                  <span className="font-bold text-slate-900">
                    R${' '}
                    {(product.external_price || product.price * 1.2).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Loja de referência: <strong>{product.external_site}</strong>
                  </span>
                  {product.price_verified_at && (
                    <span>Verificado em: {product.price_verified_at}</span>
                  )}
                </div>
                {product.external_url && (
                  <a
                    href={product.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
                  >
                    <span>Conferir na fonte original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Seletor de Tamanhos */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Escolha o Tamanho:</span>
                <span className="text-emerald-600 font-semibold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] h-10 px-3 rounded-xl font-bold text-xs border transition-all ${
                      selectedSize === sz
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seletor de Cores */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Cor Selecionada:</span>
                <span className="text-slate-600 font-semibold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
                      selectedColor === c
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seletor de Quantidade e Botões de Compra */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 text-slate-500 hover:bg-slate-100 h-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-black text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 text-slate-500 hover:bg-slate-100 h-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Adicionar à Sacola</span>
              </Button>
            </div>

            <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Comprar Agora (Pagar no Site)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Simulação de Frete */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Calcular Frete e Prazo de Entrega:
            </span>
            <form onSubmit={handleCalcShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Digite seu CEP (ex: 01001-000)"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-emerald-500"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="font-bold text-xs h-9 rounded-xl"
              >
                Calcular
              </Button>
            </form>

            {shippingCalc && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Entrega Expressa:</span>
                  <span>
                    {shippingCalc.price === 0
                      ? 'GRÁTIS'
                      : `R$ ${shippingCalc.price.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Previsão de entrega: em até {shippingCalc.days} dias úteis após a confirmação do
                  pagamento.
                </div>
              </div>
            )}
          </div>

          {/* Vantagens no Bloco */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>30 dias para troca grátis sem complicação</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Garantia de originalidade oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição Detalhada & Composição */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
            Detalhes e Características da Peça
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
        </div>

        {product.composition && (
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Composição & Cuidados Têxteis
            </h3>
            <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {product.composition}
            </p>
          </div>
        )}
      </div>

      {/* Produtos Semelhantes da Mesma Categoria */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
              Você Também Pode Gostar
            </h2>
            <Link
              to={`/categoria/${product.category}`}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver mais em {product.category} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
