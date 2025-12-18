#!/bin/bash

# Netlify Environment Variables Setup Script
# This script adds environment variables to your Netlify site using the API

SITE_ID="djflowerz"
ACCESS_TOKEN="nfp_L4fJceXhYKzFJo9GV6n5dwtaXAWpcpDvfaf8"

echo "Adding environment variables to Netlify site: $SITE_ID"
echo "================================================"

# Function to add an environment variable
add_env_var() {
    local key=$1
    local value=$2
    
    echo "Adding $key..."
    
    curl -X POST \
      "https://api.netlify.com/api/v1/accounts/sites/$SITE_ID/env" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"key\": \"$key\",
        \"values\": [{
          \"value\": \"$value\",
          \"context\": \"all\"
        }]
      }"
    
    echo ""
}

# Add each environment variable
add_env_var "SMTP_HOST" "smtp.gmail.com"
add_env_var "SMTP_PORT" "587"
add_env_var "SMTP_USER" "ianmuriithiflowerz@gmail.com"
add_env_var "NETLIFY_IDENTITY_ADMIN_TOKEN" "nfp_L4fJceXhYKzFJo9GV6n5dwtaXAWpcpDvfaf8"

echo ""
echo "================================================"
echo "✅ Environment variables added!"
echo ""
echo "⚠️  IMPORTANT: You still need to add SMTP_PASS manually"
echo "1. Go to: https://myaccount.google.com/apppasswords"
echo "2. Generate an app password for 'Mail'"
echo "3. Add it at: https://app.netlify.com/sites/djflowerz/settings/env"
echo "   Key: SMTP_PASS"
echo "   Value: <your-gmail-app-password>"
echo ""
echo "Then redeploy: https://app.netlify.com/sites/djflowerz/deploys"
