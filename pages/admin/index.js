// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TABS = ['Regions', 'Branches', 'QR Codes', 'Form Builder', 'Settings'];

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
      <nav style={{
        background: 'var(--dark)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🎓</span>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>PTM Admin</span>
          <span style={{
            background: 'var(--brand)', color: 'white', fontSize: '10px',
            padding: '2px 8px', borderRadius: '20px', fontWeight: '600'
          }}>AAKASH</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'var(--brand)' : 'transparent',
              color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.6)',
              border: 'none', padding: '8px 14px', borderRadius: '8px',
              fontWeight: '500', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
            }}>{tab}</button>
          ))}
        </div>
        <button onClick={onLogout} style={{
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
        }}>Logout</button>
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

  const addRegion = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const updated = [...regions, { id, name: newName.trim() }];
    setRegions(updated); setNewName(''); save(updated, store.branches);
  };

  const deleteRegion = (id) => {
    if (!confirm('Delete this region? Branches mapped to it will become unmapped.')) return;
    const updated = regions.filter(r => r.id !== id);
    setRegions(updated); save(updated, store.branches);
  };

  const saveEdit = () => {
    const updated = regions.map(r => r.id === editId ? { ...r, name: editName } : r);
    setRegions(updated); setEditId(null); save(updated, store.branches);
  };

  const save = async (regs, branches) => {
    setSaving(true); await onSave({ ...store, regions: regs, branches }); setSaving(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>Regions</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>{regions.length} regions configured</p>
        </div>
        {saving && <span style={{ color: 'var(--brand)', fontSize: '13px' }}>💾 Saving...</span>}
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <label className="label">Add New Region</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input className="input" placeholder="e.g. South West" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRegion()} />
          <button className="btn-primary" onClick={addRegion} style={{ whiteSpace: 'nowrap' }}>+ Add Region</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        {regions.map(region => {
          const branchCount = (store.branches || []).filter(b => b.regionId === region.id).length;
          return (
            <div key={region.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🗺️</div>
              <div style={{ flex: 1 }}>
                {editId === region.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input className="input" value={editName} onChange={e => setEditName(e.target.value)}
                      style={{ maxWidth: '250px' }} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                    <button className="btn-primary" onClick={saveEdit} style={{ padding: '8px 16px' }}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditId(null)} style={{ padding: '8px 16px' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{region.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--mid)' }}>ID: {region.id} · {branchCount} branch{branchCount !== 1 ? 'es' : ''}</div>
                  </>
                )}
              </div>
              {editId !== region.id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => { setEditId(region.id); setEditName(region.name); }} style={{ padding: '8px 14px', fontSize: '13px' }}>✏️ Edit</button>
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

  const addBranch = () => {
    if (!newName.trim() || !newRegionId) return alert('Please enter branch name and select a region.');
    const id = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const updated = [...branches, { id, name: newName.trim(), regionId: newRegionId }];
    setBranches(updated); setNewName(''); setNewRegionId(''); save(updated);
  };

  const deleteBranch = (id) => {
    if (!confirm('Delete this branch?')) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated); save(updated);
  };

  const saveEdit = () => {
    const updated = branches.map(b => b.id === editId ? { ...b, ...editData } : b);
    setBranches(updated); setEditId(null); save(updated);
  };

  const save = async (list) => {
    setSaving(true); await onSave({ ...store, branches: list }); setSaving(false);
  };

  const filtered = filterRegion === 'all' ? branches : branches.filter(b => b.regionId === filterRegion);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>Branches</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>{branches.length} branches across {store.regions?.length} regions</p>
        </div>
        {saving && <span style={{ color: 'var(--brand)', fontSize: '13px' }}>💾 Saving...</span>}
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <label className="label">Add New Branch</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input className="input" placeholder="Branch name e.g. Delhi - Dwarka" value={newName}
            onChange={e => setNewName(e.target.value)} style={{ flex: '1', minWidth: '200px' }} />
          <select className="input" value={newRegionId} onChange={e => setNewRegionId(e.target.value)} style={{ flex: '0 0 180px' }}>
            <option value="">Select Region</option>
            {(store.regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="btn-primary" onClick={addBranch} style={{ whiteSpace: 'nowrap' }}>+ Add Branch</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[{ id: 'all', name: `All (${branches.length})` }, ...(store.regions || []).map(r => ({ ...r, name: `${r.name} (${branches.filter(b => b.regionId === r.id).length})` }))].map(r => (
          <button key={r.id} onClick={() => setFilterRegion(r.id)} style={{
            padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
            background: filterRegion === r.id ? 'var(--brand)' : 'white',
            color: filterRegion === r.id ? 'white' : 'var(--mid)',
            fontWeight: '500', fontSize: '13px', border: '1.5px solid var(--border)'
          }}>{r.name}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {filtered.map(branch => {
          const region = (store.regions || []).find(r => r.id === branch.regionId);
          return (
            <div key={branch.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🏢</div>
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
                    <div style={{ fontSize: '12px', color: 'var(--mid)' }}>Region: <span style={{ color: 'var(--brand)', fontWeight: '600' }}>{region?.name || 'Unmapped'}</span></div>
                  </>
                )}
              </div>
              {editId !== branch.id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => { setEditId(branch.id); setEditData({ name: branch.name, regionId: branch.regionId }); }} style={{ padding: '7px 12px', fontSize: '12px' }}>✏️ Edit</button>
                  <button className="btn-danger" onClick={() => deleteBranch(branch.id)}>🗑️</button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--mid)' }}>No branches found.</div>}
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
      const res = await fetch(`/api/qr/generate?branchId=${branchId}`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      setQrData(q => ({ ...q, [branchId]: data }));
    } catch (e) {}
    setLoading(l => ({ ...l, [branchId]: false }));
  };

  const downloadQR = (branchId) => window.open(`/api/qr/generate?branchId=${branchId}&format=png`, '_blank');
  const loadAll = async () => {
    const list = filterRegion === 'all' ? store.branches : store.branches.filter(b => b.regionId === filterRegion);
    for (const branch of list) await loadQR(branch.id);
  };

  const filtered = filterRegion === 'all' ? store.branches : store.branches.filter(b => b.regionId === filterRegion);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>QR Codes</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>One unique QR per branch. Parents scan to open the PTM form.</p>
        </div>
        <button className="btn-primary" onClick={loadAll}>📱 Generate All QRs</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ id: 'all', name: 'All' }, ...(store.regions || [])].map(r => (
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
              <div style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: '600', marginBottom: '16px' }}>{region?.name}</div>
              {qr ? (
                <>
                  <img src={qr.qr} alt="QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px' }} />
                  <div style={{ background: 'var(--light)', borderRadius: '8px', padding: '8px', fontSize: '11px', color: 'var(--mid)', wordBreak: 'break-all', margin: '12px 0', fontFamily: 'monospace' }}>{qr.url}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={() => downloadQR(branch.id)} style={{ fontSize: '13px', padding: '8px 14px' }}>⬇️ Download PNG</button>
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(qr.url)} style={{ fontSize: '13px', padding: '8px 14px' }}>📋 Copy URL</button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px 0' }}>
                  {loading[branch.id]
                    ? <div className="spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block' }} />
                    : <button className="btn-primary" onClick={() => loadQR(branch.id)}>Generate QR</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FORM BUILDER TAB ────────────────────────────────────────────────────────
const DEFAULT_FORM_CONFIG = {
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

function FormBuilderTab({ store, onSave }) {
  const cfg = store.formConfig || DEFAULT_FORM_CONFIG;
  const [config, setConfig] = useState(cfg);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newStream, setNewStream] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMode, setNewMode] = useState('');
  const [activeSection, setActiveSection] = useState('general');

  const update = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...store, formConfig: config });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addStream = () => {
    if (!newStream.trim()) return;
    update('streams', [...config.streams, newStream.trim()]); setNewStream('');
  };
  const removeStream = (s) => update('streams', config.streams.filter(x => x !== s));

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const id = newSubject.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now();
    update('subjects', [...config.subjects, { id, label: newSubject.trim(), enabled: true }]); setNewSubject('');
  };
  const toggleSubject = (id) => update('subjects', config.subjects.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const removeSubject = (id) => update('subjects', config.subjects.filter(s => s.id !== id));
  const renameSubject = (id, label) => update('subjects', config.subjects.map(s => s.id === id ? { ...s, label } : s));

  const addMode = () => {
    if (!newMode.trim()) return;
    update('modes', [...config.modes, newMode.trim()]); setNewMode('');
  };

  const sections = [
    { id: 'general', label: '⚙️ General' },
    { id: 'streams', label: '📚 Streams' },
    { id: 'modes', label: '📍 PTM Modes' },
    { id: 'subjects', label: '🔬 Subjects' },
    { id: 'ratings', label: '⭐ Ratings' },
    { id: 'comments', label: '💬 Comments' },
  ];

  const Toggle = ({ value, onChange }) => (
    <button onClick={onChange} style={{
      width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
      background: value ? 'var(--brand)' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <span style={{
        position: 'absolute', top: '3px', left: value ? '24px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s'
      }} />
    </button>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px' }}>Form Builder</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginTop: '4px' }}>Customise the parent-facing PTM form — no code changes needed.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '600' }}>✅ Saved!</span>}
          {saving && <span style={{ color: 'var(--brand)', fontSize: '13px' }}>💾 Saving...</span>}
          <a href="/ptm?region=Central&branch=Demo+Branch&branchId=demo" target="_blank" className="btn-secondary" style={{ fontSize: '13px' }}>👁️ Preview Form</a>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>💾 Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: '8px' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '8px',
              background: activeSection === s.id ? 'var(--brand-light)' : 'transparent',
              color: activeSection === s.id ? 'var(--brand)' : 'var(--mid)',
              fontWeight: activeSection === s.id ? '600' : '400',
              border: 'none', cursor: 'pointer', fontSize: '14px', display: 'block', marginBottom: '2px'
            }}>{s.label}</button>
          ))}
        </div>

        {/* Panel */}
        <div>
          {/* GENERAL */}
          {activeSection === 'general' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>⚙️ General Settings</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label className="label">Institute Name</label>
                  <input className="input" value={config.instituteName} onChange={e => update('instituteName', e.target.value)} />
                </div>
                <div>
                  <label className="label">Form Subtitle</label>
                  <input className="input" value={config.formTitle} onChange={e => update('formTitle', e.target.value)} />
                </div>
                <div>
                  <label className="label">PSID Field Label</label>
                  <input className="input" value={config.psidLabel} onChange={e => update('psidLabel', e.target.value)} />
                </div>
                <div>
                  <label className="label">PSID Helper Text</label>
                  <textarea className="input" rows={2} value={config.psidHint} onChange={e => update('psidHint', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* STREAMS */}
          {activeSection === 'streams' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>📚 Student Streams</h3>
              <p style={{ color: 'var(--mid)', fontSize: '13px', marginBottom: '20px' }}>These appear as selection buttons on the form.</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input className="input" placeholder="e.g. Commerce" value={newStream}
                  onChange={e => setNewStream(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStream()} />
                <button className="btn-primary" onClick={addStream} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {config.streams.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--brand-light)', border: '1.5px solid var(--brand)', borderRadius: '24px', padding: '8px 14px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--brand)', fontSize: '14px' }}>{s}</span>
                    <button onClick={() => removeStream(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '18px', lineHeight: '1', padding: '0' }}>×</button>
                  </div>
                ))}
              </div>
              {config.streams.length === 0 && <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '12px' }}>⚠️ At least one stream is required.</p>}
            </div>
          )}

          {/* MODES */}
          {activeSection === 'modes' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>📍 PTM Mode Options</h3>
              <p style={{ color: 'var(--mid)', fontSize: '13px', marginBottom: '20px' }}>How did the parent attend the PTM?</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input className="input" placeholder="e.g. Hybrid" value={newMode}
                  onChange={e => setNewMode(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMode()} />
                <button className="btn-primary" onClick={addMode} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {config.modes.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '24px', padding: '8px 14px' }}>
                    <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>{m}</span>
                    <button onClick={() => update('modes', config.modes.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', fontSize: '18px', lineHeight: '1', padding: '0' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBJECTS */}
          {activeSection === 'subjects' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>🔬 Subject-wise Feedback</h3>
              <p style={{ color: 'var(--mid)', fontSize: '13px', marginBottom: '20px' }}>Toggle, rename, reorder, or add subjects. Disabled ones won't appear on the form.</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input className="input" placeholder="e.g. Hindi" value={newSubject}
                  onChange={e => setNewSubject(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject()} />
                <button className="btn-primary" onClick={addSubject} style={{ whiteSpace: 'nowrap' }}>+ Add Subject</button>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {config.subjects.map(subject => (
                  <div key={subject.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '10px', border: `1.5px solid ${subject.enabled ? 'var(--border)' : '#e5e7eb'}`,
                    background: subject.enabled ? 'white' : '#f9fafb', opacity: subject.enabled ? 1 : 0.65
                  }}>
                    <Toggle value={subject.enabled} onChange={() => toggleSubject(subject.id)} />
                    <input value={subject.label} onChange={e => renameSubject(subject.id, e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: '600', fontSize: '15px', color: 'var(--dark)', outline: 'none' }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: subject.enabled ? '#dcfce7' : '#f3f4f6', color: subject.enabled ? '#16a34a' : '#9ca3af' }}>
                      {subject.enabled ? 'ON' : 'OFF'}
                    </span>
                    <button className="btn-danger" onClick={() => removeSubject(subject.id)} style={{ padding: '6px 10px' }}>🗑️</button>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '12px' }}>💡 Click the name to rename inline. Toggle to show/hide on form.</p>
            </div>
          )}

          {/* RATINGS */}
          {activeSection === 'ratings' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { key: 'overallRatings', title: '⭐ Overall Experience & Branch Facilities Scale', desc: 'Used for Overall Experience and Branch Facilities questions.' },
                { key: 'subjectRatings', title: '🔬 Subject Rating Scale', desc: 'Used for each subject row (kept compact for mobile).' }
              ].map(({ key, title, desc }) => (
                <div key={key} className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{title}</h3>
                  <p style={{ color: 'var(--mid)', fontSize: '13px', marginBottom: '16px' }}>{desc}</p>
                  {config[key].map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--mid)', fontSize: '13px', width: '20px', flexShrink: 0 }}>{i + 1}.</span>
                      <input className="input" value={r} onChange={e => {
                        const arr = [...config[key]]; arr[i] = e.target.value; update(key, arr);
                      }} style={{ flex: 1 }} />
                      <button className="btn-danger" onClick={() => update(key, config[key].filter((_, j) => j !== i))} style={{ padding: '8px 12px' }}>×</button>
                    </div>
                  ))}
                  <button className="btn-secondary" onClick={() => update(key, [...config[key], 'New Option'])} style={{ marginTop: '8px' }}>+ Add Option</button>
                </div>
              ))}
            </div>
          )}

          {/* COMMENTS */}
          {activeSection === 'comments' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>💬 Comments / Suggestions Field</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Toggle value={config.showComments} onChange={() => update('showComments', !config.showComments)} />
                <div>
                  <div style={{ fontWeight: '600' }}>Show comments field on form</div>
                  <div style={{ fontSize: '12px', color: 'var(--mid)' }}>Parents can optionally leave text feedback</div>
                </div>
                <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: config.showComments ? '#dcfce7' : '#f3f4f6', color: config.showComments ? '#16a34a' : '#9ca3af' }}>
                  {config.showComments ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              {config.showComments && (
                <div>
                  <label className="label">Field Label</label>
                  <input className="input" value={config.commentsLabel} onChange={e => update('commentsLabel', e.target.value)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────
function SettingsTab({ store, onSave }) {
  const [sheetUrl, setSheetUrl] = useState(store.settings?.sheetUrl || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const extractId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleSave = async () => {
    const sheetId = extractId(sheetUrl);
    if (!sheetId) return alert('Invalid Google Sheet URL.');
    setSaving(true);
    await onSave({ ...store, settings: { sheetUrl, sheetId } });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sheetId = extractId(sheetUrl);

  return (
    <div className="fade-in" style={{ maxWidth: '700px' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Settings</h2>
      <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '32px' }}>Configure Google Sheets integration.</p>

      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>📊 Google Sheet Configuration</h3>
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Google Sheet URL</label>
          <input className="input" placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
          {sheetId && <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '6px' }}>✅ Sheet ID: <code>{sheetId}</code></p>}
          {sheetUrl && !sheetId && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}>❌ Could not extract Sheet ID from this URL.</p>}
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
        </button>
      </div>

      <div className="card" style={{ padding: '28px', background: '#fffbf0', border: '1.5px solid #fde68a' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>⚙️ Google Sheets API Setup</h3>
        <ol style={{ paddingLeft: '20px', color: 'var(--mid)', fontSize: '14px', lineHeight: '2.2' }}>
          <li>Go to <a href="https://console.cloud.google.com" target="_blank" style={{ color: 'var(--brand)' }}>console.cloud.google.com</a> → New Project</li>
          <li>Enable <strong>Google Sheets API</strong></li>
          <li>Create a <strong>Service Account</strong> → Download JSON key</li>
          <li>Share your Sheet with the service account email as <strong>Editor</strong></li>
          <li>Add <code style={{ background: 'white', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_SHEETS_EMAIL</code> and <code style={{ background: 'white', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_SHEETS_KEY</code> on Vercel</li>
        </ol>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const token = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Regions');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/store', { headers: { 'x-admin-token': token } })
      .then(res => { if (res.status === 401) { router.push('/admin/login'); return null; } return res.json(); })
      .then(data => { if (data) setStore(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (newStore) => {
    setStore(newStore);
    await fetch('/api/admin/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(newStore)
    });
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
          <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', display: 'inline-block' }} />
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
      {activeTab === 'Form Builder' && <FormBuilderTab store={store} onSave={handleSave} />}
      {activeTab === 'Settings' && <SettingsTab store={store} onSave={handleSave} />}
    </AdminLayout>
  );
}
