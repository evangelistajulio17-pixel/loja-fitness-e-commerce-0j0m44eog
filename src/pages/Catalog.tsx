import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, Check } from 'lucide-react'
import { getProducts, getCategories, getBrands } from '@/services/products'
import type { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Catalog() {
  const { categoria } = useParams<{ categoria: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = categoria || 'todas'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const brandParam = searchParams.get('marca') || ''
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam)
  const [onlySale, setOnlySale] = useState(false)
  const [sortOption, setSortOption] = useState('newest')
  const [maxPrice, setMaxPrice] = useState<number>(2000)
  const [minPriceBound, setMinPriceBound] = useState<number>(29)
  const [maxPriceBound, setMaxPriceBound] = useState<number>(2000)

  const currentCategoryData = categories.find((c) => c.name === activeCategory)

  useEffect(() => {
    getCategories().then(setCategories)
    getBrands().then(setBrands)
  }, [])

  // Sincroniza se a URL mudar (ex: navegação externa ou clique em link de marca)
  useEffect(() => {
    const brandInUrl = searchParams.get('marca') || ''
    setSelectedBrand(brandInUrl)
  }, [searchParams])

  const handleBrandSelect = (brand: string) => {
    const nextBrand = brand === selectedBrand ? '' : brand
    setSelectedBrand(nextBrand)
    const newParams = new URLSearchParams(searchParams)
    if (nextBrand) {
      newParams.set('marca', nextBrand)
    } else {
      newParams.delete('marca')
    }
    setSearchParams(newParams, { replace: true })
  }

  // Discover actual price range in catalog to adjust slider dynamically while respecting 2000 limit
  useEffect(() => {
    let isMounted = true
    const checkPriceBounds = async () => {
      try {
        const [cheapest, priciest] = await Promise.all([
          getProducts({ sort: 'price_asc', perPage: 1 }),
          getProducts({ sort: 'price_desc', perPage: 1 }),
        ])
        if (isMounted) {
          const minP = cheapest.items[0]?.price ? Math.floor(cheapest.items[0].price) : 29
          const maxP = priciest.items[0]?.price ? Math.ceil(priciest.items[0].price) : 2000
          setMinPriceBound(Math.min(minP, 30))
          setMaxPriceBound(Math.max(maxP, 2000))
        }
      } catch (e) {
        console.error('Error fetching price bounds:', e)
      }
    }
    checkPriceBounds()
    return () => {
      isMounted = false
    }
  }, [])

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
        maxPrice: maxPrice < maxPriceBound ? maxPrice : undefined,
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
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('marca')
    setSearchParams(newParams, { replace: true })
    setMaxPrice(maxPriceBound)
    setSortOption('newest')
  }

  const isPriceFiltered = maxPrice < maxPriceBound

  const FilterContent = () => (
    <div className="space-y-6 text-xs">
      {/* Promoção Toggle */}
      <div className="py-2 border-b border-neutral-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-semibold uppercase tracking-wider text-neutral-800">
            Apenas Ofertas / OFF
          </span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => setOnlySale(e.target.checked)}
            className="w-4 h-4 accent-neutral-950"
          />
        </label>
      </div>

      {/* Marcas */}
      <div className="space-y-2 border-b border-neutral-100 pb-5">
        <h4 className="font-bold text-neutral-950 uppercase tracking-widest text-[11px]">
          Marcas Parceiras
        </h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('')}
            className={`w-full text-left py-1.5 px-2 text-xs flex items-center justify-between transition-colors ${
              !selectedBrand
                ? 'font-bold text-neutral-950 bg-neutral-100'
                : 'text-neutral-500 hover:text-neutral-950'
            }`}
          >
            <span>Todas as Marcas</span>
            {!selectedBrand && <Check className="w-3.5 h-3.5" />}
          </button>
          {brands.map((brand) => {
            const isSelected =
              selectedBrand.localeCompare(brand, 'pt-BR', { sensitivity: 'base' }) === 0 ||
              selectedBrand.toLowerCase() === brand.toLowerCase()
            return (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`w-full text-left py-1.5 px-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'font-bold text-neutral-950 bg-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                <span>{brand}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div className="space-y-2 border-b border-neutral-100 pb-5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-neutral-950 uppercase tracking-widest text-[11px]">
            Preço Máximo
          </h4>
          {isPriceFiltered && (
            <button
              onClick={() => setMaxPrice(maxPriceBound)}
              className="text-[10px] text-neutral-400 hover:text-neutral-900 underline"
            >
              Resetar
            </button>
          )}
        </div>
        <input
          type="range"
          min={minPriceBound}
          max={maxPriceBound}
          step="20"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-neutral-950 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
          <span>R$ {minPriceBound}</span>
          <span className="font-semibold text-neutral-900">
            {maxPrice >= maxPriceBound ? `Até R$ ${maxPriceBound}` : `Até R$ ${maxPrice}`}
          </span>
        </div>
      </div>

      {/* Limpar Filtros */}
      {(selectedBrand || onlySale || isPriceFiltered) && (
        <Button
          onClick={clearFilters}
          variant="outline"
          size="sm"
          className="w-full text-xs text-neutral-900 border-neutral-300 hover:bg-neutral-50 font-semibold uppercase tracking-wider rounded-none h-9"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  )

  const categoryTitle =
    activeCategory === 'todas'
      ? 'Catálogo Geral'
      : currentCategoryData?.display_name || activeCategory.toUpperCase()

  const categoryDesc =
    currentCategoryData?.description ||
    'Roupas e acessórios esportivos autênticos selecionados para máxima performance.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Clean da Categoria */}
      <div className="border-b border-neutral-200/80 pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
            <Link to="/" className="hover:text-neutral-950 transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">{activeCategory}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 uppercase">
            {categoryTitle}
          </h1>
          <p className="text-xs text-neutral-500 font-normal leading-relaxed">{categoryDesc}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden flex items-center gap-2 border-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-none h-10 px-4"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs p-6 bg-white overflow-y-auto">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-base font-bold uppercase tracking-tight">
                  Filtrar Peças
                </SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>

          {/* Ordenação Minimalista */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 uppercase tracking-wider hidden sm:inline">
              Ordenar:
            </span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-40 sm:w-44 text-xs font-medium h-10 rounded-none border-neutral-300 bg-white">
                <SelectValue placeholder="Mais recentes" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-none border-neutral-200">
                <SelectItem value="newest">Lançamentos</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
                <SelectItem value="discount">Maior Desconto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid Principal com Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Sidebar Desktop Clean */}
        <aside className="hidden lg:block sticky top-28 space-y-4 pr-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/70">
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-950">
              Filtros
            </h3>
            <span className="text-[11px] text-neutral-400 font-medium">{totalCount} peças</span>
          </div>
          <FilterContent />
        </aside>

        {/* Grade de Produtos Arejada */}
        <main className="lg:col-span-3 space-y-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-neutral-200/60 animate-pulse" />
                  <div className="h-4 bg-neutral-200/60 animate-pulse w-3/4" />
                  <div className="h-4 bg-neutral-200/60 animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 p-8 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Tente ajustar os filtros selecionados para visualizar outras peças.
              </p>
              <Button
                onClick={clearFilters}
                className="bg-neutral-950 text-white font-medium text-xs uppercase tracking-wider rounded-none px-6 h-10 mt-2"
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Carregar Mais */}
          {page < totalPages && (
            <div className="text-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                className="text-xs font-semibold uppercase tracking-wider px-8 h-12 rounded-none border-neutral-300 hover:bg-neutral-50"
              >
                {loadingMore ? 'Carregando...' : 'Carregar Mais Peças'}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
