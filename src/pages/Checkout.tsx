import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  Copy,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { createOrder } from '@/services/orders'
import type { PaymentMethod, OrderItemSnapshot, Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/hooks/use-toast'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  // Stepper: 1: Delivery, 2: Payment, 3: Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Delivery Form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 98765-4321',
    zip: '01310-100',
    address: 'Avenida Paulista',
    number: '1000',
    complement: 'Apto 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  })

  const [loadingViaCep, setLoadingViaCep] = useState(false)

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8892',
    name: (user?.name || 'ATLETA BRASILEIRO').toUpperCase(),
    expiry: '10/29',
    cvv: '321',
    installments: 1,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [boletoCopied, setBoletoCopied] = useState(false)

  // CEP Lookup via ViaCep API
  const handleCepBlur = async () => {
    const cleanCep = formData.zip.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        setLoadingViaCep(true)
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }))
          toast({
            title: 'Endereço localizado!',
            description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
          })
        }
      } catch {
        // Silent fallback
      } finally {
        setLoadingViaCep(false)
      }
    }
  }

  // Summary
  const shipping = subtotal >= 299 ? 0 : 29.9
  const total = subtotal + shipping

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.address || !formData.city) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor preencha todos os campos obrigatórios de entrega.',
        variant: 'destructive',
      })
      return
    }
    setStep(2)
    window.scrollTo(0, 0)
  }

  // Final Payment Processing (Direct on-site)
  const handleProcessPayment = async () => {
    if (!user?.id) {
      toast({
        title: 'Login necessário',
        description: 'Por favor faça login antes de concluir sua compra.',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    setIsProcessing(true)

    // Snapshot of items
    const snapshotItems: OrderItemSnapshot[] = items.map((i) => ({
      product_id: i.product,
      name: i.expand?.product?.name || 'Item Fitness',
      slug: i.expand?.product?.slug || '',
      brand: i.expand?.product?.brand || 'FitWear',
      image: i.expand?.product?.images_urls?.[0] || '',
      price: i.expand?.product?.price || i.price_at_add,
      quantity: i.quantity,
      size: i.selected_size,
      color: i.selected_color,
    }))

    const pixRandomCode =
      '00020126580014br.gov.bcb.pix0136fitwear-' +
      Math.random().toString(36).substring(2, 10) +
      '5204000053039865802BR5925FITWEAR STORE BRASIL LTDA6009SAO PAULO62070503***6304E2D1'

    const boletoBarCode =
      '23793.38128 60000.012345 67000.123456 1 95400000' + Math.round(total * 100)

    try {
      // Simulate real bank processing delay (1.5 seconds)
      await new Promise((r) => setTimeout(r, 1500))

      const orderData: Partial<Order> = {
        user: user.id,
        items: snapshotItems,
        subtotal,
        shipping,
        discount: 0,
        total,
        status: paymentMethod === 'cartao_credito' ? 'pago' : 'pendente',
        payment_method: paymentMethod,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_zip: formData.zip,
        shipping_address: formData.address,
        shipping_number: formData.number,
        shipping_complement: formData.complement,
        shipping_neighborhood: formData.neighborhood,
        shipping_city: formData.city,
        shipping_state: formData.state,
        payment_details: {
          pix_code: pixRandomCode,
          boleto_barcode: boletoBarCode,
          card_last4: '8892',
          card_brand: 'Mastercard',
          installments: cardData.installments,
          paid_at: paymentMethod === 'cartao_credito' ? new Date().toISOString() : undefined,
        },
      }

      const created = await createOrder(orderData)
      if (created) {
        setCreatedOrder(created)
        await clearCart()
        setStep(3)
        window.scrollTo(0, 0)
        toast({
          title: 'Pedido realizado com sucesso!',
          description: `Número do pedido: #${created.id.slice(0, 8)}`,
        })
      }
    } catch (err) {
      console.error('Error creating order:', err)
      toast({
        title: 'Erro ao processar',
        description: 'Não foi possível finalizar seu pedido. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Confirm simulated manual payment for Pix/Boleto
  const handleConfirmOfflinePayment = () => {
    if (createdOrder) {
      setCreatedOrder({
        ...createdOrder,
        status: 'pago',
      })
      toast({
        title: 'Pagamento Identificado!',
        description: 'Seu pagamento foi confirmado instantaneamente pelo sistema.',
      })
    }
  }

  // Copy helpers
  const copyPixCode = () => {
    if (createdOrder?.payment_details?.pix_code) {
      navigator.clipboard.writeText(createdOrder.payment_details.pix_code)
      setPixCopied(true)
      toast({ title: 'Código Pix copiado!' })
      setTimeout(() => setPixCopied(false), 3000)
    }
  }

  const copyBoleto = () => {
    if (createdOrder?.payment_details?.boleto_barcode) {
      navigator.clipboard.writeText(createdOrder.payment_details.boleto_barcode)
      setBoletoCopied(true)
      toast({ title: 'Código de barras copiado!' })
      setTimeout(() => setBoletoCopied(false), 3000)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <h2 className="text-xl font-bold">Nenhum item na sacola</h2>
        <p className="text-xs text-slate-500">
          Adicione produtos antes de prosseguir para o checkout.
        </p>
        <Link to="/categoria/todas">
          <Button className="bg-emerald-600 text-white font-bold text-xs">Voltar às compras</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Stepper Header */}
      <div className="max-w-2xl mx-auto flex items-center justify-between relative pb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </div>
          <span className="text-xs font-bold text-slate-900 hidden sm:inline">Entrega</span>
        </div>

        <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <span className="text-xs font-bold text-slate-900 hidden sm:inline">
            Pagamento no Site
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-4 ${step === 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </div>
          <span className="text-xs font-bold text-slate-900 hidden sm:inline">Confirmação</span>
        </div>
      </div>

      {/* ETAPA 1: DADOS DE ENTREGA */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form
            onSubmit={handleNextStep}
            className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-950 font-serif">Endereço de Entrega</h2>
              <p className="text-xs text-slate-500">
                Preencha os dados onde suas roupas e acessórios devem ser entregues
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-bold">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome de quem vai receber o pacote"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold">
                  E-mail para Rastreio
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold">
                  WhatsApp / Celular
                </Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="zip"
                  className="text-xs font-bold flex items-center justify-between"
                >
                  <span>CEP</span>
                  {loadingViaCep && (
                    <span className="text-emerald-600 font-normal">Buscando endereço...</span>
                  )}
                </Label>
                <Input
                  id="zip"
                  required
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="number" className="text-xs font-bold">
                  Número
                </Label>
                <Input
                  id="number"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: 100"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold">
                  Logradouro / Rua
                </Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="complement" className="text-xs font-bold">
                  Complemento (opcional)
                </Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  placeholder="Apto, Bloco, etc."
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="neighborhood" className="text-xs font-bold">
                  Bairro
                </Label>
                <Input
                  id="neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-bold">
                  Cidade
                </Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-bold">
                  Estado (UF)
                </Label>
                <Input
                  id="state"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value.toUpperCase() })
                  }
                  className="bg-slate-50 uppercase"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl text-sm flex items-center gap-2"
              >
                <span>Ir para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Resumo Lateral */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Itens do Pedido ({items.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 text-xs">
                  <img
                    src={i.expand?.product?.images_urls?.[0]}
                    alt={i.expand?.product?.name}
                    className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{i.expand?.product?.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {i.quantity}x de R${' '}
                      {(i.expand?.product?.price || i.price_at_add).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frete:</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total:</span>
                <span className="text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 2: FORMAS DE PAGAMENTO NO PRÓPRIO SITE */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 font-serif">
                  Pagamento pelo Próprio Site
                </h2>
                <p className="text-xs text-slate-500">
                  Escolha o método e conclua a transação com segurança sem sair da loja
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Voltar e alterar endereço
              </button>
            </div>

            {/* Abas dos Métodos */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <QrCode className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold">Pix Instantâneo</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Aprovação Imediata
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_credito')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'cartao_credito'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-6 h-6 text-slate-800" />
                <span className="text-xs font-bold">Cartão de Crédito</span>
                <span className="text-[10px] text-slate-500">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'boleto'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <FileText className="w-6 h-6 text-slate-800" />
                <span className="text-xs font-bold">Boleto Bancário</span>
                <span className="text-[10px] text-slate-500">À vista</span>
              </button>
            </div>

            {/* Conteúdo Dinâmico por Método */}
            {paymentMethod === 'pix' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Como funciona o pagamento via Pix:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao clicar em <strong>"Finalizar e Pagar via Pix"</strong>, o QR Code e o código
                  copia-e-cola serão gerados na tela de confirmação. Você poderá validar o pagamento
                  e seu pedido entrará em separação imediata.
                </p>
              </div>
            )}

            {paymentMethod === 'cartao_credito' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber" className="text-xs font-bold">
                    Número do Cartão
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardHolder" className="text-xs font-bold">
                    Nome Impresso no Cartão
                  </Label>
                  <Input
                    id="cardHolder"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData({ ...cardData, name: e.target.value.toUpperCase() })
                    }
                    className="bg-white uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardExpiry" className="text-xs font-bold">
                      Validade
                    </Label>
                    <Input
                      id="cardExpiry"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder="MM/AA"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardCvv" className="text-xs font-bold">
                      CVV (Código de Segurança)
                    </Label>
                    <Input
                      id="cardCvv"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Opções de Parcelamento</Label>
                  <select
                    value={cardData.installments}
                    onChange={(e) =>
                      setCardData({ ...cardData, installments: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>
                      1x de R$ {total.toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                    <option value={2}>
                      2x de R$ {(total / 2).toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                    <option value={3}>
                      3x de R$ {(total / 3).toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                    <option value={6}>
                      6x de R$ {(total / 6).toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                    <option value={10}>
                      10x de R$ {(total / 10).toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                    <option value={12}>
                      12x de R$ {(total / 12).toFixed(2).replace('.', ',')} (sem juros)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {paymentMethod === 'boleto' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Informações sobre o Boleto Bancário:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O boleto tem vencimento para 3 dias úteis. Ao confirmar, você receberá a linha
                  digitável com o código de barras gerado para pagar pelo app do seu banco.
                </p>
              </div>
            )}

            <Button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 rounded-2xl text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Processando pagamento com o banco...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pagar R$ {total.toFixed(2).replace('.', ',')} Agora</span>
                </>
              )}
            </Button>
          </div>

          {/* Dados de Entrega Resumidos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
              Entrega Selecionada
            </h3>
            <div className="space-y-1 text-slate-600">
              <p className="font-bold text-slate-900">{formData.name}</p>
              <p>
                {formData.address}, nº {formData.number} {formData.complement}
              </p>
              <p>
                {formData.neighborhood} - {formData.city}/{formData.state}
              </p>
              <p>CEP: {formData.zip}</p>
              <p className="pt-2 text-emerald-600 font-bold">
                Frete: {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 3: CONFIRMAÇÃO DO PEDIDO & PAGAMENTO */}
      {step === 3 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-950 font-serif">
              Pedido Concluído com Sucesso!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Número do Pedido:{' '}
              <strong className="text-slate-900 font-mono">
                #{createdOrder.id.slice(0, 10).toUpperCase()}
              </strong>
            </p>
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wide">
              Status Atual: {createdOrder.status.toUpperCase()}
            </div>
          </div>

          {/* Se foi Pix */}
          {createdOrder.payment_method === 'pix' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
              <h3 className="font-bold text-sm text-slate-900">QR Code Pix para Pagamento</h3>
              <p className="text-xs text-slate-500">
                Abra o app do seu banco e aponte a câmera para o QR Code abaixo ou copie a chave
                Pix:
              </p>

              {/* QR Code visual representativo */}
              <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-300 mx-auto flex items-center justify-center shadow-inner">
                <img
                  src={`https://img.usecurling.com/p/200/200?q=qr%20code&seed=${createdOrder.id}`}
                  alt="QR Code Pix"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <Input
                  readOnly
                  value={createdOrder.payment_details?.pix_code || ''}
                  className="text-[11px] font-mono text-center bg-white"
                />
                <Button
                  onClick={copyPixCode}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center justify-center gap-2 mx-auto"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{pixCopied ? 'Código Copiado!' : 'Copiar Código Pix'}</span>
                </Button>
              </div>

              {createdOrder.status === 'pendente' && (
                <div className="pt-2 border-t border-slate-200">
                  <Button
                    onClick={handleConfirmOfflinePayment}
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl"
                  >
                    Simular: "Já Paguei pelo App do Banco"
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Se foi Cartão de Crédito */}
          {createdOrder.payment_method === 'cartao_credito' && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <h3 className="font-bold text-sm text-emerald-900">
                Pagamento Aprovado Instantaneamente!
              </h3>
              <p className="text-xs text-emerald-700">
                A cobrança de <strong>R$ {createdOrder.total.toFixed(2).replace('.', ',')}</strong>{' '}
                foi autorizada no cartão terminado em <strong>8892</strong>.
              </p>
            </div>
          )}

          {/* Se foi Boleto */}
          {createdOrder.payment_method === 'boleto' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
              <h3 className="font-bold text-sm text-slate-900">Linha Digitável do Boleto</h3>
              <Input
                readOnly
                value={createdOrder.payment_details?.boleto_barcode || ''}
                className="text-xs font-mono text-center bg-white"
              />
              <Button
                onClick={copyBoleto}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center justify-center gap-2 mx-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{boletoCopied ? 'Código Copiado!' : 'Copiar Linha Digitável'}</span>
              </Button>

              {createdOrder.status === 'pendente' && (
                <div className="pt-2 border-t border-slate-200">
                  <Button
                    onClick={handleConfirmOfflinePayment}
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl"
                  >
                    Simular: "Confirmar Pagamento do Boleto"
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ações pós-compra */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/minha-conta">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 px-6 rounded-xl">
                Acompanhar no Meu Painel
              </Button>
            </Link>
            <Link to="/categoria/todas">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold h-11 px-6 rounded-xl"
              >
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
