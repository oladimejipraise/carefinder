import { Suspense } from 'react'

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAF8] dark:bg-gray-950
                      flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-700
                          border-t-transparent rounded-full
                          animate-spin mx-auto mb-2" />
          <p className="text-xs text-brand-700 font-medium">
            Loading...
          </p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}