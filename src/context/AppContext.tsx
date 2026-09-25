import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { CartItem, Product, Favorite, User } from '@/types'
import {
  getCartItems,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateQty,
  removeCartItem as apiRemoveItem,
  clearUserCart as apiClearCart,
  getFavorites,
  toggleFavorite as apiToggleFavorite,
} from '@/services/orders'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<boolean>
  register: (email: string, pass: string, name: string) => Promise<boolean>
  logout: () => void
}

interface CartContextType {
  items: CartItem[]
  cartCount: number
  subtotal: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  favorites: Favorite[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const CartContext = createContext<CartContextType | undefined>(undefined)

const ADMIN_EMAIL = 'comunicacao@expohospitalbrasil.com.br'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial check
    if (pb.authStore.isValid && pb.authStore.record) {
      setUser({
        id: pb.authStore.record.id,
        email: pb.authStore.record.email,
        name: pb.authStore.record.name,
        avatar: pb.authStore.record.avatar,
        verified: pb.authStore.record.verified,
      })
    }
    setIsLoading(false)

    // Listen to changes
    const unsub = pb.authStore.onChange((token, model) => {
      if (token && model) {
        setUser({
          id: model.id,
          email: model.email,
          name: model.name,
          avatar: model.avatar,
          verified: model.verified,
        })
      } else {
        setUser(null)
      }
    })

    return () => unsub()
  }, [])

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      toast({
        title: 'Bem-vindo(a)!',
        description: 'Login efetuado com sucesso.',
      })
      return true
    } catch (err: unknown) {
      console.error('Login error:', err)
      toast({
        title: 'Erro de autenticação',
        description: 'E-mail ou senha incorretos.',
        variant: 'destructive',
      })
      return false
    }
  }

  const register = async (email: string, pass: string, name: string): Promise<boolean> => {
    try {
      await pb.collection('users').create({
        email,
        password: pass,
        passwordConfirm: pass,
        name,
      })
      await pb.collection('users').authWithPassword(email, pass)
      toast({
        title: 'Conta criada!',
        description: 'Seja bem-vindo ao FitWear Oficial.',
      })
      return true
    } catch (err: unknown) {
      console.error('Register error:', err)
      toast({
        title: 'Erro no cadastro',
        description: 'Não foi possível criar sua conta. Verifique os dados.',
        variant: 'destructive',
      })
      return false
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    toast({
      title: 'Desconectado',
      description: 'Você saiu da sua conta com segurança.',
    })
  }

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Local storage fallback for guests
  const GUEST_CART_KEY = 'fitwear_guest_cart'

  const loadGuestCart = (): CartItem[] => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const saveGuestCart = (newItems: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems))
  }

  const refreshCart = async () => {
    if (user?.id) {
      const serverItems = await getCartItems(user.id)
      setItems(serverItems)
      const serverFavs = await getFavorites(user.id)
      setFavorites(serverFavs)
    } else {
      setItems(loadGuestCart())
      setFavorites([])
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user?.id])

  const addItem = async (product: Product, quantity = 1, size?: string, color?: string) => {
    if (user?.id) {
      await apiAddToCart(user.id, product, quantity, size, color)
      await refreshCart()
    } else {
      const current = loadGuestCart()
      const existingIndex = current.findIndex(
        (i) => i.product === product.id && i.selected_size === size && i.selected_color === color,
      )
      if (existingIndex >= 0) {
        current[existingIndex].quantity += quantity
      } else {
        const newItem: CartItem = {
          id: 'guest_' + Date.now() + Math.random().toString(36).substring(7),
          user: 'guest',
          product: product.id,
          expand: { product },
          quantity,
          price_at_add: product.price,
          selected_size: size || (product.sizes && product.sizes[0]),
          selected_color: color || (product.colors && product.colors[0]),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }
        current.push(newItem)
      }
      saveGuestCart(current)
      setItems([...current])
    }
    setIsDrawerOpen(true)
    toast({
      title: 'Adicionado ao carrinho!',
      description: `${product.name} (${quantity}x)`,
    })
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (user?.id) {
      await apiUpdateQty(itemId, quantity)
      await refreshCart()
    } else {
      let current = loadGuestCart()
      if (quantity <= 0) {
        current = current.filter((i) => i.id !== itemId)
      } else {
        const item = current.find((i) => i.id === itemId)
        if (item) item.quantity = quantity
      }
      saveGuestCart(current)
      setItems([...current])
    }
  }

  const removeItem = async (itemId: string) => {
    if (user?.id) {
      await apiRemoveItem(itemId)
      await refreshCart()
    } else {
      const current = loadGuestCart().filter((i) => i.id !== itemId)
      saveGuestCart(current)
      setItems([...current])
    }
    toast({
      title: 'Item removido',
      description: 'O produto foi retirado do carrinho.',
    })
  }

  const clearCart = async () => {
    if (user?.id) {
      await apiClearCart(user.id)
      setItems([])
    } else {
      localStorage.removeItem(GUEST_CART_KEY)
      setItems([])
    }
  }

  const isFavorite = (productId: string): boolean => {
    return favorites.some((f) => f.product === productId)
  }

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      toast({
        title: 'Faça login',
        description: 'Você precisa entrar na sua conta para favoritar produtos.',
        variant: 'destructive',
      })
      return
    }
    const { isFavorite: fav } = await apiToggleFavorite(user.id, productId)
    if (fav) {
      toast({
        title: 'Favoritado!',
        description: 'Produto salvo na sua lista de desejos.',
      })
    } else {
      toast({
        title: 'Removido dos favoritos',
      })
    }
    const serverFavs = await getFavorites(user.id)
    setFavorites(serverFavs)
  }

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0)
  const subtotal = items.reduce((acc, curr) => {
    const price = curr.expand?.product?.price || curr.price_at_add || 0
    return acc + price * curr.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        isDrawerOpen,
        setIsDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        favorites,
        isFavorite,
        toggleFavorite,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
