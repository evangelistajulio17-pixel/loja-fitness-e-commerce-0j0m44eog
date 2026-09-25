import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'

export default function Favorites() {
  const { user } = useAuth()
  const { favorites } = useCart()

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-serif">
          Faça login para ver seus favoritos
        </h1>
        <p className="text-xs text-slate-500">
          Sua lista de desejos fica salva na sua conta para você acessar de qualquer dispositivo.
        </p>
        <Link to="/login">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-11 px-8">
            Entrar ou Criar Conta
          </Button>
        </Link>
      </div>
    )
  }

  const validProducts = favorites
    .map((f) => f.expand?.product)
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
          Meus Produtos Favoritos ({validProducts.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Peças salvas para você acompanhar promoções e comprar quando quiser
        </p>
      </div>

      {validProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Você ainda não favoritou nenhum produto
          </h3>
          <p className="text-xs text-slate-500">
            Clique no ícone de coração em qualquer roupa ou acessório do catálogo para salvar aqui.
          </p>
          <Link to="/categoria/todas">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl mt-2">
              Explorar Produtos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {validProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
