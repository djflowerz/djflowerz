const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!supabaseUrl || !supabaseServiceKey || !botToken || !channelId) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkExpiredSubscriptions() {
    console.log('Checking for expired subscriptions...');

    // 1. Get expired active subscriptions
    const { data: expiredSubs, error } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .lt('end_date', new Date().toISOString())
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
    }

    console.log(`Found ${expiredSubs.length} expired subscriptions.`);

    for (const sub of expiredSubs) {
        // Fetch profile manually since no direct FK in public schema
        const { data: profile } = await supabase
            .from('profiles')
            .select('telegram_chat_id')
            .eq('id', sub.user_id)
            .single();

        const telegramId = profile?.telegram_chat_id;

        if (telegramId) {
            try {
                // Kick user
                await axios.post(`https://api.telegram.org/bot${botToken}/banChatMember`, {
                    chat_id: channelId,
                    user_id: telegramId
                });

                // Unban immediately so they can rejoin later (Kick = Ban + Unban)
                await axios.post(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
                    chat_id: channelId,
                    user_id: telegramId
                });

                console.log(`Kicked user ${telegramId} for expired subscription ${sub.id}`);

                // Mark subscription as inactive
                await supabase
                    .from('subscriptions')
                    .update({ is_active: false })
                    .eq('id', sub.id);

            } catch (err) {
                console.error(`Failed to kick user ${telegramId}:`, err.response?.data || err.message);
            }
        } else {
            console.log(`Subscription ${sub.id} expired but no Telegram ID found.`);
            // Still mark inactive
            await supabase
                .from('subscriptions')
                .update({ is_active: false })
                .eq('id', sub.id);
        }
    }
}

// Run every minute
setInterval(checkExpiredSubscriptions, 60 * 1000);
checkExpiredSubscriptions(); // Run immediately on start
