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
          <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Pago & Confirmado</Badge>
        )
      case 'enviado':
        return (
          <Badge className="bg-blue-100 text-blue-800 text-[10px]">Enviado / Em Trânsito</Badge>
        )
      case 'entregue':
        return <Badge className="bg-purple-100 text-purple-800 text-[10px]">Entregue</Badge>
      case 'cancelado':
        return <Badge className="bg-rose-100 text-rose-800 text-[10px]">Cancelado</Badge>
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 text-[10px]">Aguardando Pagamento</Badge>
        )
    }
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner do Usuário */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
              {user.name || 'Atleta FitWear'}
            </h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/favoritos">
            <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl h-10">
              Meus Favoritos
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl h-10 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Histórico de Pedidos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Histórico de Pedidos ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Você ainda não realizou pedidos</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore nosso catálogo completo e equipe seu treino com roupas de alta performance.
              </p>
              <Link to="/categoria/todas">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Comprar Agora
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black font-mono text-slate-900">
                        Pedido #{ord.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ord.created).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.status)}
                      <span className="text-sm font-black text-slate-950">
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
                          className="flex items-center gap-2 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div className="text-[11px] max-w-[140px] truncate">
                            <span className="font-bold text-slate-800 block truncate">
                              {item.name}
                            </span>
                            <span className="text-slate-400">
                              {item.quantity}x • R$ {item.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Detalhes da entrega */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {ord.shipping_address}, {ord.shipping_city}/{ord.shipping_state}
                      </span>
                    </div>

                    <span className="font-semibold text-slate-700 uppercase text-[11px]">
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              Seus Cupons de Desconto
            </h3>
            <p className="text-xs text-slate-500">
              Aproveite os cupons oficiais da loja em seu próximo checkout:
            </p>
            <div className="space-y-2.5">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-black text-emerald-700 block">{c.code}</span>
                    <span className="text-[11px] text-slate-500">{c.description}</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    -{c.discount_percent}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-3">
            <h4 className="font-bold text-sm text-emerald-400">Atendimento Dedicado</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dúvidas sobre o tamanho de alguma peça ou rastreamento de entregas? Nossa equipe
              técnica está disponível para suporte rápido.
            </p>
            <a
              href="mailto:contato@fitwear.com.br"
              className="inline-block text-xs font-bold text-emerald-400 hover:underline pt-1"
            >
              Falar com o Suporte FitWear
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
