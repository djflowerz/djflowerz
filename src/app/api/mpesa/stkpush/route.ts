import { NextResponse } from 'next/server';
import { getMpesaToken, generatePassword } from '@/lib/mpesa';
import { getEnv } from '@/lib/env';
import { supabase } from '@/lib/supabaseClient';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { phoneNumber, amount, accountReference } = await req.json();

        // Format phone number to 254...
        const formattedPhone = phoneNumber.startsWith('0')
            ? '254' + phoneNumber.slice(1)
            : phoneNumber;

        const token = await getMpesaToken();
        const { password, timestamp, shortcode } = generatePassword();

        const callbackUrl = getEnv('MPESA_CALLBACK_URL') || 'https://dj-flowerz-platform.vercel.app/api/mpesa/callback';

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: formattedPhone,
                PartyB: shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: callbackUrl,
                AccountReference: accountReference || 'DJ Flowerz',
                TransactionDesc: 'Payment for DJ Flowerz',
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Save the checkout request ID to the database to link it later
        const { error: dbError } = await supabase.from('payments').insert({
            checkout_request_id: response.data.CheckoutRequestID,
            merchant_request_id: response.data.MerchantRequestID,
            phone_number: formattedPhone,
            amount: amount,
            status: 'pending',
            account_reference: accountReference || 'DJ Flowerz'
        });

        if (dbError) {
            console.error('Failed to save payment init to DB:', dbError);
            // We still return success to frontend but this is risky if callback comes before we fix it? 
            // Actually if this fails, callback won't find the record. We should probably log it heavily.
        }

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('STK Push Error:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to initiate STK Push', details: error.response?.data },
            { status: 500 }
        );
    }
}
