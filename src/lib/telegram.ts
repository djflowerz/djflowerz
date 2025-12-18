import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. @djflowerzpool

export const telegram = {
    async sendMessage(chatId: string, text: string) {
        if (!TELEGRAM_BOT_TOKEN) return;
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown',
            });
        } catch (error) {
            console.error('Telegram Send Error:', error);
        }
    },

    async createInviteLink(memberLimit: number = 1) {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) return null;
        try {
            const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createChatInviteLink`, {
                chat_id: TELEGRAM_CHANNEL_ID,
                member_limit: memberLimit,
                expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
            });
            return response.data.result.invite_link;
        } catch (error) {
            console.error('Telegram Invite Error:', error);
            return null;
        }
    },

    async notifyPaymentSuccess(details: { orderId: string, amount: number, phone: string, receipt: string }) {
        const message = `
🎉 *New Payment Received!*

💰 *Amount:* KES ${details.amount}
🧾 *Receipt:* ${details.receipt}
📱 *Phone:* ${details.phone}
🆔 *Order ID:* ${details.orderId}

_System Notification_
        `.trim();

        await this.sendMessage(TELEGRAM_CHANNEL_ID || '', message);
    }
};
