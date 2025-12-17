# DJ Flowerz Platform

This is the official DJ Flowerz Platform, built with Next.js, Supabase, and M-Pesa Integration.

## Deployment Status

This project is configured for **Production Deployment** on [Vercel](https://vercel.com) and **GitHub**.

- **Live URL**: https://dj-flowerz-final-v3.vercel.app (Pending Final Deploy)
- **Database**: Supabase (Production)
- **Payments**: M-Pesa (Sandbox/Live via Env Vars)

## Features

- **Mixtapes**: Stream and download exclusive mixes.
- **Music Pool**: Subscription-based access to high-quality audio.
- **Store**: Buy DJ gear and software packs using M-Pesa.
- **Admin Dashboard**: Manage products, mixes, and orders.
- **Real-time Updates**: Live content updates via Supabase Realtime.

## Configuration

The application uses Environment Variables to connect to services securely. It does **NOT** rely on localhost for production.

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
- `MPESA_CONSUMER_KEY`: M-Pesa API Key
- `MPESA_CONSUMER_SECRET`: M-Pesa API Secret
- `MPESA_PASSKEY`: M-Pesa Passkey
- `MPESA_SHORTCODE`: Paybill/Till Number
- `MPESA_CALLBACK_URL`: `https://[your-domain]/api/mpesa/callback`

## Deployment Instructions

1. **Push to GitHub**: Changes are automatically tracked.
2. **Vercel**: Connect your GitHub repo to Vercel.
3. **Environment**: Add the variables listed above in Vercel Project Settings.
4. **Deploy**: Vercel will build and serve the site globally.
