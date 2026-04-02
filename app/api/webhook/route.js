import { sendTelegramMessage } from '@/lib/telegram';
import { createLink, deleteLink, listActiveLinks } from '@/lib/googleSheets';
import { generateUID } from '@/lib/uid';

const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;
const DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

function isAdmin(chatId) {
  return String(chatId) === String(ADMIN_ID);
}

// Always return 200 to Telegram so it doesn't retry
function ok() {
  return new Response('OK', { status: 200 });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const message = body?.message;
  if (!message) return ok();

  const chatId = message.chat?.id;
  const text = (message.text || '').trim();

  // ── /link1m ──────────────────────────────────────
  if (text === '/link1m') {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Bạn không có quyền thực hiện lệnh này.');
      return ok();
    }
    try {
      const uid = generateUID('1m');
      await createLink(uid, '1m');
      const link = `${DOMAIN}/${uid}`;
      await sendTelegramMessage(
        chatId,
        `✅ <b>Link 1 tháng đã được tạo:</b>\n\n<code>${link}</code>\n\n⚠️ Link chỉ dùng được <b>1 lần</b>.\nUID: <code>${uid}</code>`
      );
    } catch (err) {
      console.error('[link1m]', err);
      await sendTelegramMessage(chatId, `❌ Lỗi tạo link: ${err.message}`);
    }
    return ok();
  }

  // ── /link3m ──────────────────────────────────────
  if (text === '/link3m') {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Bạn không có quyền thực hiện lệnh này.');
      return ok();
    }
    try {
      const uid = generateUID('3m');
      await createLink(uid, '3m');
      const link = `${DOMAIN}/${uid}`;
      await sendTelegramMessage(
        chatId,
        `✅ <b>Link 3 tháng đã được tạo:</b>\n\n<code>${link}</code>\n\n⚠️ Link chỉ dùng được <b>1 lần</b>.\nUID: <code>${uid}</code>`
      );
    } catch (err) {
      console.error('[link3m]', err);
      await sendTelegramMessage(chatId, `❌ Lỗi tạo link: ${err.message}`);
    }
    return ok();
  }

  // ── /links ──────────────────────────────────────
  if (text === '/links') {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Bạn không có quyền thực hiện lệnh này.');
      return ok();
    }
    try {
      const links = await listActiveLinks();
      if (links.length === 0) {
        await sendTelegramMessage(chatId, '📭 Không có link nào đang active.');
      } else {
        const lines = links.map(
          (l, i) =>
            `${i + 1}. [${l.duration}] <code>${DOMAIN}/${l.uid}</code>\n   UID: <code>${l.uid}</code>\n   Tạo lúc: ${l.created_at}`
        );
        await sendTelegramMessage(
          chatId,
          `📋 <b>Danh sách link active (${links.length}):</b>\n\n${lines.join('\n\n')}`
        );
      }
    } catch (err) {
      console.error('[links]', err);
      await sendTelegramMessage(chatId, `❌ Lỗi: ${err.message}`);
    }
    return ok();
  }

  // ── /dellink <uid> ───────────────────────────────
  if (text.startsWith('/dellink ')) {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Bạn không có quyền thực hiện lệnh này.');
      return ok();
    }
    const uid = text.replace('/dellink ', '').trim();
    try {
      await deleteLink(uid);
      await sendTelegramMessage(chatId, `🗑️ Đã xoá link <code>${uid}</code> thành công.`);
    } catch (err) {
      console.error('[dellink]', err);
      await sendTelegramMessage(chatId, `❌ Lỗi: ${err.message}`);
    }
    return ok();
  }

  // ── /help / /start ────────────────────────────────────────
  if (text === '/help' || text === '/start') {
    if (isAdmin(chatId)) {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>Adobe Order Bot – Lệnh Admin</b>\n\n` +
          `/link1m – Tạo link đặt hàng 1 tháng\n` +
          `/link3m – Tạo link đặt hàng 3 tháng\n` +
          `/links – Xem tất cả link đang active\n` +
          `/dellink &lt;uid&gt; – Xoá link theo UID\n` +
          `/help – Xem hướng dẫn`
      );
    }
    return ok();
  }

  return ok();
}
