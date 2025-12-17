import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Ensure you have a service client if doing admin operations, but public usually ok for this read if configured

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    try {
        // Poll database to see if callback has updated the status
        const { data, error } = await supabase
            .from('orders') // or separate payments table
            .select('status, mpesa_receipt_number')
            .eq('id', orderId)
            .single();

        if (error) throw error;

        // In a real M-Pesa integration, we might also query Safaricom's Query API if we want instant 'Pending' vs 'Processing' details
        // For now, we rely on the Callback endpoint having updated this row.

        return NextResponse.json({
            status: data.status,
            receipt: data.mpesa_receipt_number
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
