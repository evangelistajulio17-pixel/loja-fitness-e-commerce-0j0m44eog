import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  User,
  LogOut,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Tag,
} from 'lucide-react'
import { useAuth } from '@/context/AppContext'
import { getOrders } from '@/services/orders'
import { getCoupons } from '@/services/products'
import type { Order, Coupon } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MyAccount() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    async function load() {
      try {
        setLoading(true)
        const [ordersList, couponsList] = await Promise.all([getOrders(user?.id), getCoupons()])
        setOrders(ordersList)
        setCoupons(couponsList)
      } catch (err) {
        console.error('Error loading account data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-[10px] uppercase tracking-wider font-semibold">
            Pago & Confirmado
          </span>
        )
      case 'enviado':
        return (
          <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-900 text-[10px] uppercase tracking-wider font-semibold">
            Em Trânsito
          </span>
        )
      case 'entregue':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] uppercase tracking-wider font-semibold">
            Entregue
          </span>
        )
      case 'cancelado':
        return (
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] uppercase tracking-wider font-semibold">
            Cancelado
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] uppercase tracking-wider font-semibold">
            Aguardando Pagamento
          </span>
        )
    }
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner do Usuário Clean */}
      <div className="bg-white p-6 sm:p-8 border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-neutral-950 text-white font-extrabold text-xl flex items-center justify-center">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-950">
              {user.name || 'Minha Conta FitWear'}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/favoritos">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold uppercase tracking-wider rounded-none border-neutral-300 h-10 px-4"
            >
              Lista de Desejos
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-rose-600 rounded-none h-10 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Histórico de Pedidos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
            <h2 className="text-base font-bold uppercase tracking-tight text-neutral-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-600" />
              Histórico de Pedidos ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200/80 p-8 space-y-3">
              <Package className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Você ainda não realizou pedidos
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Explore nosso catálogo e equipe seus treinos com roupas de alto padrão esportivo.
              </p>
              <Link to="/categoria/todas">
                <Button className="bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider rounded-none px-6 h-10 mt-2">
                  Comprar Agora
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 border border-neutral-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-neutral-900">
                        Pedido #{ord.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ord.created).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.status)}
                      <span className="text-sm font-bold text-neutral-950">
                        R$ {ord.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Miniatura dos itens */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {ord.items &&
                      ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 shrink-0 bg-neutral-50 p-2 border border-neutral-200/60"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-12 object-cover bg-neutral-200"
                            />
                          )}
                          <div className="text-[11px] max-w-[150px] truncate">
                            <span className="font-semibold text-neutral-900 block truncate">
                              {item.name}
                            </span>
                            <span className="text-neutral-400">
                              {item.quantity}x • R$ {item.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Detalhes da entrega */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {ord.shipping_address}, {ord.shipping_city}/{ord.shipping_state}
                      </span>
                    </div>

                    <span className="font-medium text-neutral-700 uppercase text-[10px] tracking-wider">
                      Pagamento: {ord.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cupons e Benefícios */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-neutral-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Tag className="w-3.5 h-3.5" />
              Cupons da FitWear Store
            </h3>
            <p className="text-xs text-neutral-400">
              Insira no carrinho para receber o desconto automático:
            </p>
            <div className="space-y-2">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-neutral-50 border border-neutral-200/60 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-neutral-950 block">{c.code}</span>
                    <span className="text-[11px] text-neutral-500">{c.description}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-neutral-950 text-white text-[10px] font-bold uppercase">
                    -{c.discount_percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-950 text-white p-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-200">
              Atendimento Dedicado
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dúvidas sobre modelagem, tabela de medidas ou status de envio? Nossa equipe técnica
              está pronta para ajudar.
            </p>
            <a
              href="mailto:contato@fitwear.com.br"
              className="inline-block text-xs font-semibold text-white underline pt-1"
            >
              contato@fitwear.com.br
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
