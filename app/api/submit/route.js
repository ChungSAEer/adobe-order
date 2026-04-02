import { getLink, markLinkUsed, appendOrder } from '@/lib/googleSheets';
import { sendTelegramMessage } from '@/lib/telegram';
import { addAdobeUser } from '@/lib/adobeApi';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { uid, email } = body;

  if (!uid || !email) {
    return Response.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Email không hợp lệ' }, { status: 400 });
  }

  // ── 1. Check link validity ───────────────────────────
  let link;
  try {
    link = await getLink(uid);
  } catch (err) {
    console.error('getLink error:', err);
    return Response.json({ error: 'Lỗi kiểm tra link' }, { status: 500 });
  }

  if (!link) {
    return Response.json({ error: 'Link không tồn tại hoặc đã được sử dụng' }, { status: 404 });
  }

  if (link.used) {
    return Response.json({ error: 'Link này đã được sử dụng' }, { status: 410 });
  }

  const durationMonths = link.duration === '3m' ? 3 : 1;

  // ── 2. Call Adobe API ────────────────────────────────
  let apiResult;
  try {
    apiResult = await addAdobeUser(email, durationMonths);
  } catch (err) {
    console.error('Adobe API error:', err);
    // Return error to user — do NOT close the link
    return Response.json(
      { error: `Lỗi kích hoạt Adobe: ${err.message}` },
      { status: 502 }
    );
  }

  // ── 3. Mark link as used ─────────────────────────────
  try {
    await markLinkUsed(uid);
  } catch (err) {
    console.error('markLinkUsed error:', err);
    // Non-critical — continue
  }

  // ── 4. Append to Google Sheet ────────────────────────
  let orderNumber;
  try {
    orderNumber = await appendOrder({ email, duration: link.duration });
  } catch (err) {
    console.error('appendOrder error:', err);
    // Non-critical — continue
  }

  // ── 5. Notify admin (private) ────────────────────────
  try {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    const expiresAt = apiResult.user?.expiresAt
      ? new Date(apiResult.user.expiresAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      : 'N/A';

    await sendTelegramMessage(
      adminId,
      `✅ <b>Đơn hàng #${orderNumber ?? '?'} đã kích hoạt thành công!</b>\n\n` +
        `📧 Email: <code>${email}</code>\n` +
        `📦 Gói: <b>${durationMonths} tháng</b>\n` +
        `📅 Hết hạn: <b>${expiresAt}</b>\n` +
        `💳 Credits còn lại: <b>${apiResult.creditsRemaining}</b>`
    );
  } catch (err) {
    console.error('Telegram notify error:', err);
    // Non-critical
  }

  return Response.json({
    success: true,
    orderNumber,
    duration: link.duration,
    email,
    expiresAt: apiResult.user?.expiresAt,
  });
}
