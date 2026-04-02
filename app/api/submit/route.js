import { getLink, markLinkUsed, appendOrder } from '@/lib/googleSheets';
import { sendTelegramMessage, buildOrderCommand } from '@/lib/telegram';

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

  // Check link validity
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

  // Append to Google Sheet (Sheet1)
  let orderNumber;
  try {
    orderNumber = await appendOrder({ email, duration: link.duration });
  } catch (err) {
    console.error('appendOrder error:', err);
    return Response.json({ error: 'Lỗi lưu dữ liệu vào Google Sheet' }, { status: 500 });
  }

  // Mark link as used
  try {
    await markLinkUsed(uid);
  } catch (err) {
    console.error('markLinkUsed error:', err);
    // Non-critical – continue
  }

  // Send Telegram notification to group
  try {
    const notifyChatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;
    const orderCmd = buildOrderCommand(link.duration, email);

    // Message 1: order summary
    const msg =
      `🛒 <b>Đơn hàng mới #${orderNumber}</b>\n\n` +
      `📧 Email: <code>${email}</code>\n` +
      `📦 Gói: <b>${link.duration === '1m' ? '1 Tháng' : '3 Tháng'}</b>\n` +
      `🔗 UID link: <code>${uid}</code>`;
    await sendTelegramMessage(notifyChatId, msg);

    // Message 2: lệnh xử lý (gửi riêng để dễ copy/forward)
    await sendTelegramMessage(notifyChatId, orderCmd);
  } catch (err) {
    console.error('sendTelegramMessage error:', err);
    // Non-critical – don't fail the request
  }

  return Response.json({
    success: true,
    orderNumber,
    duration: link.duration,
    email,
  });
}
