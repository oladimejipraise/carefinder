import { createClient } from './server'

export async function searchHospitals({
  query = '',
  specialties = [],
  ownership = null,
  lat = null,
  lng = null,
  radius = null,
}: {
  query?: string
  specialties?: string[]
  ownership?: string | null
  lat?: number | null
  lng?: number | null
  radius?: number | null
}) {
  const supabase = await createClient()

  // Radius search 
  if (radius && lat !== null && lng !== null) {
    const { data, error } = await supabase.rpc('hospitals_within_radius', {
      lat,
      lng,
      radius_m: radius * 1000,
    })
    if (error) throw error
    return data ?? []
  }

  // Standard search
  let q = supabase.from('hospitals').select('*')

  if (query) {
    q = q.or(
      `name.ilike.%${query}%,city.ilike.%${query}%,lga.ilike.%${query}%`
    )
  }
  if (specialties.length > 0) {
    q = q.contains('specialties', specialties)
  }
  if (ownership) {
    q = q.eq('ownership', ownership)
  }

  q = q.order('name')

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function getHospitalById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospitals')
    .select('*, hospital_images(*), reviews(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createHospital(input: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospitals')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHospital(id: string, input: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospitals')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHospital(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getReviews(hospitalId: string, status?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('reviews')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  if (status) {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function submitReview({
  hospitalId,
  rating,
  text,
  userId,
}: {
  hospitalId: string
  rating: number
  text?: string
  userId: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert({ hospital_id: hospitalId, rating, text, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function moderateReview(reviewId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
}