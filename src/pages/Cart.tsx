import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, ShieldCheck } from 'lucide-react'
import { useCart } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCouponByCode } from '@/services/products'
import { toast } from '@/hooks/use-toast'

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    try {
      setCheckingCoupon(true)
      const found = await getCouponByCode(couponCode)
      if (found) {
        setAppliedCoupon({ code: found.code, percent: found.discount_percent })
        toast({
          title: 'Cupom aplicado!',
          description: `Desconto de ${found.discount_percent}% aplicado na sua sacola.`,
        })
      } else {
        toast({
          title: 'Cupom inválido',
          description: 'Código de cupom não localizado.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Erro ao validar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setCheckingCoupon(false)
    }
  }

  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.percent) / 100 : 0
  const shipping = subtotal >= 299 || items.length === 0 ? 0 : 29.9
  const total = Math.max(0, subtotal - discountAmount + shipping)

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-28 text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6 stroke-[1.25]" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
          Sua sacola está vazia
        </h1>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Explore nossas peças fitness essenciais e escolha os itens para seu próximo treino.
        </p>
        <div className="pt-2">
          <Link to="/categoria/todas">
            <Button className="bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs rounded-none uppercase tracking-wider px-8 h-11">
              Ver Coleção
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-end justify-between border-b border-neutral-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-950">
          Sacola de Compras ({items.length})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-400 hover:text-rose-600 transition-colors uppercase tracking-wider font-medium"
        >
          Limpar Sacola
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Tabela de Produtos Clean */}
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => {
            const prod = item.expand?.product
            const price = prod?.price || item.price_at_add || 0
            const name = prod?.name || 'Produto Fitness'
            const brand = prod?.brand || 'FitWear'
            const img =
              prod?.images_urls?.[0] || 'https://img.usecurling.com/p/300/400?q=fitness%20apparel'

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={img}
                    alt={name}
                    className="w-20 h-24 object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block">
                      {brand}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                      {name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                      {item.selected_size && <span>Tam: {item.selected_size}</span>}
                      {item.selected_size && item.selected_color && <span>•</span>}
                      {item.selected_color && <span>Cor: {item.selected_color}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                  <div className="flex items-center border border-neutral-200 bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-neutral-500 hover:text-neutral-950"
                      aria-label="Diminuir"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-medium text-neutral-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-neutral-500 hover:text-neutral-950"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold text-neutral-950 block">
                      R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors mt-0.5"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo do Pedido Minimalista */}
        <div className="lg:col-span-4 bg-neutral-50 p-6 sm:p-8 space-y-6 sticky top-28 border border-neutral-200/60">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-200/80 pb-3">
            Resumo do Pedido
          </h2>

          {/* Cupom */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
              Possui Cupom de Desconto?
            </span>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: FITNESS10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="text-xs h-10 uppercase bg-white border-neutral-300 rounded-none"
              />
              <Button
                type="submit"
                disabled={checkingCoupon}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs px-4 h-10 rounded-none uppercase tracking-wider"
              >
                {checkingCoupon ? '...' : 'Aplicar'}
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-[11px] text-neutral-900 font-medium">
                Cupom {appliedCoupon.code} ativado (-{appliedCoupon.percent}%)
              </p>
            )}
          </form>

          {/* Linhas de totais */}
          <div className="space-y-2 text-xs border-t border-neutral-200/80 pt-4">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal:</span>
              <span className="font-medium text-neutral-900">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Desconto ({appliedCoupon.code}):</span>
                <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-500">
              <span>Frete:</span>
              <span className="font-medium text-neutral-900">
                {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-neutral-950 border-t border-neutral-200/80 pt-3">
              <span>Total:</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-[11px] text-neutral-400 pt-1">
              Pagamento em até 12x no cartão ou à vista com 5% OFF via Pix.
            </p>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-semibold h-12 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>Continuar para Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 text-center pt-1">
            <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
            <span>Pagamento direto e seguro no site</span>
          </div>
        </div>
      </div>
    </div>
  )
}
