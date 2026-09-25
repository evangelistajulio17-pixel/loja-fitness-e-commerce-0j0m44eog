import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import { getProducts, getCategories } from '@/services/products'
import type { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BRANDS = [
  'Growth Apparel',
  'IntegralMédica',
  'Max Titanium',
  'Oxer',
  'Calf Expert',
  'Live!',
  'RVCA Sport',
  'Viko Sports',
  'Dentro Sports',
  'Morrison Iron',
]

export default function Catalog() {
  const { categoria } = useParams<{ categoria: string }>()
  const activeCategory = categoria || 'todas'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [onlySale, setOnlySale] = useState(false)
  const [sortOption, setSortOption] = useState('newest')
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)

  const currentCategoryData = categories.find((c) => c.name === activeCategory)

  // Load Categories on mount
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // Load products when filters or category changes
  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
  }, [activeCategory, selectedBrand, onlySale, sortOption, maxPrice])

  const fetchProducts = async (pageNum: number, replace = false) => {
    try {
      if (replace) setLoading(true)
      else setLoadingMore(true)

      const res = await getProducts({
        category: activeCategory !== 'todas' ? activeCategory : undefined,
        brand: selectedBrand || undefined,
        isOnSale: onlySale || undefined,
        sort: sortOption,
        maxPrice: maxPrice || undefined,
        page: pageNum,
        perPage: 12,
      })

      if (replace) {
        setProducts(res.items)
      } else {
        setProducts((prev) => [...prev, ...res.items])
      }

      setTotalCount(res.totalItems)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Error fetching catalog products:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage, false)
    }
  }

  const clearFilters = () => {
    setSelectedBrand('')
    setOnlySale(false)
    setMaxPrice(undefined)
    setSortOption('newest')
  }

  // Sidebar Filter Component
  const FilterContent = () => (
    <div className="space-y-6 text-sm">
      {/* Promoção Toggle */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-bold text-slate-800">Apenas Ofertas & OFF</span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => setOnlySale(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
        </label>
      </div>

      {/* Marcas */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Marcas</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
              !selectedBrand ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>Todas as marcas</span>
            {!selectedBrand && <Check className="w-3.5 h-3.5" />}
          </button>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand === selectedBrand ? '' : brand)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                selectedBrand === brand
                  ? 'bg-slate-900 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{brand}</span>
              {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Preço Máximo</h4>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="40"
            max="350"
            step="10"
            value={maxPrice || 350}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-bold">
          <span>R$ 40</span>
          <span className="text-emerald-600">Até R$ {maxPrice || 350}</span>
        </div>
      </div>

      {/* Limpar Filtros */}
      {(selectedBrand || onlySale || maxPrice) && (
        <Button
          onClick={clearFilters}
          variant="outline"
          size="sm"
          className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  )

  const categoryTitle =
    activeCategory === 'todas'
      ? 'Catálogo Geral de Fitness'
      : currentCategoryData?.display_name || activeCategory.toUpperCase()

  const categoryDesc =
    currentCategoryData?.description ||
    'Roupas e acessórios esportivos autênticos selecionados para máxima performance.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header da Categoria */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
              Início
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-emerald-600 uppercase">{activeCategory}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-serif tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {categoryDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden flex items-center gap-2 border-slate-300 text-xs font-bold w-full sm:w-auto h-11 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filtros Avançados</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs p-6 bg-white overflow-y-auto">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-lg font-bold">Filtrar Produtos</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>

          {/* Ordenação */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              Ordenar por:
            </span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-48 text-xs font-bold h-11 rounded-xl border-slate-300 bg-white">
                <SelectValue placeholder="Mais recentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Lançamentos</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliação</SelectItem>
                <SelectItem value="discount">Maior Desconto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid Principal com Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 sticky top-36 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filtros
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{totalCount} produtos</span>
          </div>
          <FilterContent />
        </aside>

        {/* Grade de Produtos */}
        <main className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Mostrando {products.length} de {totalCount} produtos
            </span>
            {selectedBrand && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                Marca: {selectedBrand}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente ajustar os filtros de marca ou faixa de preço para encontrar o que procura.
              </p>
              <Button
                onClick={clearFilters}
                className="bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Limpar todos os filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Botão Carregar Mais */}
          {page < totalPages && (
            <div className="text-center pt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-8 h-12 rounded-xl shadow-sm"
              >
                {loadingMore ? 'Carregando mais itens...' : 'Carregar Mais Produtos'}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
