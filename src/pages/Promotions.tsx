import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Clock, Copy, Check, Percent, Sparkles, Tag } from 'lucide-react'
import { getProducts, getCoupons } from '@/services/products'
import type { Product, Coupon } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

export default function PromotionsPage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Countdown timer state (Mock: 5 days, 14 hours, 28 mins)
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 14,
    minutes: 28,
    seconds: 45,
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
      description: `Código "${code}" copiado para a área de transferência. Cole no checkout.`,
    })
    setTimeout(() => setCopiedCode(null), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner de Campanha com Contador Regressivo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-rose-900/40 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black tracking-wider uppercase">
            <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>MEGA QUEIMA OFICIAL DE TEMPORADA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            OFERTAS IMPERDÍVEIS & ATÉ 50% OFF
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Aproveite os descontos verificados em vestuário esportivo e acessórios. Economia real
            comparada diretamente às lojas de origem.
          </p>

          {/* Contador Regressivo Estilizado */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-2">
              <Clock className="w-4 h-4" />
              <span>A OFERTA ENCERRA EM:</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl px-3 sm:px-4 py-2 text-center min-w-[60px]">
                <span className="block text-xl sm:text-2xl font-black text-white">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Dias</span>
              </div>
              <span className="text-rose-500 font-black text-xl">:</span>
              <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl px-3 sm:px-4 py-2 text-center min-w-[60px]">
                <span className="block text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Horas</span>
              </div>
              <span className="text-rose-500 font-black text-xl">:</span>
              <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl px-3 sm:px-4 py-2 text-center min-w-[60px]">
                <span className="block text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Min</span>
              </div>
              <span className="text-rose-500 font-black text-xl">:</span>
              <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl px-3 sm:px-4 py-2 text-center min-w-[60px]">
                <span className="block text-xl sm:text-2xl font-black text-rose-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Seg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Cupons Ativos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
            Cupons Oficiais Ativos
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Clique no cupom para copiar o código e aplique na etapa final do carrinho ou checkout.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 p-5 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-600 font-serif">
                    {coupon.discount_percent}% OFF
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Ativo
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{coupon.description}</h4>
              </div>

              <div className="pt-2 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-mono font-black text-sm text-slate-800 tracking-wider">
                  {coupon.code}
                </span>
                <Button
                  size="sm"
                  onClick={() => copyCoupon(coupon.code)}
                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade de Produtos em Promoção */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
            Produtos em Oferta ({saleProducts.length})
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Preços reduzidos</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
