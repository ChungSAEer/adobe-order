/**
 * Send a message via Telegram Bot API
 * @param {string} chatId
 * @param {string} text
 */
export async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram sendMessage error:', err);
    throw new Error('Failed to send Telegram message');
  }

  return res.json();
}

/**
 * Build the order command string
 * @param {'1m'|'3m'} duration
 * @param {string} email
 * @returns {string}
 */
export function buildOrderCommand(duration, email) {
  return `/order adobe${duration} team ${email}`;
}
