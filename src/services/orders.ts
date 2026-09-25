import pb from '@/lib/pocketbase/client'
import type { CartItem, Product, Favorite, Order } from '@/types'

// Cart Services
export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const records = await pb.collection('cart_items').getFullList({
      filter: `user = "${userId}"`,
      expand: 'product',
      sort: '-created',
    })
    return records as unknown as CartItem[]
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return []
  }
}

export async function addToCart(
  userId: string,
  product: Product,
  quantity = 1,
  selectedSize?: string,
  selectedColor?: string,
): Promise<CartItem | null> {
  try {
    // Check if item already exists in cart with same size/color
    const existing = await pb.collection('cart_items').getList(1, 1, {
      filter: `user = "${userId}" && product = "${product.id}"`,
    })

    if (existing.items.length > 0) {
      const item = existing.items[0]
      const updated = await pb.collection('cart_items').update(
        item.id,
        {
          quantity: item.quantity + quantity,
          price_at_add: product.price,
          selected_size: selectedSize || item.selected_size,
          selected_color: selectedColor || item.selected_color,
        },
        {
          expand: 'product',
        },
      )
      return updated as unknown as CartItem
    }

    const created = await pb.collection('cart_items').create(
      {
        user: userId,
        product: product.id,
        quantity,
        price_at_add: product.price,
        selected_size: selectedSize,
        selected_color: selectedColor,
      },
      {
        expand: 'product',
      },
    )
    return created as unknown as CartItem
  } catch (error) {
    console.error('Error adding to cart:', error)
    return null
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      await pb.collection('cart_items').delete(itemId)
    } else {
      await pb.collection('cart_items').update(itemId, { quantity })
    }
    return true
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    return false
  }
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  try {
    await pb.collection('cart_items').delete(itemId)
    return true
  } catch (error) {
    console.error('Error removing cart item:', error)
    return false
  }
}

export async function clearUserCart(userId: string): Promise<boolean> {
  try {
    const items = await pb.collection('cart_items').getFullList({
      filter: `user = "${userId}"`,
    })
    for (const item of items) {
      await pb.collection('cart_items').delete(item.id)
    }
    return true
  } catch (error) {
    console.error('Error clearing cart:', error)
    return false
  }
}

// Favorites Services
export async function getFavorites(userId: string): Promise<Favorite[]> {
  try {
    const records = await pb.collection('favorites').getFullList({
      filter: `user = "${userId}"`,
      expand: 'product',
      sort: '-created',
    })
    return records as unknown as Favorite[]
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

export async function toggleFavorite(
  userId: string,
  productId: string,
): Promise<{ isFavorite: boolean }> {
  try {
    const existing = await pb.collection('favorites').getList(1, 1, {
      filter: `user = "${userId}" && product = "${productId}"`,
    })

    if (existing.items.length > 0) {
      await pb.collection('favorites').delete(existing.items[0].id)
      return { isFavorite: false }
    } else {
      await pb.collection('favorites').create({
        user: userId,
        product: productId,
      })
      return { isFavorite: true }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { isFavorite: false }
  }
}

// Orders Services
export async function createOrder(data: Partial<Order>): Promise<Order | null> {
  try {
    const record = await pb.collection('orders').create(data)
    return record as unknown as Order
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const filter = userId ? `user = "${userId}"` : undefined
    const records = await pb.collection('orders').getFullList({
      filter,
      sort: '-created',
    })
    return records as unknown as Order[]
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const record = await pb.collection('orders').getOne(orderId)
    return record as unknown as Order
  } catch (error) {
    console.error('Error fetching order by id:', error)
    return null
  }
}
