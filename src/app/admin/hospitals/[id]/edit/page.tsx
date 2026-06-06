import { notFound } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminEntryForm from '@/components/admin/AdminEntryForm'
import { createClient } from '@/lib/supabase/server'

async function getHospital(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

type Props = { params: Promise<{ id: string }> }

export default async function EditHospitalPage({ params }: Props) {
  const { id } = await params
  const hospital = await getHospital(id)

  if (!hospital) notFound()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-900">
            Edit Hospital
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {hospital.name}
          </p>
        </div>
        <AdminEntryForm hospital={hospital} />
      </main>
    </div>
  )
}