import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { telegram } from '@/lib/telegram';

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

            // Update payment status to completed
            const { error } = await supabase
                .from('payments')
                .update({
                    mpesa_receipt_number: receipt,
                    amount: amount,
                    phone_number: phone.toString(),
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('checkout_request_id', stkCallback.CheckoutRequestID);

            if (!error) {
                // Send Telegram Notification
                await telegram.notifyPaymentSuccess({
                    orderId: stkCallback.CheckoutRequestID, // or fetch internal ID if needed
                    amount: amount,
                    phone: phone.toString(),
                    receipt: receipt
                });
            }

            if (error) console.error('DB Log Error:', error);

            // TODO: Activate subscription if applicable
            // Find user by phone? Or need to pass user ID in AccountReference context? 
            // AccountReference is limited in length. Usually we map CheckoutRequestID to a pending validation record.

        } else {
            // Payment Failed
            console.warn('Payment Failed:', stkCallback.ResultDesc);
            await supabase
                .from('payments')
                .update({
                    status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('checkout_request_id', stkCallback.CheckoutRequestID);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Callback Error:', error);
        return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
    }
}
