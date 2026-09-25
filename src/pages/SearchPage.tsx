import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ArrowRight, Frown } from 'lucide-react'
import { getProducts } from '@/services/products'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setQuery(initialQuery)
    if (initialQuery.trim()) {
      handleSearch(initialQuery)
    } else {
      setProducts([])
      setTotalCount(0)
    }
  }, [initialQuery])

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return
    try {
      setLoading(true)
      const res = await getProducts({
        search: searchTerm,
        perPage: 36,
      })
      setProducts(res.items)
      setTotalCount(res.totalItems)
    } catch (err) {
      console.error('Error during search:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const SUGGESTIONS = [
    'Camiseta dry-fit',
    'Legging cós alto',
    'Cinto de musculação',
    'Moletom oversized',
    'Garrafa térmica inox',
    'Bermuda compressão',
    'Luva de treino',
    'Short 2 em 1',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-serif">
          Busca no Catálogo FitWear
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Pesquise por nome da peça, tecido, modelo ou marca parceira
        </p>

        <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o que procura (ex: camiseta growth, legging live, moletom darkness)..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <Button
            type="submit"
            className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl"
          >
            Buscar
          </Button>
        </form>

        {/* Chips de Sugestões */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Sugestões:</span>
          {SUGGESTIONS.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                setSearchParams({ q: term })
              }}
              className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-full border border-slate-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="pt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : initialQuery ? (
          products.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-200 pb-3">
                <span>
                  Resultados para <strong className="text-slate-900">"{initialQuery}"</strong>:{' '}
                  {totalCount} produto(s) encontrado(s)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Frown className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhum produto encontrado para "{initialQuery}"
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verifique a ortografia ou experimente termos mais genéricos como "camiseta",
                "legging", "short" ou "boné". Lembre-se: não comercializamos calçados.
              </p>
              <Link to="/categoria/todas">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Ver Todos os Produtos
                </Button>
              </Link>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
