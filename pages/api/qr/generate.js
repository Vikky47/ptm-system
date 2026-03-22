// pages/api/qr/generate.js
import QRCode from 'qrcode';
import { getStore } from '../../../lib/store';

export default async function handler(req, res) {
  const { branchId, format } = req.query;
  
  const store = getStore();
  const branch = store.branches.find(b => b.id === branchId);
  if (!branch) return res.status(404).json({ error: 'Branch not found' });
  
  const region = store.regions.find(r => r.id === branch.regionId);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const url = `${baseUrl}/ptm?region=${encodeURIComponent(region?.name || '')}&branch=${encodeURIComponent(branch.name)}&branchId=${branch.id}`;
  
  if (format === 'png') {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' }
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="QR-${branch.name.replace(/[^a-z0-9]/gi, '-')}.png"`);
    return res.send(buffer);
  }
  
  // Return data URL for display
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' }
  });
  
  return res.status(200).json({ qr: dataUrl, url, branchName: branch.name, regionName: region?.name });
}
