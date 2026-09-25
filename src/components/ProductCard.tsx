import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star, ExternalLink, ArrowRight } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
  priorityImage?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isFavorite, toggleFavorite } = useCart()

  const defaultImg =
    product.images_urls?.[0] ||
    `https://img.usecurling.com/p/500/500?q=${encodeURIComponent(product.category + ' fitness apparel')}&seed=${product.slug}`

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null

  const isFav = isFavorite(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
    const color = product.colors && product.colors.length > 0 ? product.colors[0] : 'Padrão'
    addItem(product, 1, size, color)
  }

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagem do Produto com Badge e Favorito */}
      <Link
        to={`/produto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-100"
      >
        <img
          src={defaultImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Overlay escuro sutil no hover */}
        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/5 transition-colors" />

        {/* Badges no topo esquerdo */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {discountPercent && discountPercent > 0 && (
            <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              Destaque
            </Badge>
          )}
        </div>

        {/* Botão de Favorito no topo direito */}
        <button
          onClick={handleToggleFav}
          aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar produto'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFav
              ? 'bg-rose-50 text-rose-600 shadow'
              : 'bg-white/80 text-slate-600 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Botão Adicionar Rápido deslizando no rodapé da imagem (desktop) */}
        <div className="absolute bottom-2.5 inset-x-2.5 hidden sm:block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10">
          <Button
            onClick={handleQuickAdd}
            size="sm"
            className="w-full bg-slate-950/90 hover:bg-slate-950 text-white text-xs font-bold rounded-xl h-9 shadow-lg flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adicionar Rápido</span>
          </Button>
        </div>
      </Link>

      {/* Dados do Produto */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Marca e Avaliação */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 truncate">
              {product.brand}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            </div>
          </div>

          {/* Nome */}
          <Link to={`/produto/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Preços e Comparação Externa */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-950">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            em até <strong>3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> sem
            juros
          </div>

          {/* Fonte Externa Verificada */}
          {product.external_site && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span className="truncate">Ref: {product.external_site}</span>
              {product.external_price && product.external_price > product.price && (
                <span className="font-bold text-emerald-600 shrink-0">
                  Economize R${' '}
                  {(product.external_price - product.price).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          )}

          {/* Botão Mobile */}
          <div className="mt-3 sm:hidden">
            <Button
              onClick={handleQuickAdd}
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-8"
            >
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
