import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CreditCard,
  QrCode,
  FileText,
  Copy,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth, useCart } from '@/context/AppContext'
import { createOrder } from '@/services/orders'
import type { PaymentMethod, OrderItemSnapshot, Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  // Stepper: 1: Delivery, 2: Payment, 3: Confirmation
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

  // CEP Lookup
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
            title: 'Endereço localizado',
            description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
          })
        }
      } catch {
        // Fallback
      } finally {
        setLoadingViaCep(false)
      }
    }
  }

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
      await new Promise((r) => setTimeout(r, 1200))

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
          title: 'Pedido registrado com sucesso!',
          description: `Identificador: #${created.id.slice(0, 8).toUpperCase()}`,
        })
      }
    } catch (err) {
      console.error('Error creating order:', err)
      toast({
        title: 'Erro ao processar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmOfflinePayment = () => {
    if (createdOrder) {
      setCreatedOrder({
        ...createdOrder,
        status: 'pago',
      })
      toast({
        title: 'Pagamento Confirmado',
        description: 'Status atualizado com sucesso no sistema.',
      })
    }
  }

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
      toast({ title: 'Código do boleto copiado!' })
      setTimeout(() => setBoletoCopied(false), 3000)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto py-28 text-center px-4 space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
          Nenhum item na sacola
        </h2>
        <p className="text-xs text-neutral-400">Adicione peças antes de ir para o checkout.</p>
        <Link to="/categoria/todas">
          <Button className="bg-neutral-950 text-white font-medium text-xs rounded-none uppercase tracking-wider px-6 h-10">
            Voltar ao Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Stepper Clean */}
      <div className="max-w-xl mx-auto flex items-center justify-between border-b border-neutral-200/80 pb-6">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              step >= 1 ? 'text-neutral-950' : 'text-neutral-400'
            }`}
          >
            1. Entrega
          </span>
        </div>
        <span className="text-neutral-300">/</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              step >= 2 ? 'text-neutral-950' : 'text-neutral-400'
            }`}
          >
            2. Pagamento
          </span>
        </div>
        <span className="text-neutral-300">/</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              step === 3 ? 'text-neutral-950' : 'text-neutral-400'
            }`}
          >
            3. Confirmação
          </span>
        </div>
      </div>

      {/* ETAPA 1: DADOS DE ENTREGA */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <form
            onSubmit={handleNextStep}
            className="lg:col-span-8 bg-white p-6 sm:p-10 border border-neutral-200/80 space-y-6"
          >
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-950">
                Endereço de Entrega
              </h2>
              <p className="text-xs text-neutral-400">
                Informe o local onde seu pedido será entregue
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700">
                  E-mail para Rastreio
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700">
                  Telefone / Celular
                </Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="zip"
                  className="text-xs font-semibold text-neutral-700 flex justify-between"
                >
                  <span>CEP</span>
                  {loadingViaCep && (
                    <span className="text-neutral-400 font-normal">Buscando...</span>
                  )}
                </Label>
                <Input
                  id="zip"
                  required
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  onBlur={handleCepBlur}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="number" className="text-xs font-semibold text-neutral-700">
                  Número
                </Label>
                <Input
                  id="number"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold text-neutral-700">
                  Logradouro / Rua
                </Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="complement" className="text-xs font-semibold text-neutral-700">
                  Complemento
                </Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="neighborhood" className="text-xs font-semibold text-neutral-700">
                  Bairro
                </Label>
                <Input
                  id="neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-neutral-700">
                  Cidade
                </Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold text-neutral-700">
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
                  className="bg-neutral-50/50 border-neutral-200 rounded-none h-11 text-xs uppercase"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold h-12 px-8 rounded-none text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continuar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Resumo Lateral */}
          <div className="lg:col-span-4 bg-neutral-50 p-6 border border-neutral-200/60 space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-200 pb-3">
              Itens da Sacola ({items.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <img
                    src={
                      i.expand?.product?.images_urls?.[0] ||
                      'https://img.usecurling.com/p/100/100?q=fitness'
                    }
                    alt={i.expand?.product?.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget
                      if (!target.src.includes('img.usecurling.com')) {
                        target.src = `https://img.usecurling.com/p/100/100?q=fitness`
                      }
                    }}
                    className="w-14 h-18 object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {i.expand?.product?.name}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {i.quantity}x • R${' '}
                      {(i.expand?.product?.price || i.price_at_add).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal:</span>
                <span className="font-medium text-neutral-900">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Frete:</span>
                <span className="font-medium text-neutral-900">
                  {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total:</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 2: PAGAMENTO DIRETO NO SITE */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 border border-neutral-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-950">
                  Forma de Pagamento
                </h2>
                <p className="text-xs text-neutral-400">
                  Transação segura processada diretamente na FitWear Store
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-neutral-950 underline font-medium"
              >
                Editar entrega
              </button>
            </div>

            {/* Abas Minimalistas */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-neutral-950 bg-neutral-50 font-bold text-neutral-950'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">Pix</span>
                <span className="text-[10px] text-neutral-500">5% OFF à vista</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_credito')}
                className={`p-4 border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cartao_credito'
                    ? 'border-neutral-950 bg-neutral-50 font-bold text-neutral-950'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">Cartão</span>
                <span className="text-[10px] text-neutral-500">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-4 border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'boleto'
                    ? 'border-neutral-950 bg-neutral-50 font-bold text-neutral-950'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">Boleto</span>
                <span className="text-[10px] text-neutral-500">À vista</span>
              </button>
            </div>

            {/* Conteúdo Dinâmico */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
                O QR Code Pix e o código copia-e-cola serão gerados imediatamente ao clicar no botão
                abaixo. A confirmação é instantânea.
              </div>
            )}

            {paymentMethod === 'cartao_credito' && (
              <div className="space-y-4 p-5 bg-neutral-50 border border-neutral-200 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber" className="text-xs font-semibold text-neutral-700">
                    Número do Cartão
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="bg-white border-neutral-200 rounded-none h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardHolder" className="text-xs font-semibold text-neutral-700">
                    Nome Impresso no Cartão
                  </Label>
                  <Input
                    id="cardHolder"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData({ ...cardData, name: e.target.value.toUpperCase() })
                    }
                    className="bg-white border-neutral-200 rounded-none h-10 text-xs uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardExpiry" className="text-xs font-semibold text-neutral-700">
                      Validade
                    </Label>
                    <Input
                      id="cardExpiry"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder="MM/AA"
                      className="bg-white border-neutral-200 rounded-none h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardCvv" className="text-xs font-semibold text-neutral-700">
                      CVV
                    </Label>
                    <Input
                      id="cardCvv"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="bg-white border-neutral-200 rounded-none h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Parcelamento</Label>
                  <select
                    value={cardData.installments}
                    onChange={(e) =>
                      setCardData({ ...cardData, installments: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs font-medium focus:outline-none"
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
              <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
                O boleto bancário é emitido com vencimento para 3 dias úteis. A linha digitável será
                exibida na próxima etapa para pagamento pelo aplicativo do seu banco.
              </div>
            )}

            <Button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-semibold h-13 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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

          {/* Dados Resumidos de Entrega */}
          <div className="lg:col-span-4 bg-neutral-50 p-6 border border-neutral-200/60 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-200 pb-3">
              Endereço Selecionado
            </h3>
            <div className="space-y-1 text-neutral-600">
              <p className="font-semibold text-neutral-900">{formData.name}</p>
              <p>
                {formData.address}, nº {formData.number} {formData.complement}
              </p>
              <p>
                {formData.neighborhood} - {formData.city}/{formData.state}
              </p>
              <p>CEP: {formData.zip}</p>
              <p className="pt-2 text-neutral-900 font-semibold">
                Frete: {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 3: CONFIRMAÇÃO & QR CODE CLEAN */}
      {step === 3 && createdOrder && (
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 border border-neutral-200 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase">
              Pedido Concluído
            </h1>
            <p className="text-xs text-neutral-500">
              Número do Pedido: #{createdOrder.id.slice(0, 10).toUpperCase()}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-semibold uppercase tracking-wider">
              Status: {createdOrder.status}
            </span>
          </div>

          {/* Pix QR Code */}
          {createdOrder.payment_method === 'pix' && (
            <div className="p-5 bg-neutral-50 border border-neutral-200 space-y-4">
              <p className="text-xs text-neutral-600">
                Pague com Pix apontando a câmera do seu aplicativo bancário:
              </p>
              <div className="w-40 h-40 bg-white p-2 border border-neutral-300 mx-auto">
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
                  className="text-[11px] font-mono text-center bg-white rounded-none"
                />
                <Button
                  onClick={copyPixCode}
                  variant="outline"
                  className="text-xs uppercase font-semibold h-10 px-5 rounded-none border-neutral-300 hover:bg-neutral-100 flex items-center justify-center gap-2 mx-auto"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{pixCopied ? 'Código Copiado!' : 'Copiar Código Pix'}</span>
                </Button>
              </div>

              {createdOrder.status === 'pendente' && (
                <div className="pt-2 border-t border-neutral-200">
                  <Button
                    onClick={handleConfirmOfflinePayment}
                    variant="ghost"
                    className="text-xs text-neutral-600 hover:text-neutral-950 font-medium"
                  >
                    Simular: "Confirmar Pagamento pelo App"
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Cartão de Crédito */}
          {createdOrder.payment_method === 'cartao_credito' && (
            <div className="p-5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-900">Pagamento aprovado com sucesso!</p>
              <p>Cobrança de R$ {createdOrder.total.toFixed(2).replace('.', ',')} autorizada.</p>
            </div>
          )}

          {/* Boleto */}
          {createdOrder.payment_method === 'boleto' && (
            <div className="p-5 bg-neutral-50 border border-neutral-200 space-y-3">
              <p className="text-xs text-neutral-600">Linha digitável do boleto bancário:</p>
              <Input
                readOnly
                value={createdOrder.payment_details?.boleto_barcode || ''}
                className="text-xs font-mono text-center bg-white rounded-none"
              />
              <Button
                onClick={copyBoleto}
                variant="outline"
                className="text-xs uppercase font-semibold h-10 px-5 rounded-none border-neutral-300 hover:bg-neutral-100 flex items-center justify-center gap-2 mx-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{boletoCopied ? 'Código Copiado!' : 'Copiar Linha Digitável'}</span>
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Link to="/minha-conta">
              <Button className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider h-11 px-6 rounded-none">
                Ver Meus Pedidos
              </Button>
            </Link>
            <Link to="/categoria/todas">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs uppercase tracking-wider font-medium h-11 px-6 rounded-none border-neutral-300"
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
