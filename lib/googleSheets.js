import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

/* ─────────────────────────────────────────────
   SHEET 1 – Orders
   Columns: purchase_email | order_number | adobe_email | duration | time
   ───────────────────────────────────────────── */

/**
 * Get next order number (row count of sheet1 minus header)
 */
async function getNextOrderNumber(sheets) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:A',
  });
  const rows = res.data.values || [];
  // rows[0] is header, so order_number = rows.length (1-indexed, starts at 1)
  return rows.length; // header is row 1, first order = row 2 → order_number = 1
}

/**
 * Append a new order row to Sheet1
 * @param {{ email: string, duration: string }} data
 * @returns {number} order_number assigned
 */
export async function appendOrder({ email, duration }) {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  const orderNumber = await getNextOrderNumber(sheets);
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[email, orderNumber, email, duration, now]],
    },
  });

  return orderNumber;
}

/* ─────────────────────────────────────────────
   SHEET 2 – Links (used as DB)
   Columns: uid | duration | created_at | used
   ───────────────────────────────────────────── */

const LINKS_SHEET = 'Links';

/**
 * Ensure the Links sheet exists (create if needed) and has headers.
 * Works regardless of locale – no dependency on "Sheet2" name.
 */
async function ensureLinksSheet(sheets) {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // Get spreadsheet metadata to check existing sheets
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const existing = meta.data.sheets.map((s) => s.properties.title);

  if (!existing.includes(LINKS_SHEET)) {
    // Create the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: LINKS_SHEET } } }],
      },
    });
    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LINKS_SHEET}!A1:D1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['uid', 'duration', 'created_at', 'used']] },
    });
  } else {
    // Sheet exists – ensure header row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${LINKS_SHEET}!A1:D1`,
    });
    if (!res.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${LINKS_SHEET}!A1:D1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['uid', 'duration', 'created_at', 'used']] },
      });
    }
  }
}

/**
 * Get all rows from Sheet2 (excluding header)
 * @returns {Array<{uid, duration, created_at, used, rowIndex}>}
 */
async function getAllLinkRows(sheets) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${LINKS_SHEET}!A:D`,
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return []; // only header or empty
  return rows.slice(1).map((row, i) => ({
    uid: row[0] || '',
    duration: row[1] || '',
    created_at: row[2] || '',
    used: row[3] === 'TRUE' || row[3] === 'true' || row[3] === true,
    rowIndex: i + 2,
  }));
}

/**
 * Create a new link in Sheet2
 * @param {string} uid
 * @param {'1m'|'3m'} duration
 */
export async function createLink(uid, duration) {
  const sheets = getSheetsClient();
  await ensureLinksSheet(sheets);
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${LINKS_SHEET}!A:D`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[uid, duration, now, 'FALSE']] },
  });
}

/**
 * Get a single link record by UID
 * @param {string} uid
 * @returns {{ uid, duration, created_at, used, rowIndex } | null}
 */
export async function getLink(uid) {
  const sheets = getSheetsClient();
  const rows = await getAllLinkRows(sheets);
  return rows.find((r) => r.uid === uid) || null;
}

/**
 * Mark a link as used (sets column D = TRUE)
 * @param {string} uid
 */
export async function markLinkUsed(uid) {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const rows = await getAllLinkRows(sheets);
  const link = rows.find((r) => r.uid === uid);
  if (!link) throw new Error(`Link ${uid} not found`);

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${LINKS_SHEET}!D${link.rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['TRUE']] },
  });
}

/**
 * Delete a link row from Sheet2
 * @param {string} uid
 */
export async function deleteLink(uid) {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const rows = await getAllLinkRows(sheets);
  const link = rows.find((r) => r.uid === uid);
  if (!link) throw new Error(`Link ${uid} not found`);

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheet2 = meta.data.sheets.find((s) => s.properties.title === LINKS_SHEET);
  if (!sheet2) throw new Error(`Sheet '${LINKS_SHEET}' not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet2.properties.sheetId,
              dimension: 'ROWS',
              startIndex: link.rowIndex - 1, // 0-indexed
              endIndex: link.rowIndex,
            },
          },
        },
      ],
    },
  });
}

/**
 * List all active (unused) links
 * @returns {Array<{uid, duration, created_at}>}
 */
export async function listActiveLinks() {
  const sheets = getSheetsClient();
  const rows = await getAllLinkRows(sheets);
  return rows.filter((r) => !r.used).map(({ uid, duration, created_at }) => ({ uid, duration, created_at }));
}
