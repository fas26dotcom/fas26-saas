// Simple email notification helper using Resend or fallback SMTP
// For now we use Resend's free API (100 emails/day, no credit card)
// Set RESEND_API_KEY in .env.local to activate

export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    console.log(`[Email] RESEND_API_KEY not set. Skipping email to ${to}: ${subject}`)
    return { success: false, reason: "no_api_key" }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "FAS26 SaaS <onboarding@resend.dev>"

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    })

    if (response.ok) {
      console.log(`[Email] Sent to ${to}: ${subject}`)
      return { success: true }
    } else {
      const error = await response.text()
      console.error(`[Email] Failed to send to ${to}:`, error)
      return { success: false, reason: error }
    }
  } catch (error) {
    console.error(`[Email] Error sending to ${to}:`, error)
    return { success: false, reason: String(error) }
  }
}
