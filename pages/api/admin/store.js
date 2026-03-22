// pages/api/admin/store.js
import { getStore, saveStore } from '../../../lib/store';

export default function handler(req, res) {
  // Simple token check
  const auth = req.headers['x-admin-token'] || req.cookies?.adminToken;
  if (auth !== 'ptm-admin-authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(getStore());
  }

  if (req.method === 'POST') {
    const data = req.body;
    saveStore(data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
