import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, ShieldCheck, Truck } from 'lucide-react'
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
          description: `Desconto de ${found.discount_percent}% concedido no seu pedido.`,
        })
      } else {
        toast({
          title: 'Cupom inválido',
          description: 'Código de cupom não encontrado ou expirado.',
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
      <div className="max-w-xl mx-auto py-24 text-center px-4 space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-serif">
          Sua sacola de compras está vazia
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Navegue pelas nossas categorias exclusivas de roupas e acessórios fitness e monte seu look
          para o próximo treino.
        </p>
        <div className="pt-2">
          <Link to="/categoria/todas">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-sm">
              Ver Todos os Produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
          Sacola de Compras ({items.length})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Esvaziar sacola
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Tabela de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const prod = item.expand?.product
            const price = prod?.price || item.price_at_add || 0
            const name = prod?.name || 'Produto Fitness'
            const brand = prod?.brand || 'FitWear'
            const img =
              prod?.images_urls?.[0] || 'https://img.usecurling.com/p/300/300?q=fitness%20apparel'

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={img}
                    alt={name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      {brand}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {name}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      {item.selected_size && (
                        <span>
                          Tamanho: <strong>{item.selected_size}</strong>
                        </span>
                      )}
                      {item.selected_color && (
                        <span>
                          Cor: <strong>{item.selected_color}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Seletor de quantidade */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs h-9">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 text-slate-500 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 text-slate-500 hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preço e remoção */}
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-950 block">
                      R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 mt-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-36">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
            Resumo da Compra
          </h2>

          {/* Cupom */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              Cupom de Desconto:
            </span>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: FITNESS10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="text-xs h-10 uppercase bg-slate-50"
              />
              <Button
                type="submit"
                disabled={checkingCoupon}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 h-10 rounded-xl"
              >
                {checkingCoupon ? '...' : 'Aplicar'}
              </Button>
            </div>
            {appliedCoupon && (
              <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Cupom {appliedCoupon.code} ativado (-{appliedCoupon.percent}%)
              </div>
            )}
          </form>

          {/* Cálculos */}
          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal dos itens:</span>
              <span className="font-semibold text-slate-900">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto ({appliedCoupon.code}):</span>
                <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Frete:</span>
              <span className="font-semibold text-emerald-600">
                {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-950 border-t border-slate-200 pt-3">
              <span>Total a pagar:</span>
              <span className="text-emerald-600 text-xl">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pagamento em até 12x no cartão de crédito ou à vista com Pix/Boleto.
            </p>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>Prosseguir para Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ambiente 100% criptografado e seguro</span>
          </div>
        </div>
      </div>
    </div>
  )
}
