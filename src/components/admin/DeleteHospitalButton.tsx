'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteHospitalButtonProps {
  id: string
  name: string
}

export default function DeleteHospitalButton({
  id,
  name,
}: DeleteHospitalButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return

    const supabase = createClient()
    const { error } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Failed to delete hospital: ' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-500 font-medium hover:text-red-700
                 transition-colors"
    >
      Delete
    </button>
  )
}