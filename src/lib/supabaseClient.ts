
import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const credsVar = process.env.SUPABASE_CREDENTIALS

let supabaseUrl = envUrl
let supabaseAnonKey = envKey

if (credsVar) {
    try {
        const creds = JSON.parse(credsVar)
        if (creds.url) supabaseUrl = creds.url
        if (creds.anonKey) supabaseAnonKey = creds.anonKey
    } catch (e) {
        console.error('Error parsing SUPABASE_CREDENTIALS', e)
    }
}

const finalUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(finalUrl, finalKey)
