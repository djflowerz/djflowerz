
interface MpesaCredentials {
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
}

export function getMpesaCredentials(): MpesaCredentials {
    // Check for the consolidated JSON variable first
    const credentialsJson = process.env.MPESA_CREDENTIALS;

    if (credentialsJson) {
        try {
            return JSON.parse(credentialsJson) as MpesaCredentials;
        } catch (error) {
            console.error('Failed to parse MPESA_CREDENTIALS environment variable', error);
            // Fallback or throw? For now let's try to fall back or throw.
        }
    }

    // Fallback to individual variables for backward compatibility during migration
    // or if the user hasn't set the JSON yet.
    const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    const passkey = process.env.MPESA_PASSKEY || '';
    const shortcode = process.env.MPESA_SHORTCODE || '174379';

    return {
        consumerKey,
        consumerSecret,
        passkey,
        shortcode,
    };
}

export function getEnv(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}
