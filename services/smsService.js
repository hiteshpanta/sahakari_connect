// SMS delivery service.
//
// When a real provider is configured (SMS_PROVIDER + credentials), messages are
// sent through it. Otherwise the service runs in a simulated "dev" mode so the
// feature works end-to-end without external credentials.
//
// Supported provider: sparrow (https://api.sparrowsms.com/v2/sms/)
//   SMS_PROVIDER=sparrow
//   SMS_API_TOKEN=<sparrow token>
//   SMS_SENDER_ID=<sender id or default "InfoSMS">

const PROVIDERS = {
  sparrow: async ({ phone, message, senderId, token }) => {
    const params = new URLSearchParams();
    params.set('token', token);
    params.set('from', senderId);
    params.set('to', phone);
    params.set('text', message);
    const res = await fetch('https://api.sparrowsms.com/v2/sms/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { delivered: false, status: 'failed', response: data.response || `HTTP ${res.status}` };
    }
    return { delivered: true, status: 'delivered', response: data.response || 'sent' };
  }
};

// Normalize a Nepal number to an international format suitable for gateways.
function normalizePhone(phone) {
  let p = String(phone || '').replace(/[^\d+]/g, '');
  if (p.startsWith('+977')) return p;
  if (p.startsWith('977')) return `+${p}`;
  if (p.startsWith('0') && p.length === 10) return `+977${p.slice(1)}`;
  return `+977${p}`;
}

async function sendSms({ phone, message, senderId, token, provider }) {
  const to = normalizePhone(phone);
  const text = String(message || '').slice(0, 160);
  if (!text) {
    throw new Error('Message cannot be empty');
  }
  if (!phone) {
    throw new Error('Recipient phone number is required');
  }

  const resolvedProvider = provider || process.env.SMS_PROVIDER || 'simulator';

  if (resolvedProvider === 'simulator' || resolvedProvider === 'sim') {
    return {
      delivered: true,
      status: 'delivered',
      provider: 'simulator',
      to,
      response: `SMS queued to ${to} (simulated - configure SMS_PROVIDER to send via a real gateway)`
    };
  }

  const handler = PROVIDERS[resolvedProvider];
  if (!handler) {
    throw new Error(`Unsupported SMS provider: ${resolvedProvider}`);
  }

  const result = await handler({
    phone: to,
    message: text,
    senderId: senderId || process.env.SMS_SENDER_ID || 'InfoSMS',
    token: token || process.env.SMS_API_TOKEN
  });

  if (!result.delivered && !process.env.SMS_API_TOKEN) {
    return {
      delivered: false,
      status: 'failed',
      provider: resolvedProvider,
      to,
      response: 'SMS provider configured but SMS_API_TOKEN is missing'
    };
  }

  return { ...result, provider: resolvedProvider, to };
}

module.exports = { sendSms, normalizePhone };
