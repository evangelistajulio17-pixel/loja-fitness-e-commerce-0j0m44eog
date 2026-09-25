migrate(
  (app) => {
    // 1. Categories
    const categories = new Collection({
      name: 'categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'name',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'camisetas',
            'regatas',
            'calcas',
            'leggings',
            'shorts',
            'jaquetas',
            'moletons',
            'acessorios',
          ],
        },
        { name: 'display_name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_categories_name ON categories (name)'],
    })
    app.save(categories)

    // 2. Products
    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'camisetas',
            'regatas',
            'calcas',
            'leggings',
            'shorts',
            'jaquetas',
            'moletons',
            'acessorios',
          ],
        },
        { name: 'price', type: 'number', required: true },
        { name: 'compare_at_price', type: 'number' },
        { name: 'images_urls', type: 'json' },
        { name: 'brand', type: 'text', required: true },
        { name: 'external_url', type: 'text' },
        { name: 'external_price', type: 'number' },
        { name: 'external_site', type: 'text' },
        { name: 'price_verified_at', type: 'text' },
        { name: 'is_on_sale', type: 'bool' },
        { name: 'is_featured', type: 'bool' },
        { name: 'inventory', type: 'number' },
        { name: 'sizes', type: 'json' },
        { name: 'colors', type: 'json' },
        { name: 'rating', type: 'number' },
        { name: 'rating_count', type: 'number' },
        { name: 'composition', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_products_slug ON products (slug)',
        'CREATE INDEX idx_products_category ON products (category)',
        'CREATE INDEX idx_products_is_on_sale ON products (is_on_sale)',
        'CREATE INDEX idx_products_is_featured ON products (is_featured)',
        'CREATE INDEX idx_products_brand ON products (brand)',
      ],
    })
    app.save(products)

    const productsId = products.id

    // 3. Cart items
    const cartItems = new Collection({
      name: 'cart_items',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'product',
          type: 'relation',
          required: true,
          collectionId: productsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price_at_add', type: 'number', required: true },
        { name: 'selected_size', type: 'text' },
        { name: 'selected_color', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_cart_user ON cart_items (user)'],
    })
    app.save(cartItems)

    // 4. Favorites
    const favorites = new Collection({
      name: 'favorites',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'product',
          type: 'relation',
          required: true,
          collectionId: productsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_favorites_user ON favorites (user)'],
    })
    app.save(favorites)

    // 5. Coupons
    const coupons = new Collection({
      name: 'coupons',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'discount_percent', type: 'number', required: true },
        { name: 'is_active', type: 'bool' },
        { name: 'expires_at', type: 'date' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_coupons_code ON coupons (code)'],
    })
    app.save(coupons)

    // 6. Orders
    const orders = new Collection({
      name: 'orders',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'number', required: true },
        { name: 'shipping', type: 'number', required: true },
        { name: 'discount', type: 'number' },
        { name: 'total', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'],
        },
        {
          name: 'payment_method',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['pix', 'cartao_credito', 'boleto'],
        },
        { name: 'customer_name', type: 'text', required: true },
        { name: 'customer_email', type: 'text', required: true },
        { name: 'customer_phone', type: 'text' },
        { name: 'shipping_zip', type: 'text' },
        { name: 'shipping_address', type: 'text' },
        { name: 'shipping_number', type: 'text' },
        { name: 'shipping_complement', type: 'text' },
        { name: 'shipping_neighborhood', type: 'text' },
        { name: 'shipping_city', type: 'text' },
        { name: 'shipping_state', type: 'text' },
        { name: 'payment_details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_orders_user ON orders (user)',
        'CREATE INDEX idx_orders_status ON orders (status)',
      ],
    })
    app.save(orders)
  },
  (app) => {
    const collections = ['orders', 'coupons', 'favorites', 'cart_items', 'products', 'categories']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
