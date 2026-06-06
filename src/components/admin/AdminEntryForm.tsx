'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { HospitalFormSchema, type HospitalFormValues } from '@/lib/schemas'
import { saveHospital } from '@/app/admin/hospitals/actions'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const SPECIALTIES = [
  'emergency', 'maternity', 'dental', 'pediatric',
  'surgical', 'cardiology', 'oncology', 'general',
]

interface AdminEntryFormProps {
  hospital?: HospitalFormValues & { id: string; image_url?: string | null }
}

export default function AdminEntryForm({ hospital }: AdminEntryFormProps) {
  const router = useRouter()
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [description, setDescription] = useState(
    hospital?.description_md ?? ''
  )
  const [imageUrl, setImageUrl] = useState<string>(
    hospital?.image_url ?? ''
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(HospitalFormSchema),
    defaultValues: hospital ?? {
      name:           '',
      address:        '',
      city:           '',
      lga:            '',
      phone:          '',
      email:          '',
      specialties:    [],
      ownership:      'public',
      description_md: '',
      visiting_hours: '',
      lat:            9.0820,
      lng:            8.6753,
    },
  })

  const selectedSpecialties = watch('specialties') ?? []

  function toggleSpecialty(s: string) {
    const current = selectedSpecialties
    const next = current.includes(s)
      ? current.filter(x => x !== s)
      : [...current, s]
    setValue('specialties', next, { shouldValidate: true })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext  = file.name.split('.').pop()
      const path = `hospitals/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('hospital-images')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('hospital-images')
        .getPublicUrl(path)
      setImageUrl(publicUrl)
    } catch {
      setError('Failed to upload image. Make sure the hospital-images bucket exists in Supabase Storage.')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: HospitalFormValues) {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...values,
        description_md: description,
        image_url: imageUrl || null,
      }
      await saveHospital(payload, hospital?.id)
      router.push('/admin/hospitals')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4
                        py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
                      dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-brand-900 dark:text-white mb-5">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Hospital name *
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Lagos General Hospital"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              City *
            </label>
            <input
              {...register('city')}
              placeholder="Lagos"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              LGA *
            </label>
            <input
              {...register('lga')}
              placeholder="Lagos Island"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.lga && (
              <p className="text-xs text-red-500 mt-1">{errors.lga.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Address *
            </label>
            <input
              {...register('address')}
              placeholder="1 Marina Road, Lagos Island"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Phone *
            </label>
            <input
              {...register('phone')}
              placeholder="+2348012345678"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="info@hospital.ng"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Latitude *
              <span className="text-gray-400 font-normal ml-1">(4–14 for Nigeria)</span>
            </label>
            <input
              {...register('lat', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="9.0765"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.lat && (
              <p className="text-xs text-red-500 mt-1">{errors.lat.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-1.5">
              Longitude *
              <span className="text-gray-400 font-normal ml-1">(2–15 for Nigeria)</span>
            </label>
            <input
              {...register('lng', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="7.3986"
              className="w-full border border-gray-200 dark:border-gray-700
                         dark:bg-gray-800 dark:text-white rounded-xl px-3
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-700 placeholder:text-gray-300"
            />
            {errors.lng && (
              <p className="text-xs text-red-500 mt-1">{errors.lng.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
                      dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-brand-900 dark:text-white mb-5">
          Classification
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-2">
              Ownership *
            </label>
            <div className="flex gap-3">
              {(['public', 'private'] as const).map(val => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={val}
                    {...register('ownership')}
                    className="accent-brand-700"
                  />
                  <span className="text-sm font-medium text-gray-700
                                   dark:text-gray-300 capitalize">
                    {val}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 mb-2">
              Specialties * (select at least one)
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium
                              border transition-colors capitalize ${
                    selectedSpecialties.includes(s)
                      ? 'bg-brand-50 border-brand-400 text-brand-700 dark:bg-brand-900/30 dark:border-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.specialties && (
              <p className="text-xs text-red-500 mt-1">
                {errors.specialties.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hospital Image Upload */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
                      dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-brand-900 dark:text-white mb-2">
          Hospital Image
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Upload a photo of the hospital. Recommended: 800×400px JPG or PNG.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full border border-gray-200 dark:border-gray-700
                     dark:bg-gray-800 dark:text-white rounded-xl px-3
                     py-2.5 text-sm focus:outline-none file:mr-3
                     file:py-1 file:px-3 file:rounded-lg file:border-0
                     file:text-xs file:font-semibold file:bg-brand-50
                     file:text-brand-700 hover:file:bg-brand-100"
        />

        {uploading && (
          <p className="text-xs text-brand-700 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none"
                 viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </p>
        )}

        {imageUrl && !uploading && (
          <div className="mt-3">
            <div className="relative w-full h-32 rounded-xl overflow-hidden">
              <Image
                src={imageUrl}
                alt="Hospital preview"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
            <p className="text-xs text-brand-700 mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Image uploaded successfully
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
                      dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-brand-900 dark:text-white mb-2">
          Description (Markdown)
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Supports Markdown. Use ## for headings, **bold**, - for lists.
        </p>
        <div data-color-mode="light">
          <MDEditor
            value={description}
            onChange={val => setDescription(val ?? '')}
            height={250}
            preview="live"
          />
        </div>
      </div>

      {/* Visiting Hours */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
                      dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-brand-900 dark:text-white mb-2">
          Visiting Hours
        </h2>
        <textarea
          {...register('visiting_hours')}
          rows={3}
          placeholder="Monday - Friday: 8:00 AM - 8:00 PM&#10;Saturday: 8:00 AM - 4:00 PM&#10;Sunday: 10:00 AM - 2:00 PM"
          className="w-full border border-gray-200 dark:border-gray-700
                     dark:bg-gray-800 dark:text-white rounded-xl px-3
                     py-2.5 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-700 placeholder:text-gray-300 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700
                     dark:text-gray-400 dark:hover:text-gray-200
                     transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-brand-700 text-white
                     font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-800
                     transition-colors text-sm disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            hospital?.id ? 'Save changes' : 'Create hospital'
          )}
        </button>
      </div>

    </form>
  )
}