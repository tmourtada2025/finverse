import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REFUND_WINDOW_DAYS = 14

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { enrollmentId, userId } = req.body

  if (!enrollmentId || !userId) {
    return res.status(400).json({ error: 'Missing enrollmentId or userId' })
  }

  // Fetch the enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at, amount_paid, stripe_session_id, status')
    .eq('id', enrollmentId)
    .eq('user_id', userId)
    .single()

  if (enrollError || !enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' })
  }

  // Verify ownership
  if (enrollment.user_id !== userId) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Check status
  if (enrollment.status !== 'active') {
    return res.status(400).json({ error: 'Enrollment is not active' })
  }

  // Check refund window
  const enrolledAt = new Date(enrollment.enrolled_at)
  const daysSincePurchase = Math.floor((Date.now() - enrolledAt.getTime()) / 86400000)

  if (daysSincePurchase > REFUND_WINDOW_DAYS) {
    return res.status(400).json({
      error: `Refund window has expired. Refunds are only available within ${REFUND_WINDOW_DAYS} days of purchase.`,
    })
  }

  // No Stripe session — was manually enrolled, can't auto-refund
  if (!enrollment.stripe_session_id) {
    return res.status(400).json({
      error: 'This enrollment was not purchased via Stripe and cannot be automatically refunded. Please contact support.',
    })
  }

  // Get the payment intent from the checkout session
  try {
    const session = await stripe.checkout.sessions.retrieve(enrollment.stripe_session_id)
    const paymentIntentId = session.payment_intent as string

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'No payment found for this enrollment' })
    }

    // Issue refund via Stripe
    await stripe.refunds.create({ payment_intent: paymentIntentId })

    // The charge.refunded webhook will handle revoking access automatically
    // But we soft-revoke immediately for instant feedback
    await supabase
      .from('enrollments')
      .update({ status: 'refunded', refunded_at: new Date().toISOString() })
      .eq('id', enrollmentId)

    return res.status(200).json({ success: true })

  } catch (err: any) {
    console.error('Refund error:', err)
    return res.status(500).json({ error: err.message || 'Refund failed' })
  }
}
