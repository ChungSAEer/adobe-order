import crypto from 'crypto';

const API_KEY = process.env.ADOBE_API_KEY;
const BASE_URL = 'https://reseller.adobe.yoga/api/credits-pool/external';

/**
 * Call Adobe reseller API to add a user
 * @param {string} email
 * @param {number} durationMonths - 1 or 3
 * @returns {Promise<{success: boolean, user?: object, creditsRemaining?: number, error?: string}>}
 */
export async function addAdobeUser(email, durationMonths) {
  const timestamp = Date.now().toString();
  const organizationId = durationMonths === 3 ? 91 : 31;
  const body = {
    email,
    durationMonths,
    organizationId,
    products: ['Creative Cloud Pro Plus for teams Configuration'],
  };
  const bodyStr = JSON.stringify(body);

  // HMAC-SHA256(timestamp + body, api_key)
  const payload = timestamp + bodyStr;
  const signature = crypto
    .createHmac('sha256', API_KEY)
    .update(payload)
    .digest('hex');

  const res = await fetch(`${BASE_URL}/add-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-timestamp': timestamp,
      'x-signature': signature,
    },
    body: bodyStr,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }

  return data;
}
