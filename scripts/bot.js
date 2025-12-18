const { createClient } = require('@supabase/supabase-js');
const { Telegraf } = require('telegraf');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!supabaseUrl || !supabaseServiceKey || !botToken) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const bot = new Telegraf(botToken);

// /start command - link account
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const args = ctx.message.text.split(' ');

    // If no args (just /start), ask them to use the website to get a link code
    if (args.length < 2) {
        return ctx.reply('Welcome! To link your account, you must start this bot via the link on the DJ Flowerz website.');
    }

    const userId = args[1];

    if (!userId) {
        return ctx.reply('Invalid link code.');
    }

    try {
        // 1. Verify user exists and check if already linked
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, telegram_chat_id, full_name')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error('Profile fetch error:', fetchError);
            return ctx.reply('Error: User not found. Please ensure you are signed up on the website.');
        }

        // 2. Link account
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ telegram_chat_id: telegramId })
            .eq('id', userId);

        if (updateError) {
            console.error('Update error:', updateError);
            return ctx.reply('System Error: Could not link account. Please try again later.');
        }

        // 3. Success Message
        await ctx.reply(`Welcome, ${profile.full_name}! Your account has been successfully linked.`);

        // 4. Generate Invite Link (if channel ID is set)
        if (channelId) {
            try {
                const invite = await ctx.telegram.createChatInviteLink(channelId, {
                    member_limit: 1,
                    expire_date: Math.floor(Date.now() / 1000) + 3600 // 1 hour
                });

                await ctx.reply(`Here is your exclusive invite link to the Music Pool:\n${invite.invite_link}`);
            } catch (inviteError) {
                console.error('Invite generation error:', inviteError);
                ctx.reply('However, I could not generate an invite link at this moment. Please try again later or contact support.');
            }
        }

    } catch (e) {
        console.error('Unexpected error:', e);
        ctx.reply('An unexpected error occurred.');
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
