
import { getMpesaCredentials } from '../src/lib/env';

// Mock process.env
process.env.MPESA_CREDENTIALS = JSON.stringify({
    consumerKey: 'mock_key',
    consumerSecret: 'mock_secret',
    passkey: 'mock_passkey',
    shortcode: 'mock_shortcode'
});

const creds = getMpesaCredentials();

console.log('Credentials parsed:', creds);

if (
    creds.consumerKey === 'mock_key' &&
    creds.consumerSecret === 'mock_secret' &&
    creds.passkey === 'mock_passkey' &&
    creds.shortcode === 'mock_shortcode'
) {
    console.log('SUCCESS: MPESA_CREDENTIALS parsed correctly.');
} else {
    console.error('FAILURE: MPESA_CREDENTIALS content mismatch.');
    process.exit(1);
}

// Test fallback
delete process.env.MPESA_CREDENTIALS;
process.env.MPESA_CONSUMER_KEY = 'legacy_key';
process.env.MPESA_CONSUMER_SECRET = 'legacy_secret';
process.env.MPESA_PASSKEY = 'legacy_passkey';
process.env.MPESA_SHORTCODE = 'legacy_shortcode';

const legacyCreds = getMpesaCredentials();

console.log('Legacy Credentials parsed:', legacyCreds);

if (
    legacyCreds.consumerKey === 'legacy_key' &&
    legacyCreds.consumerSecret === 'legacy_secret' &&
    legacyCreds.passkey === 'legacy_passkey' &&
    legacyCreds.shortcode === 'legacy_shortcode'
) {
    console.log('SUCCESS: Legacy variables parsed correctly.');
} else {
    console.error('FAILURE: Legacy variables mismatch.');
    process.exit(1);
}
