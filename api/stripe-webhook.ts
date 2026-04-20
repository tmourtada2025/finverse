import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map your Stripe Price IDs to Supabase course IDs
// Add entries here as you create more courses
const PRICE_TO_COURSE: Record<string, string> = {
  'price_1TH3EAF3UWMXuQV82BRfEqfl': '99310134-babc-4935-addc-2a2547436473', // The Trader's Financial Blueprint
  'price_1TOFLAF3UWMXuQV8AvGjNczD':  '7698210c-73d5-4b96-8be1-ce45e8178d1b', // ABC
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const customerEmail = session.customer_details?.email
    const priceId = session.line_items?.data?.[0]?.price?.id

    // If line_items not expanded, get them
    let resolvedPriceId = priceId
    if (!resolvedPriceId && session.id) {
      try {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items'],
        })
        resolvedPriceId = fullSession.line_items?.data?.[0]?.price?.id
      } catch (e) {
        console.error('Failed to retrieve line items:', e)
      }
    }

    const courseId = resolvedPriceId ? PRICE_TO_COURSE[resolvedPriceId] : null

    if (!customerEmail) {
      console.error('No customer email in session')
      return res.status(200).json({ received: true, warning: 'No customer email' })
    }

    if (!courseId) {
      console.error('No course mapped for price ID:', resolvedPriceId)
      return res.status(200).json({ received: true, warning: 'No course mapped' })
    }

    // Find the user profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail.toLowerCase())
      .single()

    if (profileError || !profile) {
      // User hasn't signed up yet — store pending enrollment
      console.log('No profile found for:', customerEmail, '— storing pending enrollment')
      await supabase.from('enrollments').upsert({
        user_id: '00000000-0000-0000-0000-000000000000',
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        stripe_session_id: session.id,
        amount_paid: session.amount_total ? session.amount_total / 100 : null,
        status: 'pending_signup',
        pending_email: customerEmail.toLowerCase(),
      }, { onConflict: 'stripe_session_id' })
      return res.status(200).json({ received: true, status: 'pending_signup' })
    }

    // Enroll the user
    const { error: enrollError } = await supabase.from('enrollments').upsert({
      user_id: profile.id,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      stripe_session_id: session.id,
      amount_paid: session.amount_total ? session.amount_total / 100 : null,
      status: 'active',
    }, { onConflict: 'user_id,course_id' })

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      return res.status(500).json({ error: 'Failed to create enrollment' })
    }

    console.log('Enrolled:', customerEmail, 'in course:', courseId)
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge

    // Find enrollment by stripe_session_id via payment_intent
    const paymentIntentId = charge.payment_intent as string
    if (!paymentIntentId) {
      console.error('No payment_intent on charge')
      return res.status(200).json({ received: true, warning: 'No payment_intent' })
    }

    // Get the checkout session that created this payment intent
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId })
    const session = sessions.data[0]
    if (!session) {
      console.error('No checkout session found for payment_intent:', paymentIntentId)
      return res.status(200).json({ received: true, warning: 'No session found' })
    }

    // Soft revoke — set status to refunded, student loses access but progress preserved
    const { error } = await supabase
      .from('enrollments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)

    if (error) {
      console.error('Failed to revoke enrollment:', error)
      return res.status(500).json({ error: 'Failed to revoke enrollment' })
    }

    console.log('Enrollment revoked for session:', session.id)
  }



  return res.status(200).json({ received: true })
}

// Vercel requires raw body for Stripe signature verification
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
