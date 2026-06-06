export function buildShareUrl(searchParams: URLSearchParams): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    ?? 'http://localhost:3000'
  const params = searchParams.toString()
  return `${base}/search${params ? `?${params}` : ''}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    } catch {
      return false
    }
  }
}
