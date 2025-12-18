import type { Handler, HandlerEvent } from '@netlify/functions';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client with service role for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Hash OTP for secure storage
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
        const { email, fullName } = JSON.parse(event.body || '{}');

        if (!email || !fullName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email and full name are required' }),
            };
        }

        const emailLower = email.toLowerCase();

        // Generate 6-digit OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // Store OTP hash in Supabase with 10-minute expiration
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { error: upsertError } = await supabase
            .from('otp_verifications')
            .upsert({
                email: emailLower,
                otp_hash: hashOTP(otp),
                full_name: fullName,
                expires_at: expiresAt,
            }, { onConflict: 'email' });

        if (upsertError) {
            console.error('Error storing OTP:', upsertError);
            throw new Error('Failed to store verification code');
        }

        // Clean up expired OTPs
        await supabase.rpc('cleanup_expired_otps').catch(() => { });

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send OTP email
        await transporter.sendMail({
            from: `"DJ Flowerz" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Verification Code - DJ Flowerz',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 DJ Flowerz</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hi ${fullName},</p>
              <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DJ Flowerz. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        console.log(`OTP sent to ${emailLower}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'OTP sent successfully',
                expiresIn: 600, // 10 minutes in seconds
            }),
        };
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to send OTP',
                details: error.message,
            }),
        };
    }
};
