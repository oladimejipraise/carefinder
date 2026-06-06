'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function saveHospital(
  payload: Record<string, unknown>,
  id?: string
) {
  const supabase = createAdminClient()

  if (id) {
    const { error } = await supabase
      .from('hospitals')
      .update(payload)
      .eq('id', id)

    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase
      .from('hospitals')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret:     process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
        hospitalId: data.id,
      }),
    })
  }

  revalidatePath('/admin/hospitals')
  revalidatePath('/search')
}