import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Init server-side Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    // Get Authorization Header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Very basic check, ideally use getUser(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 1. Check Points
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const COST_PER_COUPON = 30; // Customize this

    if (profile.points < COST_PER_COUPON) {
        return NextResponse.json({ error: `Insufficient points. You need ${COST_PER_COUPON} points.` }, { status: 400 })
    }

    // 2. Deduct Points & Create Coupon
    // Use a transaction (RPC) ideally, but for now we do sequential ops (simplistic)

    // Generate Code
    const couponCode = `REW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Deduct
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: profile.points - COST_PER_COUPON })
        .eq('id', user.id)

    if (updateError) {
        return NextResponse.json({ error: 'Failed to deduct points' }, { status: 500 })
    }

    // Create Coupon
    const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
            code: couponCode,
            discount_percent: 20, // 20% off
            assigned_to: user.id
        })
        .select()
        .single()

    if (couponError) {
        // Rollback point deduction? (Ideally yes, but skipping for simplicity in this MVP)
        console.error('Coupon creation failed', couponError)
        return NextResponse.json({ error: 'Failed to generate coupon' }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        coupon: coupon.code,
        remaining_points: profile.points - COST_PER_COUPON
    })
}
