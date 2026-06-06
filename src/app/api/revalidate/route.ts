import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret, hospitalId, path } = body

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      )
    }

    if (hospitalId) {
      revalidatePath(`/hospitals/${hospitalId}`)
    }

    if (path) {
      revalidatePath(path)
    }

    revalidatePath('/search')

    return NextResponse.json({
      revalidated: true,
      hospitalId:  hospitalId ?? null,
      path:        path ?? null,
      timestamp:   new Date().toISOString(),
    })

  } catch (err) {
    console.error('Revalidate error:', err)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}