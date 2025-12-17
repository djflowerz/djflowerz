import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin/Server Client
// Note: In a real production app with sensitive RLS, you might need a Service Role Key 
// to bypass RLS if checking orders/subs that the user can't see? 
// No, the user can see their own orders/subs. 
// But we need to instantiate a client.
// Since we are verifying the USER's token, we can use that token to act AS the user.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    const type = searchParams.get('type') || 'product'; // 'product' or 'mix'

    // Get Auth Token from Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization Header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the user's access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Verify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let targetUrl = '';

    if (type === 'mix') {
        // Verify Active Subscription
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .gt('end_date', new Date().toISOString())
            .single();

        if (!sub) {
            return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
        }

        // Fetch Mix URL
        const { data: mix } = await supabase
            .from('mixes')
            .select('download_url')
            .eq('id', fileId)
            .single();

        if (!mix || !mix.download_url) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        targetUrl = mix.download_url;

    } else {
        // Assume Product
        // Verify Purchase
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            // This is complex because 'items' is JSONB. 
            // We need to check if the product ID exists in the items array.
            // Simplified check: Does the user have *any* completed order? 
            // Ideally we check specific item.
            // .contains('items', [{ id: fileId }]) // If we structure items like this
            .eq('user_id', user.id)
            .eq('status', 'completed')
        // Since we can't easily query JSONB without exact structure knowledge and RLS on 'orders',
        // we'll rely on fetching all user orders and filtering in memory (inefficient but works for MVP)
        // Or better: use RPC if available.
        // For now, let's fetch orders and check.

        // ... (Checking logic omitted for brevity in this step, user focused on Music Pool)
        // Let's implement basic Music Pool for now as per immediate task context.
        return NextResponse.json({ error: 'Product downloads not fully implemented' }, { status: 501 });
    }

    return NextResponse.json({ url: targetUrl });
}
