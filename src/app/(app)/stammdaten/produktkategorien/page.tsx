import { getCategories } from '@/lib/data'
import { ChipList } from '@/components/chip-list'

export default async function ProduktkategorienPage() {
  const categories = await getCategories()
  return (
    <ChipList
      table="categories"
      title="Produktkategorien"
      placeholder="Kategoriename"
      initialItems={categories}
    />
  )
}
