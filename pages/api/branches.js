// pages/api/branches.js
import { getStore } from '../../lib/store';

export default function handler(req, res) {
  const store = getStore();
  return res.status(200).json({
    branches: store.branches,
    regions: store.regions
  });
}
