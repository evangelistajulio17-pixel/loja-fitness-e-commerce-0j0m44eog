import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
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
    'Legging compressão',
    'Cinto de musculação',
    'Regata cavada',
    'Moletom oversized',
    'Garrafa térmica',
    'Short 2 em 1',
    'Jaqueta corta-vento',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Search Header Minimalista */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 block">
          Catálogo FitWear
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 uppercase">
          Buscar Peças
        </h1>

        <form onSubmit={handleSubmit} className="relative flex items-center pt-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o que procura (ex: legging, regata, camiseta)..."
            className="w-full pl-11 pr-24 py-3 bg-white border-neutral-300 rounded-none text-xs outline-none focus:border-neutral-950 h-12"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
          <Button
            type="submit"
            className="absolute right-1.5 bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs h-9 px-5 rounded-none uppercase tracking-wider"
          >
            Buscar
          </Button>
        </form>

        {/* Sugestões Clean */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {SUGGESTIONS.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                setSearchParams({ q: term })
              }}
              className="px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 text-[11px] font-medium border border-neutral-200 transition-colors uppercase tracking-wider"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="pt-4">
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
        ) : initialQuery ? (
          products.length > 0 ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-200/70 pb-3">
                <span>
                  Resultados para <strong className="text-neutral-950">"{initialQuery}"</strong>:{' '}
                  {totalCount} produto(s)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-50 p-8 space-y-3 max-w-md mx-auto">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
                Nenhum resultado para "{initialQuery}"
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tente buscar por termos mais genéricos como "camiseta", "short", "legging" ou
                "moletom".
              </p>
              <Link to="/categoria/todas">
                <Button className="bg-neutral-950 text-white font-medium text-xs uppercase tracking-wider rounded-none px-6 h-10 mt-2">
                  Ver Coleção Completa
                </Button>
              </Link>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
