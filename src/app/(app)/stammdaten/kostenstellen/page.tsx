import { getCostCenters } from '@/lib/data'
import { ChipList } from '@/components/chip-list'

export default async function KostenstellenPage() {
  const costcenters = await getCostCenters()
  return (
    <ChipList table="costcenters" title="Kostenstellen" placeholder="Kostenstelle" initialItems={costcenters} />
  )
}
