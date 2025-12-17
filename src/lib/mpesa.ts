import axios from 'axios';


// Helper to get env vars safely
const getEnv = (key: string) => {
    // In some builds process.env might be empty at top level, but okay at runtime.
    // However, top level usage is dangerous in edge/client. All calls should be inside functions.
    return process.env[key] || '';
};

// We will access these inside the functions to be safe

export async function getMpesaToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) throw new Error("Missing MPESA credentials");

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('M-Pesa Token Error:', error);
        throw new Error('Failed to get M-Pesa token');
    }
}

export function generatePassword() {
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE || '174379';

    if (!passkey) throw new Error("Missing MPESA Passkey");

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    return { password, timestamp, shortcode };
}
