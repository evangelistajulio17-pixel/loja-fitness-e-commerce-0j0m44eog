import React, { useState, useEffect } from 'react'
import { Clock, Copy, Check, Tag } from 'lucide-react'
import { getProducts, getCoupons } from '@/services/products'
import type { Product, Coupon } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function PromotionsPage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 18,
    minutes: 32,
    seconds: 10,
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [prodRes, coupList] = await Promise.all([
          getProducts({ isOnSale: true, perPage: 36 }),
          getCoupons(),
        ])
        setSaleProducts(prodRes.items)
        setCoupons(coupList)
      } catch (err) {
        console.error('Error loading promotions:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: 'Cupom copiado!',
      description: `Código "${code}" copiado para a área de transferência.`,
    })
    setTimeout(() => setCopiedCode(null), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header Editorial de Promoção (Clean & Sofisticado) */}
      <div className="border-b border-neutral-200/80 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600 block">
            Ofertas Especiais
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
            Sale & Descontos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            Peças selecionadas com até 50% OFF. Qualidade esportiva com preços especiais por tempo
            limitado.
          </p>
        </div>

        {/* Cronômetro Minimalista */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium uppercase tracking-wider mr-2">
            <Clock className="w-4 h-4 stroke-[1.5]" />
            <span className="hidden sm:inline">Termina em:</span>
          </div>
          <div className="flex items-center gap-2 text-center">
            <div className="px-3 py-1.5 bg-white border border-neutral-200">
              <span className="block text-sm font-bold text-neutral-950">{timeLeft.days}d</span>
            </div>
            <span className="text-neutral-400 font-bold">:</span>
            <div className="px-3 py-1.5 bg-white border border-neutral-200">
              <span className="block text-sm font-bold text-neutral-950">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
            </div>
            <span className="text-neutral-400 font-bold">:</span>
            <div className="px-3 py-1.5 bg-white border border-neutral-200">
              <span className="block text-sm font-bold text-neutral-950">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
            </div>
            <span className="text-neutral-400 font-bold">:</span>
            <div className="px-3 py-1.5 bg-white border border-neutral-200">
              <span className="block text-sm font-bold text-rose-600">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cupons Ativos Clean */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-950 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          Cupons Válidos para Usar no Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white border border-neutral-200 p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-neutral-950 tracking-tight">
                    {coupon.discount_percent}% OFF
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{coupon.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <span className="font-mono font-bold text-xs text-neutral-900 tracking-wider">
                  {coupon.code}
                </span>
                <Button
                  size="sm"
                  onClick={() => copyCoupon(coupon.code)}
                  variant="outline"
                  className="h-8 px-3 text-xs uppercase tracking-wider font-semibold rounded-none border-neutral-300 hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade de Produtos em Oferta */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3">
          <h2 className="text-base font-bold uppercase tracking-tight text-neutral-950">
            Produtos em Promoção ({saleProducts.length})
          </h2>
        </div>

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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
