// pages/api/submit.js
import { appendToSheet, ensureSheetHeaders } from '../../lib/sheets';
import { getStore } from '../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    psid, stream, mode, region, branch, branchId,
    overallExperience, physics, chemistry, mathematics,
    biology, english, socialScience, mat,
    branchFacilities, comments
  } = req.body;

  // Validation
  if (!psid || !stream || !mode || !branch || !overallExperience || !branchFacilities) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (psid.trim().length < 3) {
    return res.status(400).json({ error: 'Invalid PSID' });
  }

  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const store = getStore();
  const sheetId = store.settings?.sheetId || process.env.SHEET_ID;

  try {
    await ensureSheetHeaders(sheetId);
    await appendToSheet(sheetId, {
      timestamp, psid: psid.trim().toUpperCase(), stream, mode,
      region, branch, overallExperience, physics, chemistry,
      mathematics, biology, english, socialScience, mat,
      branchFacilities, comments: comments?.trim() || ''
    });

    return res.status(200).json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
}
