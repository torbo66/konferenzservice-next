import { redirect } from 'next/navigation'
import { getBookings, getCurrentProfile, getProducts } from '@/lib/data'
import { BillingManager } from '@/components/billing-manager'

export default async function AbrechnungPage() {
  const profile = await getCurrentProfile()
  if (!profile) return null
  if (profile.role === 'service') redirect('/kalender')

  const [bookings, products] = await Promise.all([getBookings(), getProducts()])

  return <BillingManager initialBookings={bookings} products={products} role={profile.role} />
}
