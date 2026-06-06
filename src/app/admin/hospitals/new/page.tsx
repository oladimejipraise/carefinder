import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminEntryForm from '@/components/admin/AdminEntryForm'

export default function NewHospitalPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-900">
            Add New Hospital
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Fill in the details below to add a new listing
          </p>
        </div>
        <AdminEntryForm />
      </main>
    </div>
  )
}