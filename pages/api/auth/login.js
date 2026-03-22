// pages/api/auth/login.js
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aesl@1234';
  
  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, token: 'ptm-admin-authenticated' });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid password' });
}
