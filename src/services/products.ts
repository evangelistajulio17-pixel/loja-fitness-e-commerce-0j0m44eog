import pb from '@/lib/pocketbase/client'
import type { Product, Category, Coupon } from '@/types'

export async function getProducts(options?: {
  category?: string
  brand?: string
  isOnSale?: boolean
  isFeatured?: boolean
  search?: string
  sort?: string
  page?: number
  perPage?: number
  minPrice?: number
  maxPrice?: number
}): Promise<{ items: Product[]; totalItems: number; totalPages: number }> {
  const page = options?.page || 1
  const perPage = options?.perPage || 24

  const filters: string[] = []

  if (options?.category && options.category !== 'todas') {
    filters.push(`category = "${options.category}"`)
  }

  if (options?.brand) {
    filters.push(`brand = "${options.brand}"`)
  }

  if (options?.isOnSale) {
    filters.push('is_on_sale = true')
  }

  if (options?.isFeatured) {
    filters.push('is_featured = true')
  }

  if (options?.minPrice !== undefined && options.minPrice > 0) {
    filters.push(`price >= ${options.minPrice}`)
  }

  if (options?.maxPrice !== undefined && options.maxPrice > 0) {
    filters.push(`price <= ${options.maxPrice}`)
  }

  if (options?.search && options.search.trim() !== '') {
    const s = options.search.trim().replace(/["\\]/g, '')
    filters.push(`(name ~ "${s}" || description ~ "${s}" || brand ~ "${s}")`)
  }

  const filterString = filters.join(' && ')
  let sortString = '-created'

  if (options?.sort) {
    if (options.sort === 'price_asc') sortString = 'price'
    else if (options.sort === 'price_desc') sortString = '-price'
    else if (options.sort === 'rating') sortString = '-rating'
    else if (options.sort === 'discount') sortString = '-compare_at_price'
    else if (options.sort === 'newest') sortString = '-created'
  }

  try {
    const res = await pb.collection('products').getList(page, perPage, {
      filter: filterString || undefined,
      sort: sortString,
    })
    return {
      items: res.items as unknown as Product[],
      totalItems: res.totalItems,
      totalPages: res.totalPages,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { items: [], totalItems: 0, totalPages: 0 }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const record = await pb.collection('products').getFirstListItem(`slug = "${slug}"`)
    return record as unknown as Product
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const records = await pb.collection('products').getList(1, limit, {
      filter: 'is_featured = true',
      sort: '-created',
    })
    return records.items as unknown as Product[]
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getSaleProducts(limit = 12): Promise<Product[]> {
  try {
    const records = await pb.collection('products').getList(1, limit, {
      filter: 'is_on_sale = true',
      sort: '-created',
    })
    return records.items as unknown as Product[]
  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const records = await pb.collection('categories').getFullList({
      sort: 'display_name',
    })
    return records as unknown as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const records = await pb.collection('coupons').getFullList({
      filter: 'is_active = true',
    })
    return records as unknown as Coupon[]
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return []
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const upper = code.trim().toUpperCase()
    const record = await pb
      .collection('coupons')
      .getFirstListItem(`code = "${upper}" && is_active = true`)
    return record as unknown as Coupon
  } catch {
    return null
  }
}
