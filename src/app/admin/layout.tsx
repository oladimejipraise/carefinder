import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Carefinder',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}