import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, hospitalIds, senderName } = body

    // Validate
    if (!to || !hospitalIds?.length) {
      return NextResponse.json(
        { error: 'Email and hospital IDs are required' },
        { status: 400 }
      )
    }

    if (hospitalIds.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 hospitals per email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('name, address, city, lga, phone, email, specialties, ownership, rating_avg')
      .in('id', hospitalIds)

    if (error || !hospitals) {
      return NextResponse.json(
        { error: 'Failed to fetch hospital data' },
        { status: 500 }
      )
    }


    const hospitalRows = hospitals.map(h => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #F3F4F6;">
          <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;
                    color: #0F172A;">
            ${h.name}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">
            📍 ${h.address}, ${h.lga}, ${h.city}
          </p>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #6B7280;">
            📞 ${h.phone}
          </p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${(h.specialties ?? []).map((s: string) => `
              <span style="background: #f0faf9; color: #1b6b6a;
                           padding: 2px 8px; border-radius: 20px;
                           font-size: 11px; font-weight: 500;">
                ${s}
              </span>
            `).join('')}
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #F3F4F6;
                   text-align: right; vertical-align: top;">
          <span style="background: ${h.ownership === 'public'
            ? '#f0faf9' : '#F5F3FF'};
            color: ${h.ownership === 'public' ? '#1b6b6a' : '#7C3AED'};
            padding: 3px 10px; border-radius: 20px; font-size: 11px;
            font-weight: 600;">
            ${h.ownership}
          </span>
          ${h.rating_avg ? `
            <p style="margin: 8px 0 0 0; font-size: 12px;
                      color: #F59E0B; font-weight: 600;">
              ★ ${Number(h.rating_avg).toFixed(1)}
            </p>
          ` : ''}
        </td>
      </tr>
    `).join('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
                    ?? 'http://localhost:3000'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
        </head>
        <body style="margin: 0; padding: 0; background: #F9FAFB;
                     font-family: system-ui, sans-serif;">
          <div style="max-width: 600px; margin: 32px auto;
                      background: white; border-radius: 16px;
                      overflow: hidden; border: 1px solid #F3F4F6;">

            <!-- Header -->
            <div style="background: #1b6b6a; padding: 24px 32px;">
              <p style="margin: 0; font-size: 20px; font-weight: 700;
                        color: white;">
                🏥 Carefinder
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px;
                        color: rgba(255,255,255,0.8);">
                Nigeria's civic hospital directory
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 24px 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px;
                        color: #0F172A; font-weight: 600;">
                ${senderName
                  ? `${senderName} shared a hospital list with you`
                  : 'A hospital list has been shared with you'}
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px;
                        color: #6B7280;">
                ${hospitals.length} hospital${hospitals.length !== 1
                  ? 's' : ''} from Carefinder
              </p>

              <!-- Table -->
              <table style="width: 100%; border-collapse: collapse;
                            border: 1px solid #F3F4F6; border-radius: 12px;
                            overflow: hidden;">
                ${hospitalRows}
              </table>

              <!-- CTA -->
              <div style="margin-top: 24px; text-align: center;">
                <a href="${siteUrl}/search"
                   style="display: inline-block; background: #1b6b6a;
                          color: white; padding: 12px 24px;
                          border-radius: 12px; font-size: 13px;
                          font-weight: 600; text-decoration: none;">
                  Search more hospitals →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 32px; border-top: 1px solid #F3F4F6;
                        text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">
                Sent via Carefinder · Nigeria's hospital directory ·
                <a href="${siteUrl}" style="color: #1b6b6a;">
                  carefinder.ng
                </a>
              </p>
            </div>

          </div>
        </body>
      </html>
    `

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Carefinder <onboarding@resend.dev>',
        to:      [to],
        subject: `${hospitals.length} hospital${hospitals.length !== 1
                   ? 's' : ''} shared via Carefinder`,
        html,
      }),
    })

    if (resendRes.status === 429) {
      return NextResponse.json(
        { error: 'Email limit reached. Try again tomorrow.' },
        { status: 429 }
      )
    }

    if (!resendRes.ok) {
      const resendError = await resendRes.json()
      console.error('Resend error:', resendError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Share route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}