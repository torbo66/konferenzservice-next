import { createClient } from './supabase/server'
import type {
  Booking,
  CostCenter,
  Category,
  Location,
  Product,
  Profile,
  Room,
} from './types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data as Profile | null
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('id', { ascending: false })
  return (data as Booking[]) ?? []
}

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('rooms').select('*').order('id')
  return (data as Room[]) ?? []
}

export async function getCostCenters(): Promise<CostCenter[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('costcenters').select('*').order('id')
  return (data as CostCenter[]) ?? []
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('id')
  return (data as Category[]) ?? []
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').order('id')
  return (data as Product[]) ?? []
}

export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('locations').select('*').order('id')
  return (data as Location[]) ?? []
}

export async function getSettings(): Promise<{
  favorites: number[]
  quick_select: number[]
  timeout: number
}> {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  return {
    favorites: data?.favorites ?? [],
    quick_select: data?.quick_select ?? [],
    timeout: data?.timeout ?? 30,
  }
}

export async function getAppMeta(): Promise<{ version: string; build_date: string }> {
  const supabase = await createClient()
  const { data } = await supabase.from('app_meta').select('*').eq('id', 1).single()
  return { version: data?.version ?? '', build_date: data?.build_date ?? '' }
}

/** Sichtbare Raeume: Admin sieht alle, sonst nur der eigene Standort. */
export function visibleRooms(rooms: Room[], profile: Profile | null): Room[] {
  if (profile?.role === 'admin') return rooms
  return rooms.filter(
    (r) => r.location_id && profile?.location_id && r.location_id === profile.location_id
  )
}
