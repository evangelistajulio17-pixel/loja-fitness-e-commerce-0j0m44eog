import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/context/AppContext'

interface ProductCardProps {
  product: Product
  priorityImage?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isFavorite, toggleFavorite } = useCart()

  const defaultImg =
    product.images_urls?.[0] ||
    `https://img.usecurling.com/p/500/650?q=${encodeURIComponent(product.category + ' fitness apparel')}&seed=${product.slug}`

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

  // Pix value with 5% discount (clean e-commerce Brazilian practice)
  const pixPrice = product.price * 0.95

  return (
    <div className="group relative flex flex-col bg-transparent text-left transition-all">
      {/* Container de Imagem Vertical (estilo proporção 3:4 / editorial como FitLoja / Muv Fit) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-none">
        <Link to={`/produto/${product.slug}`} className="block w-full h-full">
          <img
            src={defaultImg}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback se a imagem quebrar
              const target = e.currentTarget
              if (!target.src.includes('img.usecurling.com')) {
                target.src = `https://img.usecurling.com/p/600/600?q=fitness%20apparel&color=black`
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Badges sutis e minimalistas */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none z-10">
          {discountPercent && discountPercent > 0 && (
            <span className="bg-neutral-950 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && !discountPercent && (
            <span className="bg-white/95 text-neutral-900 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 shadow-xs">
              Novo
            </span>
          )}
        </div>

        {/* Botão de Favorito Discreto no Canto Superior Direito */}
        <button
          onClick={handleToggleFav}
          aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar produto'}
          className="absolute top-2.5 right-2.5 p-1.5 text-neutral-600 hover:text-neutral-950 transition-colors z-10 focus:outline-none"
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 stroke-[1.5] ${
              isFav ? 'fill-neutral-950 text-neutral-950' : 'hover:stroke-neutral-950'
            }`}
          />
        </button>

        {/* Botão Compra Rápida flutuante no Desktop (slide sutil de baixo para cima) */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white/95 hover:bg-white text-neutral-950 text-xs font-semibold py-2.5 uppercase tracking-wider shadow-sm transition-colors"
          >
            Adicionar Rápido
          </button>
        </div>
      </div>

      {/* Grade de Informações com Alto Whitespace e Tipografia Limpa */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between">
        <div>
          {/* Marca / Linha */}
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 block mb-0.5">
            {product.brand}
          </span>

          {/* Nome do Produto */}
          <Link to={`/produto/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-[13px] font-normal text-neutral-900 leading-snug line-clamp-1 group-hover:text-neutral-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Preços e Condições (estilo clean Muv Fit) */}
        <div className="mt-2 space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-neutral-950">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <div className="text-[11px] text-neutral-500 font-normal">
            ou até <strong>6x de R$ {(product.price / 6).toFixed(2).replace('.', ',')}</strong> sem
            juros
          </div>

          <div className="text-[11px] text-neutral-700 font-medium pt-0.5">
            R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX
          </div>
        </div>

        {/* Botão Mobile Discreto */}
        <div className="mt-2.5 sm:hidden">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-neutral-950 hover:bg-neutral-900 text-white text-[11px] font-semibold py-2 uppercase tracking-wider transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
