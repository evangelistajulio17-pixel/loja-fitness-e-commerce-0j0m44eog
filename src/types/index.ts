export type ProductCategory =
  | 'camisetas'
  | 'regatas'
  | 'calcas'
  | 'leggings'
  | 'shorts'
  | 'jaquetas'
  | 'moletons'
  | 'acessorios'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: ProductCategory
  price: number
  compare_at_price?: number
  images_urls?: string[]
  brand: string
  external_url?: string
  external_price?: number
  external_site?: string
  price_verified_at?: string
  is_on_sale?: boolean
  is_featured?: boolean
  inventory?: number
  sizes?: string[]
  colors?: string[]
  rating?: number
  rating_count?: number
  composition?: string
  created: string
  updated: string
}

export interface Category {
  id: string
  name: ProductCategory
  display_name: string
  description?: string
  image_url?: string
  created: string
  updated: string
}

export interface CartItem {
  id: string
  user: string
  product: string
  expand?: {
    product: Product
  }
  quantity: number
  price_at_add: number
  selected_size?: string
  selected_color?: string
  created: string
  updated: string
}

export interface Favorite {
  id: string
  user: string
  product: string
  expand?: {
    product: Product
  }
  created: string
}

export interface Coupon {
  id: string
  code: string
  discount_percent: number
  is_active: boolean
  expires_at?: string
  description?: string
}

export type OrderStatus = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado'
export type PaymentMethod = 'pix' | 'cartao_credito' | 'boleto'

export interface OrderItemSnapshot {
  product_id: string
  name: string
  slug: string
  brand: string
  image: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  user: string
  items: OrderItemSnapshot[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_zip?: string
  shipping_address?: string
  shipping_number?: string
  shipping_complement?: string
  shipping_neighborhood?: string
  shipping_city?: string
  shipping_state?: string
  payment_details?: {
    pix_code?: string
    boleto_barcode?: string
    card_last4?: string
    card_brand?: string
    installments?: number
    paid_at?: string
  }
  created: string
  updated: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  verified?: boolean
}
