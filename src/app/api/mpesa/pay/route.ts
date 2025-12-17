import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone, amount } = await req.json();

        if (!phone || !amount) {
            return NextResponse.json({ error: 'Phone and amount are required' }, { status: 400 });
        }

        // Format phone number (remove leading 0 or +, ensure 254)
        const formattedPhone = phone.replace(/^(?:\+254|0)/, '254');

        // M-Pesa Credentials
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const passkey = process.env.MPESA_PASSKEY;
        const shortcode = process.env.MPESA_SHORTCODE;

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
                CallBackURL: `https://dj-flowerz-platform.vercel.app/api/mpesa/callback`, // Replace with actual domain in prod
                AccountReference: 'DJFlowerz',
                TransactionDesc: 'Purchase'
            })
        });

        const stkData = await stkRes.json();

        if (stkData.ResponseCode === '0') {
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
