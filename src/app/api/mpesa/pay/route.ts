import { NextResponse } from 'next/server';
import { getMpesaCredentials } from '@/lib/env';

import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const { phone, amount } = await req.json();

        if (!phone || !amount) {
            return NextResponse.json({ error: 'Phone and amount are required' }, { status: 400 });
        }

        // Format phone number (remove leading 0 or +, ensure 254)
        const formattedPhone = phone.replace(/^(?:\+254|0)/, '254');

        // M-Pesa Credentials
        const { consumerKey, consumerSecret, passkey, shortcode } = getMpesaCredentials();

        if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
            console.error('Missing M-Pesa credentials');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // 1. Generate Access Token
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error('Token Error:', err);
            return NextResponse.json({ error: 'Failed to authenticate with M-Pesa' }, { status: 500 });
        }

        const { access_token } = await tokenRes.json();

        // 2. Initiate STK Push
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.ceil(amount), // Ensure integer
                PartyA: formattedPhone,
                PartyB: shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: process.env.MPESA_CALLBACK_URL || `https://${process.env.VERCEL_URL || 'dj-flowerz-final-v3.vercel.app'}/api/mpesa/callback`,
                AccountReference: 'DJFlowerz',
                TransactionDesc: 'Purchase'
            })
        });

        const stkData = await stkRes.json();

        if (stkData.ResponseCode === '0') {
            // Save pending transaction to DB so callback can update it
            const { error: dbError } = await supabase
                .from('payments')
                .insert({
                    checkout_request_id: stkData.CheckoutRequestID,
                    merchant_request_id: stkData.MerchantRequestID,
                    phone_number: formattedPhone,
                    amount: Math.ceil(amount),
                    status: 'pending'
                });

            if (dbError) {
                console.error('Failed to save payment record:', dbError);
                // We don't block the UI but backend logging is crucial
            }

            return NextResponse.json({
                status: 'pending',
                message: 'STK Push sent',
                merchantRequestId: stkData.MerchantRequestID,
                checkoutRequestId: stkData.CheckoutRequestID
            });
        } else {
            console.error('STK Error:', stkData);
            return NextResponse.json({ error: stkData.errorMessage || 'STK Push failed' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
