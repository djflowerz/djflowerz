import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Ensure this is safe to import in Edge environment or switch to standard approach

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { Body: { stkCallback } } = data;

        if (stkCallback.ResultCode === 0) {
            // Payment Successful
            const meta = stkCallback.CallbackMetadata.Item;
            const amount = meta.find((item: any) => item.Name === 'Amount')?.Value;
            const receipt = meta.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
            const phone = meta.find((item: any) => item.Name === 'PhoneNumber')?.Value;

            // Log payment to DB
            const { error } = await supabase.from('payments').insert({
                mpesa_receipt_number: receipt,
                amount: amount,
                phone_number: phone.toString(),
                status: 'completed',
                merchant_request_id: stkCallback.MerchantRequestID,
                checkout_request_id: stkCallback.CheckoutRequestID
            });

            if (error) console.error('DB Log Error:', error);

            // TODO: Activate subscription if applicable
            // Find user by phone? Or need to pass user ID in AccountReference context? 
            // AccountReference is limited in length. Usually we map CheckoutRequestID to a pending validation record.

        } else {
            // Payment Failed
            console.warn('Payment Failed:', stkCallback.ResultDesc);
            await supabase.from('payments').insert({
                status: 'failed',
                merchant_request_id: stkCallback.MerchantRequestID,
                checkout_request_id: stkCallback.CheckoutRequestID
            });
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Callback Error:', error);
        return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
    }
}
