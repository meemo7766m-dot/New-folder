import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { carId, ownerEmail, carDetails } = await req.json()

        if (!ownerEmail || !carDetails) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const statusMap = {
            'missing': 'مفقود',
            'found': 'تم العثور عليه',
            'stolen': 'مسروق',
        }

        const statusArabic = statusMap[carDetails.newStatus] || carDetails.newStatus

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'مفقودات السودان <onboarding@resend.dev>',
                to: [ownerEmail],
                subject: `تحديث حالة بلاغ المركبة - ${carDetails.plateNumber}`,
                html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; direction: rtl; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .info-box { background: #f8f9fa; border-right: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .info-row { padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .label { font-weight: bold; color: #495057; }
              .value { color: #212529; }
              .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; background: ${carDetails.newStatus === 'found' ? '#10b981' : '#ef4444'}; }
              .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; background: #f8f9fa; }
              .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 تحديث حالة البلاغ</h1>
                <p>منصة مفقودات السودان</p>
              </div>
              <div class="content">
                <p>عزيزي المبلغ،</p>
                <p>نود إعلامك بأن حالة بلاغ المركبة الخاصة بك قد تم تحديثها:</p>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">المركبة:</span>
                    <span class="value">${carDetails.make} ${carDetails.model} (${carDetails.year || '-'})</span>
                  </div>
                  <div class="info-row">
                    <span class="label">رقم اللوحة:</span>
                    <span class="value">${carDetails.plateNumber}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">الحالة الجديدة:</span>
                    <span class="value"><span class="status-badge">${statusArabic}</span></span>
                  </div>
                  <div class="info-row">
                    <span class="label">تاريخ التحديث:</span>
                    <span class="value">${new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <p>للمزيد من التفاصيل، يمكنك زيارة صفحة البلاغ:</p>
                <center>
                  <a href="${SITE_URL}/car/${carId}" class="btn">عرض تفاصيل البلاغ</a>
                </center>
              </div>
              <div class="footer">
                <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                <p>© 2024 مفقودات السودان</p>
              </div>
            </div>
          </body>
          </html>
        `,
            }),
        })

        const data = await res.json()

        if (res.ok) {
            return new Response(
                JSON.stringify({ success: true, data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        } else {
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: data }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
