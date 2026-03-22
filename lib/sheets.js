// lib/sheets.js
// Google Sheets integration using service account

function parsePrivateKey(raw) {
  // Handle all Vercel env var escaping scenarios
  return raw
    .replace(/\\n/g, '\n')      // literal \n → real newline
    .replace(/\\\\n/g, '\n')    // double-escaped \\n → real newline
    .replace(/\r\n/g, '\n')     // Windows line endings
    .trim();
}

export async function appendToSheet(sheetId, rowData) {
  const GOOGLE_SHEETS_EMAIL = process.env.GOOGLE_SHEETS_EMAIL;
  const GOOGLE_SHEETS_KEY = process.env.GOOGLE_SHEETS_KEY;

  if (!GOOGLE_SHEETS_EMAIL || !GOOGLE_SHEETS_KEY) {
    console.warn('Google Sheets credentials not configured. Data logged to console only.');
    console.log('PTM Submission:', rowData);
    return { success: true, mock: true };
  }

  try {
    const { google } = await import('googleapis');

    const privateKey = parsePrivateKey(GOOGLE_SHEETS_KEY);

    const auth = new google.auth.JWT(
      GOOGLE_SHEETS_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        rowData.timestamp,
        rowData.psid,
        rowData.stream,
        rowData.mode,
        rowData.region,
        rowData.branch,
        rowData.overallExperience,
        rowData.physics || '',
        rowData.chemistry || '',
        rowData.mathematics || '',
        rowData.biology || '',
        rowData.english || '',
        rowData.socialScience || '',
        rowData.mat || '',
        rowData.branchFacilities,
        rowData.comments || ''
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:P',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    });

    return { success: true, updates: response.data.updates };
  } catch (error) {
    console.error('Sheets error:', error.message);
    throw new Error('Failed to write to Google Sheets: ' + error.message);
  }
}

export async function ensureSheetHeaders(sheetId) {
  const GOOGLE_SHEETS_EMAIL = process.env.GOOGLE_SHEETS_EMAIL;
  const GOOGLE_SHEETS_KEY = process.env.GOOGLE_SHEETS_KEY;

  if (!GOOGLE_SHEETS_EMAIL || !GOOGLE_SHEETS_KEY) return;

  try {
    const { google } = await import('googleapis');

    const privateKey = parsePrivateKey(GOOGLE_SHEETS_KEY);

    const auth = new google.auth.JWT(
      GOOGLE_SHEETS_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:P1'
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:P1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            'Timestamp', 'PSID', 'Stream', 'Mode', 'Region', 'Branch',
            'Overall Experience', 'Physics', 'Chemistry', 'Mathematics',
            'Biology', 'English', 'Social Science', 'MAT',
            'Branch Facilities', 'Comments'
          ]]
        }
      });
    }
  } catch (e) {
    console.error('Header setup error:', e.message);
  }
}
