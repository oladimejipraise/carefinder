export type Ownership = 'public' | 'private'

export type Specialty =
  | 'maternity'
  | 'emergency'
  | 'dental'
  | 'pediatric'
  | 'surgical'
  | 'cardiology'
  | 'oncology'
  | 'orthopedic'
  | 'ophthalmology'
  | 'general'

export interface Hospital {
  id: string
  name: string
  city: string
  lga: string
  address: string
  phone: string
  email: string | null
  specialties: Specialty[]
  ownership: Ownership
  description_md: string | null
  visiting_hours: string | null
  rating_avg: number | null
  review_count: number
  created_at: string
}

export interface HospitalImage {
  id: string
  hospital_id: string
  storage_path: string
  uploaded_by: string
  created_at: string
}

export interface Review {
  id: string
  hospital_id: string
  user_id: string
  rating: number
  text: string | null
  status: 'pending' | 'approved' | 'hidden'
  created_at: string
}

export interface FilterState {
  query: string
  specialties: Specialty[]
  ownership: Ownership | null
  radius: number | null
  lat: number | null
  lng: number | null
}

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  specialties: [],
  ownership: null,
  radius: null,
  lat: null,
  lng: null,
}

export type ExportColumn =
  | 'name'
  | 'address'
  | 'city'
  | 'lga'
  | 'phone'
  | 'email'
  | 'specialties'
  | 'ownership'
  | 'rating_avg'