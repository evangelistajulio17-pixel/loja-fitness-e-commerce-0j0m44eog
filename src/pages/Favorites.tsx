import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'

export default function Favorites() {
  const { user } = useAuth()
  const { favorites } = useCart()

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-28 text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 stroke-[1.25]" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
          Entre para ver seus favoritos
        </h1>
        <p className="text-xs text-neutral-400">
          Sua lista de desejos fica salva na sua conta para acesso a qualquer momento.
        </p>
        <Link to="/login">
          <Button className="bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs rounded-none uppercase tracking-wider px-8 h-11">
            Entrar na Conta
          </Button>
        </Link>
      </div>
    )
  }

  const validProducts = favorites
    .map((f) => f.expand?.product)
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-neutral-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-950">
          Lista de Desejos ({validProducts.length})
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Peças salvas para você acompanhar novidades e concluir quando preferir
        </p>
      </div>

      {validProducts.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 p-8 space-y-3 max-w-md mx-auto">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
            Sua lista está vazia
          </h3>
          <p className="text-xs text-neutral-400">
            Clique no ícone de coração em qualquer peça do catálogo para salvar aqui.
          </p>
          <Link to="/categoria/todas">
            <Button className="bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider rounded-none px-6 h-10 mt-2">
              Explorar Coleção
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
          {validProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
