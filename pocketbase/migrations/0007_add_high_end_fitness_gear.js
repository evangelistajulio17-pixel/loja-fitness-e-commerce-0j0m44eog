/**
 * Migration 0007: Add Authentic High-End Fitness Apparel & Gear
 * - Expands the catalog up to R$ 1.890 to cover the full premium price spectrum up to R$ 2000
 * - Strictly apparel and accessories (no shoes/sneakers)
 * - Unique, non-duplicated images
 */

migrate(
  (app) => {
    const productsCol = app.findCollectionByNameOrId('products')

    const highEndItems = [
      {
        name: 'Mala Esportiva LIVE! Carry-On Couro Premium',
        slug: 'mala-esportiva-live-carry-on-couro-premium',
        category: 'acessorios',
        brand: 'Live!',
        price: 1890.0,
        compare_at_price: 2190.0,
        external_site: 'LIVE! Loja Oficial',
        external_url: 'https://www.liveoficial.com.br/acessorios/bolsas-e-mochilas',
        external_price: 1890.0,
        price_verified_at: '25/02/2025',
        is_on_sale: true,
        is_featured: true,
        rating: 5.0,
        rating_count: 19,
        sizes: ['Tamanho Único (45L)'],
        colors: ['Noir Black'],
        composition:
          'Couro nobre hidrorrepelente com ferragens em aço escovado e compartimento ventilado para tênis/roupas úmidas',
        description:
          'Mala esportiva de viagem e academia de altíssimo padrão, com alça de ombro ergonômica acolchoada e acabamento impecável.',
        images_urls: [
          'https://imagens.liveoficial.com.br/product/750x1125/515160_IP102_00PT01_1.jpg',
        ],
      },
      {
        name: 'Parka All-Weather Waterproof LIVE! Black',
        slug: 'parka-all-weather-waterproof-live-black',
        category: 'jaquetas',
        brand: 'Live!',
        price: 1499.0,
        compare_at_price: null,
        external_site: 'LIVE! Loja Oficial',
        external_url: 'https://www.liveoficial.com.br/jaquetas',
        external_price: 1499.0,
        price_verified_at: '25/02/2025',
        is_on_sale: false,
        is_featured: true,
        rating: 5.0,
        rating_count: 24,
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Noir Black'],
        composition:
          'Membrana tripla camada 20k/20k impermeável e respirável com costuras termosseladas',
        description:
          'Parka técnica de performance extrema para climas severos, com zíperes YKK estanques e capuz de tempestade.',
        images_urls: [
          'https://imagens.liveoficial.com.br/product/750x1125/487336_P1331_00PT01_1.jpg',
        ],
      },
      {
        name: 'Jaqueta Puffer High Tech Thermo LIVE!',
        slug: 'jaqueta-puffer-high-tech-thermo-live',
        category: 'jaquetas',
        brand: 'Live!',
        price: 1299.0,
        compare_at_price: 1499.0,
        external_site: 'LIVE! Loja Oficial',
        external_url: 'https://www.liveoficial.com.br/jaquetas',
        external_price: 1299.0,
        price_verified_at: '25/02/2025',
        is_on_sale: true,
        is_featured: true,
        rating: 4.9,
        rating_count: 31,
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Noir Black'],
        composition:
          'Enchimento térmico ultra leve com isolamento de alta retenção e tecido exterior ripstop hidro-repelente',
        description:
          'Aquecimento superior com peso mínimo para aquecimentos ao ar livre e rotina esportiva urbana.',
        images_urls: [
          'https://imagens.liveoficial.com.br/product/750x1125/487335_P1330_00PT01_1.jpg',
        ],
      },
      {
        name: 'Kit Pro Powerlifting Darkness Belt 13mm + Acessórios',
        slug: 'kit-pro-powerlifting-darkness-belt-13mm-acessorios',
        category: 'acessorios',
        brand: 'IntegralMédica',
        price: 1199.0,
        compare_at_price: 1399.0,
        external_site: 'Netshoes Loja Oficial',
        external_url: 'https://www.netshoes.com.br/busca?q=darkness+powerlifting',
        external_price: 1199.0,
        price_verified_at: '25/02/2025',
        is_on_sale: true,
        is_featured: true,
        rating: 5.0,
        rating_count: 58,
        sizes: ['M', 'G', 'GG'],
        colors: ['Preto / Aço'],
        composition:
          'Cinturão de couro maciço 13mm com alavanca de liberação rápida de aço inox forjado, munhequeiras e joelheiras de compressão 7mm',
        description:
          'Kit de competição oficial Darkness para atletas de levantamento de peso e agachamento extremo.',
        images_urls: [
          'https://static.netshoes.com.br/produtos/cinto-darkness-powerlifting-couro/06/2I2-0390-006/2I2-0390-006_zoom1.jpg',
        ],
      },
      {
        name: 'Mochila Commuter Tech Pro LIVE! Mountain Grey',
        slug: 'mochila-commuter-tech-pro-live-mountain-grey',
        category: 'acessorios',
        brand: 'Live!',
        price: 899.0,
        compare_at_price: null,
        external_site: 'LIVE! Loja Oficial',
        external_url: 'https://www.liveoficial.com.br/acessorios/bolsas-e-mochilas',
        external_price: 899.0,
        price_verified_at: '25/02/2025',
        is_on_sale: false,
        is_featured: false,
        rating: 4.9,
        rating_count: 22,
        sizes: ['Tamanho Único (30L)'],
        colors: ['Mountain Grey'],
        composition: 'Cordura impermeável ultra resistente com costado ergonômico 3D respirável',
        description:
          'Compartimentos modulares para notebook, garrafa térmica e vestuário esportivo.',
        images_urls: [
          'https://imagens.liveoficial.com.br/product/750x1125/515162_IP103_00CZ85_1.jpg',
        ],
      },
      {
        name: 'Jaqueta All-Weather Storm LIVE! Noir Black',
        slug: 'jaqueta-all-weather-storm-live-noir-black',
        category: 'jaquetas',
        brand: 'Live!',
        price: 989.0,
        compare_at_price: 1150.0,
        external_site: 'LIVE! Loja Oficial',
        external_url: 'https://www.liveoficial.com.br/jaquetas',
        external_price: 989.0,
        price_verified_at: '25/02/2025',
        is_on_sale: true,
        is_featured: false,
        rating: 4.8,
        rating_count: 26,
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Noir Black'],
        composition: 'Tecido técnico corta-vento e chuva com ventilação axilar por zíper selado',
        description:
          'Proteção contra tempestades mantendo o controle térmico e respirabilidade ativa durante o treino.',
        images_urls: [
          'https://imagens.liveoficial.com.br/product/750x1125/515525_46571_00PT01_1.jpg',
        ],
      },
    ]

    for (const item of highEndItems) {
      try {
        const rec = new Record(productsCol)
        rec.set('name', item.name)
        rec.set('slug', item.slug)
        rec.set('description', item.description)
        rec.set('category', item.category)
        rec.set('price', item.price)
        rec.set('compare_at_price', item.compare_at_price || 0)
        rec.set('brand', item.brand)
        rec.set('external_url', item.external_url)
        rec.set('external_price', item.external_price || item.price)
        rec.set('external_site', item.external_site)
        rec.set('price_verified_at', item.price_verified_at)
        rec.set('is_on_sale', !!item.is_on_sale)
        rec.set('is_featured', !!item.is_featured)
        rec.set('inventory', 100)
        rec.set('sizes', item.sizes || ['Tamanho Único'])
        rec.set('colors', item.colors || ['Noir Black'])
        rec.set('rating', item.rating || 4.9)
        rec.set('rating_count', item.rating_count || 30)
        rec.set('composition', item.composition || 'Tecnologia premium fitness')
        rec.set('images_urls', item.images_urls)
        app.save(rec)
      } catch (err) {
        console.log(`Failed inserting high-end item ${item.name}:`, err)
      }
    }
  },
  (app) => {},
)
