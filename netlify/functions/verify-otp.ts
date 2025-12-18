import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Parse Supabase credentials from environment
// Prioritize individual env vars to avoid JSON parse errors
function getSupabaseCredentials() {
    // First try individual env vars (most reliable)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return { url, serviceKey };
    }

    // Fall back to SUPABASE_CREDENTIALS JSON format
    const credsVar = process.env.SUPABASE_CREDENTIALS;
    if (credsVar) {
        try {
            const creds = JSON.parse(credsVar);
            return {
                url: creds.url || creds.supabaseUrl || url,
                serviceKey: creds.serviceRoleKey || creds.service_role_key || serviceKey
            };
        } catch (e) {
            console.warn('SUPABASE_CREDENTIALS JSON malformed, using individual env vars');
        }
    }

    return { url, serviceKey };
}

const { url: supabaseUrl, serviceKey: supabaseServiceKey } = getSupabaseCredentials();

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. URL:', !!supabaseUrl, 'ServiceKey:', !!supabaseServiceKey);
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Hash OTP for verification
function hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { email, otp, password } = JSON.parse(event.body || '{}');

        if (!email || !otp || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email, OTP, and password are required' }),
            };
        }

        const emailLower = email.toLowerCase();

        // Fetch OTP record from Supabase
        const { data: otpRecord, error: fetchError } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('email', emailLower)
            .single();

        if (fetchError || !otpRecord) {
            console.error('OTP fetch error:', fetchError);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid or expired OTP. Please request a new code.' }),
            };
        }

        // Check if OTP has expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            // Delete expired OTP
            await supabase.from('otp_verifications').delete().eq('email', emailLower);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'OTP has expired. Please request a new one.' }),
            };
        }

        // Verify OTP hash matches
        if (otpRecord.otp_hash !== hashOTP(otp)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid OTP code' }),
            };
        }

        // OTP is valid, create user in Netlify Identity
        try {
            const netlifyIdentityUrl = process.env.URL || 'https://djflowerz.netlify.app';
            const adminToken = process.env.NETLIFY_IDENTITY_ADMIN_TOKEN;

            if (!adminToken) {
                throw new Error('NETLIFY_IDENTITY_ADMIN_TOKEN not configured');
            }

            // Create user via Netlify Identity Admin API
            const createUserResponse = await fetch(
                `${netlifyIdentityUrl}/.netlify/identity/admin/users`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${adminToken}`,
                    },
                    body: JSON.stringify({
                        email: emailLower,
                        password,
                        email_confirm: true, // Auto-confirm email since we verified via OTP
                        user_metadata: {
                            full_name: otpRecord.full_name,
                        },
                    }),
                }
            );

            if (!createUserResponse.ok) {
                const errorData = await createUserResponse.json();
                throw new Error(errorData.msg || 'Failed to create user');
            }

            const user = await createUserResponse.json();

            // Clean up OTP from database
            await supabase.from('otp_verifications').delete().eq('email', emailLower);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Account created successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name,
                    },
                }),
            };
        } catch (error: any) {
            console.error('Error creating user in Netlify Identity:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Failed to create user account',
                    details: error.message,
                }),
            };
        }
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to verify OTP',
                details: error.message,
            }),
        };
    }
};
