# Required Environment Variables for Netlify Identity + OTP

Add these to your `.env.local` file and to Netlify's environment variables in the dashboard:

```bash
# SMTP Configuration for sending OTP emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Netlify Identity Admin Token (get from Netlify dashboard)
# Go to: Site settings > Identity > Services > Enable Git Gateway
# Then use the access token from: https://app.netlify.com/user/applications
NETLIFY_IDENTITY_ADMIN_TOKEN=your-admin-token-here
```

## How to get SMTP credentials for Gmail:

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to Security > App passwords
4. Generate an app password for "Mail"
5. Use that password as `SMTP_PASS`

## How to get Netlify Identity Admin Token:

1. Go to https://app.netlify.com/user/applications
2. Create a new personal access token
3. Copy the token and add it as `NETLIFY_IDENTITY_ADMIN_TOKEN`

**Note**: Make sure to add these same variables to Netlify's environment variables in the dashboard under Site settings > Environment variables.
