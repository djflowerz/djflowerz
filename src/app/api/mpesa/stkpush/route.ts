import { NextResponse } from 'next/server';
import { getMpesaToken, generatePassword } from '@/lib/mpesa';
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

        const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://dj-flowerz-platform.vercel.app/api/mpesa/callback';

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

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('STK Push Error:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to initiate STK Push', details: error.response?.data },
            { status: 500 }
        );
    }
}
