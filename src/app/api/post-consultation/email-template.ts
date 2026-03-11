import type { PostConsultationResult } from '@/lib/types';

/**
 * Generate the HTML email template for post-consultation results.
 * Mobile-responsive, dark-themed to match the platform aesthetic.
 */
export function generateEmailHtml(
  result: PostConsultationResult,
  patientName: string,
  practitionerName: string,
  practiceName: string,
  visualizationUrl: string
): string {
  const treatmentDate = new Date(result.treatment_date).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const classicalRefs = result.classical_references
    .slice(0, 3)
    .map(ref => `
      <tr>
        <td style="padding: 12px 16px; border-left: 3px solid #D4A574;">
          <p style="margin: 0 0 4px 0; font-style: italic; color: #e5e5e5; font-size: 14px;">"${escapeHtml(ref.passage)}"</p>
          <p style="margin: 0; color: #888888; font-size: 12px;">— ${escapeHtml(ref.text_name)}${ref.chapter ? `, ${escapeHtml(ref.chapter)}` : ''}</p>
        </td>
      </tr>
    `)
    .join('<tr><td style="height: 8px;"></td></tr>');

  const lifestyleTips = [
    ...result.lifestyle_recommendations.diet.slice(0, 2),
    ...result.lifestyle_recommendations.exercise.slice(0, 1),
    ...result.lifestyle_recommendations.sleep.slice(0, 1),
    ...result.lifestyle_recommendations.emotional.slice(0, 1),
  ]
    .slice(0, 5)
    .map(tip => `
      <tr>
        <td style="padding: 6px 0;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right: 8px; vertical-align: top; color: #00F0FF; font-size: 14px;">&#8226;</td>
            <td style="color: #e5e5e5; font-size: 14px; line-height: 1.5;">${escapeHtml(tip)}</td>
          </tr></table>
        </td>
      </tr>
    `)
    .join('');

  const nextApptSection = result.next_appointment
    ? `
      <tr>
        <td style="padding: 20px; background-color: #1a1a1a; border-radius: 8px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td>
              <p style="margin: 0 0 4px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Next Appointment</p>
              <p style="margin: 0; color: #00F0FF; font-size: 16px; font-weight: 600;">
                ${new Date(result.next_appointment).toLocaleDateString('en-AU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="height: 20px;"></td></tr>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Treatment Summary</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0a; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 12px !important; }
      .content { padding: 20px !important; }
      .cta-btn { padding: 16px 24px !important; font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- HEADER -->
          <tr>
            <td style="padding: 30px 0; text-align: center;">
              <p style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #D4A574, #00F0FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${escapeHtml(practiceName)}</p>
              <p style="margin: 8px 0 0 0; color: #888888; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Treatment Summary</p>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td class="content" style="background-color: #121212; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <!-- GREETING -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; color: #D4A574; font-size: 18px; font-weight: 600;">Hello ${escapeHtml(patientName)},</p>
                    <p style="margin: 0; color: #888888; font-size: 14px;">Here is your treatment summary from ${treatmentDate} with ${escapeHtml(practitionerName)}.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-bottom: 1px solid #2a2a2a; padding-bottom: 0; height: 1px;"></td></tr>
                <tr><td style="height: 24px;"></td></tr>

                <!-- TREATMENT SUMMARY -->
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #D4A574; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Treatment Summary</p>
                    <p style="margin: 0; color: #e5e5e5; font-size: 15px; line-height: 1.7;">${escapeHtml(result.ai_summary_plain)}</p>
                  </td>
                </tr>
                <tr><td style="height: 28px;"></td></tr>

                <!-- 3D VISUALIZATION CTA -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a2e 0%, #121225 100%); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 28px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #00F0FF; font-size: 16px; font-weight: 600;">Interactive 3D Treatment Map</p>
                    <p style="margin: 0 0 20px 0; color: #888888; font-size: 13px;">Explore your meridians, acupuncture points, and qi flow in an interactive 3D visualisation</p>
                    <a href="${visualizationUrl}" target="_blank" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #00A8B3 100%); color: #0a0a0a; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">View Your Treatment Map &rarr;</a>
                  </td>
                </tr>
                <tr><td style="height: 28px;"></td></tr>

                <!-- CLASSICAL REFERENCES -->
                ${classicalRefs ? `
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #D4A574; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Insights from the Classics</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${classicalRefs}
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 28px;"></td></tr>
                ` : ''}

                <!-- LIFESTYLE TIPS -->
                ${lifestyleTips ? `
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #D4A574; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Wellness Guide</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${lifestyleTips}
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 28px;"></td></tr>
                ` : ''}

                <!-- NEXT APPOINTMENT -->
                ${nextApptSection}

                <!-- FOOTER NOTE -->
                <tr>
                  <td style="border-top: 1px solid #2a2a2a; padding-top: 20px;">
                    <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6; text-align: center;">
                      This summary was prepared by your practitioner with AI assistance. It is for informational purposes and does not replace professional medical advice. If you have questions about your treatment, please contact your practitioner directly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; color: #444444; font-size: 11px;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(practiceName)} &middot; Powered by Consult Results
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
