import { getCategories, getProducts } from '@/lib/data'
import { ProductsManager } from '@/components/products-manager'

export default async function ProduktePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  return <ProductsManager initialProducts={products} categories={categories} />
}
