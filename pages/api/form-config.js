// pages/api/form-config.js
// Public endpoint — no auth needed — returns the form configuration
import { getStore } from '../../lib/store';

const DEFAULT_CONFIG = {
  streams: ['Medical', 'Engineering', 'Foundation'],
  modes: ['Branch (In-person)', 'Virtual'],
  overallRatings: ['Very Satisfied', 'Satisfied', 'Neutral', 'Not Satisfied', 'Very Dissatisfied'],
  subjects: [
    { id: 'physics', label: 'Physics', enabled: true },
    { id: 'chemistry', label: 'Chemistry', enabled: true },
    { id: 'mathematics', label: 'Mathematics', enabled: true },
    { id: 'biology', label: 'Biology', enabled: true },
    { id: 'english', label: 'English', enabled: true },
    { id: 'socialScience', label: 'Social Science', enabled: true },
    { id: 'mat', label: 'MAT', enabled: true },
  ],
  subjectRatings: ['Very Satisfied', 'Satisfied', 'Neutral', 'Not Satisfied'],
  showComments: true,
  commentsLabel: 'Any suggestions or detailed feedback?',
  psidLabel: 'Student PSID',
  psidHint: 'PS ID is the unique number assigned to your ward. Check with branch staff if unavailable.',
  formTitle: 'PTM Attendance & Feedback — 2025',
  instituteName: 'Aakash Institute',
};

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const store = getStore();
  const config = store.formConfig || DEFAULT_CONFIG;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(config);
}
