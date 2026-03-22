// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TABS = ['Regions', 'Branches', 'QR Codes', 'Settings'];

function useAdmin() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    if (!t) { router.push('/admin/login'); return; }
    setToken(t);
  }, []);

  return token;
}

function AdminLayout({ children, activeTab, setActiveTab, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      {/* Top Nav */}
      <nav style={{
        background: 'var(--dark)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🎓</span>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
            PTM Admin
          </span>
          <span style={{
            background: 'var(--brand)', color: 'white', fontSize: '10px',
            padding: '2px 8px', borderRadius: '20px', fontWeight: '600'
          }}>AAKASH</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--brand)' : 'transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.6)',
                border: 'none', padding: '8px 16px', borderRadius: '8px',
                fontWeight: '500', fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >{tab}</button>
          ))}
        </div>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
            border: 'none', padding: '8px 16px', borderRadius: '8px',
            fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
          }}
        >Logout</button>
      </nav>
      <main style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}

// ─── REGIONS TAB ─────────────────────────────────────────────────────────────
function RegionsTab({ store, onSave }) {
  const [regions, setRegions] = useState(store.regions || []);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const toId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addRegion = () => {
    if (!newName.trim()) return;
    const id = toId(newName);
    if (regions.find(r => r.id === id)) return alert('Region ID already exists.');
    const updated = [...regions, { id, name: newName.trim() }];
    setRegions(updated);
    setNewName('');
    saveData(updated, store.branches);
  };

  const deleteRegion = (id) => {
    if (!confirm('Delete this region? Branches mapped to it will become unmapped.')) return;
    const updated = regions.filter(r => r.id !== id);
    setRegions(updated);
    saveData(updated, store.branches);
  };

  const saveEdit = () => {
    const updated = regions.map(r => r.id === editId ? { ...r, name: editName } : r);
    setRegions(updated);
    setEditId(null);
    saveData(updated, store.branches);
  };

  const saveData = async (regs, branches) => {
    setSaving(true);
    await onSave({ ...store, regions: regs, branches });
    setSaving(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>Regions</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>
            {regions.length} regions configured
          </p>
        </div>
        {saving && <span style={{ color: 'var(--brand)', fontSize: '13px' }}>💾 Saving...</span>}
      </div>

      {/* Add Region */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <label className="label">Add New Region</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="input"
            placeholder="e.g. South West"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRegion()}
          />
          <button className="btn-primary" onClick={addRegion} style={{ whiteSpace: 'nowrap' }}>
            + Add Region
          </button>
        </div>
      </div>

      {/* Region List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {regions.map(region => {
          const branchCount = (store.branches || []).filter(b => b.regionId === region.id).length;
          return (
            <div key={region.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'var(--brand-light)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px', flexShrink: 0
              }}>🗺️</div>
              <div style={{ flex: 1 }}>
                {editId === region.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      className="input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ maxWidth: '250px' }}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    />
                    <button className="btn-primary" onClick={saveEdit} style={{ padding: '8px 16px' }}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditId(null)} style={{ padding: '8px 16px' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{region.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--mid)' }}>
                      ID: {region.id} · {branchCount} branch{branchCount !== 1 ? 'es' : ''}
                    </div>
                  </>
                )}
              </div>
              {editId !== region.id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => { setEditId(region.id); setEditName(region.name); }}
                    style={{ padding: '8px 14px', fontSize: '13px' }}>✏️ Edit</button>
                  <button className="btn-danger" onClick={() => deleteRegion(region.id)}>🗑️ Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BRANCHES TAB ────────────────────────────────────────────────────────────
function BranchesTab({ store, onSave }) {
  const [branches, setBranches] = useState(store.branches || []);
  const [newName, setNewName] = useState('');
  const [newRegionId, setNewRegionId] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterRegion, setFilterRegion] = useState('all');
  const [saving, setSaving] = useState(false);

  const toId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addBranch = () => {
    if (!newName.trim() || !newRegionId) return alert('Please enter branch name and select a region.');
    const id = toId(newName);
    const candidate = { id: id + '-' + Date.now(), name: newName.trim(), regionId: newRegionId };
    const updated = [...branches, candidate];
    setBranches(updated);
    setNewName('');
    setNewRegionId('');
    saveData(updated);
  };

  const deleteBranch = (id) => {
    if (!confirm('Delete this branch?')) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    saveData(updated);
  };

  const saveEdit = () => {
    const updated = branches.map(b => b.id === editId ? { ...b, ...editData } : b);
    setBranches(updated);
    setEditId(null);
    saveData(updated);
  };

  const saveData = async (branchesList) => {
    setSaving(true);
    await onSave({ ...store, branches: branchesList });
    setSaving(false);
  };

  const filtered = filterRegion === 'all' ? branches : branches.filter(b => b.regionId === filterRegion);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>Branches</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>
            {branches.length} branches across {store.regions?.length} regions
          </p>
        </div>
        {saving && <span style={{ color: 'var(--brand)', fontSize: '13px' }}>💾 Saving...</span>}
      </div>

      {/* Add Branch */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <label className="label">Add New Branch</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Branch name e.g. Delhi - Dwarka"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: '1', minWidth: '200px' }}
          />
          <select
            className="input"
            value={newRegionId}
            onChange={e => setNewRegionId(e.target.value)}
            style={{ flex: '0 0 180px' }}
          >
            <option value="">Select Region</option>
            {(store.regions || []).map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={addBranch} style={{ whiteSpace: 'nowrap' }}>
            + Add Branch
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterRegion('all')}
          style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filterRegion === 'all' ? 'var(--brand)' : 'white',
            color: filterRegion === 'all' ? 'white' : 'var(--mid)',
            fontWeight: '500', fontSize: '13px', border: '1.5px solid var(--border)'
          }}
        >All ({branches.length})</button>
        {(store.regions || []).map(r => {
          const count = branches.filter(b => b.regionId === r.id).length;
          return (
            <button
              key={r.id}
              onClick={() => setFilterRegion(r.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: filterRegion === r.id ? 'var(--brand)' : 'white',
                color: filterRegion === r.id ? 'white' : 'var(--mid)',
                fontWeight: '500', fontSize: '13px', border: '1.5px solid var(--border)'
              }}
            >{r.name} ({count})</button>
          );
        })}
      </div>

      {/* Branch List */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {filtered.map(branch => {
          const region = (store.regions || []).find(r => r.id === branch.regionId);
          return (
            <div key={branch.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: '#f0f9ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', flexShrink: 0
              }}>🏢</div>
              <div style={{ flex: 1 }}>
                {editId === branch.id ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ maxWidth: '250px' }} />
                    <select className="input" value={editData.regionId || ''} onChange={e => setEditData({ ...editData, regionId: e.target.value })} style={{ maxWidth: '160px' }}>
                      {(store.regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button className="btn-primary" onClick={saveEdit} style={{ padding: '8px 14px' }}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditId(null)} style={{ padding: '8px 14px' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{branch.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--mid)' }}>
                      Region: <span style={{ color: 'var(--brand)', fontWeight: '600' }}>{region?.name || 'Unmapped'}</span>
                    </div>
                  </>
                )}
              </div>
              {editId !== branch.id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => { setEditId(branch.id); setEditData({ name: branch.name, regionId: branch.regionId }); }}
                    style={{ padding: '7px 12px', fontSize: '12px' }}>✏️ Edit</button>
                  <button className="btn-danger" onClick={() => deleteBranch(branch.id)}>🗑️</button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--mid)' }}>
            No branches found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QR CODES TAB ────────────────────────────────────────────────────────────
function QRCodesTab({ store }) {
  const [qrData, setQrData] = useState({});
  const [loading, setLoading] = useState({});
  const [filterRegion, setFilterRegion] = useState('all');
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const loadQR = async (branchId) => {
    if (qrData[branchId]) return;
    setLoading(l => ({ ...l, [branchId]: true }));
    try {
      const res = await fetch(`/api/qr/generate?branchId=${branchId}`, {
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      setQrData(q => ({ ...q, [branchId]: data }));
    } catch (e) {}
    setLoading(l => ({ ...l, [branchId]: false }));
  };

  const downloadQR = (branchId) => {
    window.open(`/api/qr/generate?branchId=${branchId}&format=png`, '_blank');
  };

  const loadAll = async () => {
    const filtered = filterRegion === 'all' ? store.branches : store.branches.filter(b => b.regionId === filterRegion);
    for (const branch of filtered) {
      await loadQR(branch.id);
    }
  };

  const filtered = filterRegion === 'all' ? store.branches : store.branches.filter(b => b.regionId === filterRegion);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>QR Codes</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>
            One unique QR per branch. Parents scan to open the PTM form.
          </p>
        </div>
        <button className="btn-primary" onClick={loadAll}>📱 Generate All QRs</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterRegion('all')} style={{
          padding: '6px 14px', borderRadius: '20px', border: '1.5px solid var(--border)', cursor: 'pointer',
          background: filterRegion === 'all' ? 'var(--brand)' : 'white',
          color: filterRegion === 'all' ? 'white' : 'var(--mid)', fontWeight: '500', fontSize: '13px'
        }}>All</button>
        {(store.regions || []).map(r => (
          <button key={r.id} onClick={() => setFilterRegion(r.id)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1.5px solid var(--border)', cursor: 'pointer',
            background: filterRegion === r.id ? 'var(--brand)' : 'white',
            color: filterRegion === r.id ? 'white' : 'var(--mid)', fontWeight: '500', fontSize: '13px'
          }}>{r.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filtered.map(branch => {
          const region = (store.regions || []).find(r => r.id === branch.regionId);
          const qr = qrData[branch.id];
          return (
            <div key={branch.id} className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{branch.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: '600', marginBottom: '16px' }}>
                {region?.name}
              </div>

              {qr ? (
                <>
                  <img src={qr.qr} alt="QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px' }} />
                  <div style={{
                    background: 'var(--light)', borderRadius: '8px', padding: '8px',
                    fontSize: '11px', color: 'var(--mid)', wordBreak: 'break-all',
                    margin: '12px 0', fontFamily: 'monospace'
                  }}>{qr.url}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={() => downloadQR(branch.id)} style={{ fontSize: '13px', padding: '8px 14px' }}>
                      ⬇️ Download PNG
                    </button>
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(qr.url)} style={{ fontSize: '13px', padding: '8px 14px' }}>
                      📋 Copy URL
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px 0' }}>
                  {loading[branch.id] ? (
                    <div style={{ color: 'var(--mid)', fontSize: '14px' }}>
                      <span className="spin" style={{
                        width: '24px', height: '24px', border: '3px solid var(--border)',
                        borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block'
                      }} />
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={() => loadQR(branch.id)}>
                      Generate QR
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────
function SettingsTab({ store, onSave }) {
  const [sheetUrl, setSheetUrl] = useState(store.settings?.sheetUrl || '');
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_BASE_URL || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const extractId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleSave = async () => {
    const sheetId = extractId(sheetUrl);
    if (!sheetId) return alert('Invalid Google Sheet URL. Please check and try again.');
    setSaving(true);
    await onSave({
      ...store,
      settings: { sheetUrl, sheetId }
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sheetId = extractId(sheetUrl);

  return (
    <div className="fade-in" style={{ maxWidth: '700px' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Settings</h2>
      <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '32px' }}>
        Configure Google Sheets and deployment settings.
      </p>

      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Google Sheet Configuration
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">Google Sheet URL</label>
          <input
            className="input"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
          />
          {sheetId && (
            <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '6px' }}>
              ✅ Sheet ID detected: <code>{sheetId}</code>
            </p>
          )}
          {sheetUrl && !sheetId && (
            <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}>
              ❌ Could not extract Sheet ID from this URL.
            </p>
          )}
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
        </button>
      </div>

      {/* Instructions */}
      <div className="card" style={{ padding: '28px', background: '#fffbf0', border: '1.5px solid #fde68a' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>⚙️ Google Sheets API Setup (One-time)</h3>
        <ol style={{ paddingLeft: '20px', color: 'var(--mid)', fontSize: '14px', lineHeight: '2' }}>
          <li>Go to <a href="https://console.cloud.google.com" target="_blank" style={{ color: 'var(--brand)' }}>console.cloud.google.com</a></li>
          <li>Create a new project → Enable <strong>Google Sheets API</strong></li>
          <li>Create a <strong>Service Account</strong> → Download JSON key</li>
          <li>Share your Google Sheet with the service account email</li>
          <li>Set environment variables on Vercel:<br />
            <code style={{ background: 'var(--light)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_SHEETS_EMAIL</code> and{' '}
            <code style={{ background: 'var(--light)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_SHEETS_KEY</code>
          </li>
        </ol>
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--brand-light)', borderRadius: '8px', fontSize: '13px' }}>
          <strong>💡 Note:</strong> Without Google Sheets credentials, form submissions will be logged to server console.
          The system will work end-to-end once env vars are set.
        </div>
      </div>

      {/* Column Structure */}
      <div className="card" style={{ padding: '28px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>📋 Sheet Column Structure</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--dark)' }}>
                {['Col', 'Header', 'Example'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', color: 'white', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['A', 'Timestamp', '22/03/2025, 10:30:00'],
                ['B', 'PSID', 'PS12345'],
                ['C', 'Stream', 'Medical'],
                ['D', 'Mode', 'Branch (In-person)'],
                ['E', 'Region', 'Central'],
                ['F', 'Branch', 'Lucknow - Gomti Nagar'],
                ['G', 'Overall Experience', 'Very Satisfied'],
                ['H', 'Physics', 'Satisfied'],
                ['I', 'Chemistry', 'Very Satisfied'],
                ['J', 'Mathematics', 'Neutral'],
                ['K', 'Biology', 'Satisfied'],
                ['L', 'English', 'Satisfied'],
                ['M', 'Social Science', 'Neutral'],
                ['N', 'MAT', 'Satisfied'],
                ['O', 'Branch Facilities', 'Very Satisfied'],
                ['P', 'Comments', 'Great experience overall...'],
              ].map(([col, header, ex]) => (
                <tr key={col} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--brand)' }}>{col}</td>
                  <td style={{ padding: '8px 12px', fontWeight: '600' }}>{header}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--mid)' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const token = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Regions');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchStore();
  }, [token]);

  const fetchStore = async () => {
    try {
      const res = await fetch('/api/admin/store', {
        headers: { 'x-admin-token': token }
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setStore(data);
    } catch (e) {}
    setLoading(false);
  };

  const handleSave = async (newStore) => {
    setStore(newStore);
    try {
      await fetch('/api/admin/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(newStore)
      });
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; max-age=0';
    router.push('/admin/login');
  };

  if (!token || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{
            width: '40px', height: '40px', border: '4px solid var(--border)',
            borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block'
          }} />
          <p style={{ marginTop: '16px', color: 'var(--mid)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'Regions' && <RegionsTab store={store} onSave={handleSave} />}
      {activeTab === 'Branches' && <BranchesTab store={store} onSave={handleSave} />}
      {activeTab === 'QR Codes' && <QRCodesTab store={store} />}
      {activeTab === 'Settings' && <SettingsTab store={store} onSave={handleSave} />}
    </AdminLayout>
  );
}
