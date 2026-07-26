export type Role = 'admin' | 'user' | 'service'

export interface Profile {
  id: string
  username: string
  vorname: string | null
  nachname: string | null
  name: string | null
  email: string | null
  role: Role
  location_id: number | null
  must_change_password: boolean
}

export interface Location {
  id: number
  name: string
}

export interface Room {
  id: number
  name: string
  location_id: number | null
}

export interface CostCenter {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  plu: string | null
  name: string
  category: string
  unit: string
  price: number
  inactive: boolean
}

export interface BookingProduct {
  id: number
  qty: number
}

export type BookingStatus = 'pending' | 'active' | 'done' | 'billed'

export interface Booking {
  id: number
  room: string
  costcenter: string
  date: string
  time_from: string
  time_to: string
  note: string | null
  participants: number
  status: BookingStatus
  delivery_status: string | null
  products: BookingProduct[]
  billing_data: Record<string, number>
  billed_total: number | null
  billed_at: string | null
  created_at: string
}
