// pages/ptm.js — reads form config set in Admin → Form Builder
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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

const RATING_COLORS = {
  'Very Satisfied': '#16a34a',
  'Satisfied': '#65a30d',
  'Neutral': '#d97706',
  'Not Satisfied': '#ea580c',
  'Very Dissatisfied': '#dc2626',
  'Not Satisfied ': '#ea580c',
};

function getColor(val) {
  return RATING_COLORS[val] || 'var(--brand)';
}

function RatingPill({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const selected = value === opt;
        const color = getColor(opt);
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            padding: '8px 14px', borderRadius: '24px',
            border: `2px solid ${selected ? color : 'var(--border)'}`,
            background: selected ? color : 'white',
            color: selected ? 'white' : 'var(--mid)',
            fontWeight: selected ? '600' : '400', fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function SubjectRow({ subject, value, onChange, options }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--dark)' }}>{subject.label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map(opt => {
          const selected = value === opt;
          const color = getColor(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(opt)} style={{
              padding: '6px 12px', borderRadius: '20px',
              border: `1.5px solid ${selected ? color : 'var(--border)'}`,
              background: selected ? color : 'white',
              color: selected ? 'white' : 'var(--mid)',
              fontWeight: selected ? '600' : '400', fontSize: '12px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ number, title, color = '#1a1a2e' }) {
  return (
    <div style={{ padding: '12px 16px', background: color, borderRadius: '10px', marginBottom: '16px', marginTop: '20px' }}>
      <span style={{ color: 'white', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Section {number} — {title}
      </span>
    </div>
  );
}

export default function PTMForm() {
  const router = useRouter();
  const { region, branch, branchId } = router.query;

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);

  const [form, setForm] = useState({
    psid: '', stream: '', mode: '', overallExperience: '',
    subjects: {}, branchFacilities: '', comments: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load form config from API
  useEffect(() => {
    fetch('/api/form-config')
      .then(r => r.json())
      .then(data => { setConfig(data); setConfigLoaded(true); })
      .catch(() => setConfigLoaded(true));
  }, []);

  const activeSubjects = config.subjects.filter(s => s.enabled);

  const validate = () => {
    const e = {};
    if (!form.psid.trim()) e.psid = 'PSID is required';
    else if (form.psid.trim().length < 3) e.psid = 'Please enter a valid PSID';
    if (!form.stream) e.stream = 'Please select a stream';
    if (!form.mode) e.mode = 'Please select mode of PTM';
    if (!form.overallExperience) e.overallExperience = 'Please rate your overall experience';
    if (!form.branchFacilities) e.branchFacilities = 'Please rate branch facilities';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      const el = document.querySelector('[data-has-error="true"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true); setSubmitError('');

    // Build subject payload dynamically from config
    const subjectPayload = {};
    activeSubjects.forEach(s => { subjectPayload[s.id] = form.subjects[s.id] || ''; });

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psid: form.psid, stream: form.stream, mode: form.mode,
          region: region || 'Unknown', branch: branch || 'Unknown', branchId: branchId || '',
          overallExperience: form.overallExperience,
          // Map dynamic subjects to fixed column names for sheet compatibility
          physics: form.subjects['physics'] || form.subjects['physics_' + Date.now()] || '',
          chemistry: form.subjects['chemistry'] || '',
          mathematics: form.subjects['mathematics'] || '',
          biology: form.subjects['biology'] || '',
          english: form.subjects['english'] || '',
          socialScience: form.subjects['socialScience'] || '',
          mat: form.subjects['mat'] || '',
          // Extra subjects stored in comments if needed
          extraSubjects: JSON.stringify(subjectPayload),
          branchFacilities: form.branchFacilities,
          comments: form.comments
        })
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setSubmitError(data.error || 'Submission failed. Please try again.');
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    }
    setSubmitting(false);
  };

  // Success screen
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '36px',
            boxShadow: '0 8px 32px rgba(22,163,74,0.4)'
          }}>✓</div>
          <h1 style={{ color: 'white', fontSize: '26px', marginBottom: '12px' }}>Thank You!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', marginBottom: '8px' }}>
            Your feedback has been submitted successfully.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
            We appreciate you sharing your experience at{' '}
            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{branch}</strong>.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              🎓 {config.instituteName} — PTM 2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!configLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spin" style={{ width: '36px', height: '36px', border: '4px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '20px 20px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>🎓</span>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>{config.instituteName}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{config.formTitle}</div>
            </div>
          </div>
          {branch && (
            <div style={{ background: 'rgba(232,71,10,0.2)', border: '1px solid rgba(232,71,10,0.4)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{branch}</div>
                {region && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{region} Region</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 48px' }}>

        {/* Section 1: Basic Details */}
        <SectionHeader number={1} title="Basic Details" color="var(--brand)" />

        {/* PSID */}
        <div className="card" style={{ padding: '20px', marginBottom: '12px' }} data-has-error={!!errors.psid}>
          <label className="label">{config.psidLabel} <span style={{ color: 'var(--error)' }}>*</span></label>
          <input className={`input ${errors.psid ? 'error' : ''}`} placeholder="Enter PS ID (e.g. PS12345)"
            value={form.psid} onChange={e => { setForm({ ...form, psid: e.target.value }); setErrors({ ...errors, psid: '' }); }} />
          {errors.psid && <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px' }}>{errors.psid}</p>}
          {config.psidHint && <p style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '8px' }}>ℹ️ {config.psidHint}</p>}
        </div>

        {/* Stream */}
        <div className="card" style={{ padding: '20px', marginBottom: '12px' }} data-has-error={!!errors.stream}>
          <label className="label">Student Stream <span style={{ color: 'var(--error)' }}>*</span></label>
          {errors.stream && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.stream}</p>}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {config.streams.map(s => (
              <button key={s} type="button" onClick={() => { setForm({ ...form, stream: s }); setErrors({ ...errors, stream: '' }); }} style={{
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                border: `2px solid ${form.stream === s ? 'var(--brand)' : 'var(--border)'}`,
                background: form.stream === s ? 'var(--brand)' : 'white',
                color: form.stream === s ? 'white' : 'var(--dark)',
                fontWeight: '600', fontSize: '14px', transition: 'all 0.15s'
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="card" style={{ padding: '20px' }} data-has-error={!!errors.mode}>
          <label className="label">Mode of PTM Attended <span style={{ color: 'var(--error)' }}>*</span></label>
          {errors.mode && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.mode}</p>}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {config.modes.map(m => (
              <button key={m} type="button" onClick={() => { setForm({ ...form, mode: m }); setErrors({ ...errors, mode: '' }); }} style={{
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                border: `2px solid ${form.mode === m ? 'var(--brand)' : 'var(--border)'}`,
                background: form.mode === m ? 'var(--brand)' : 'white',
                color: form.mode === m ? 'white' : 'var(--dark)',
                fontWeight: '600', fontSize: '14px', transition: 'all 0.15s'
              }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Section 2: Overall Experience */}
        <SectionHeader number={2} title="Overall Experience" />
        <div className="card" style={{ padding: '20px' }} data-has-error={!!errors.overallExperience}>
          <label className="label">How was your overall PTM experience? <span style={{ color: 'var(--error)' }}>*</span></label>
          {errors.overallExperience && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.overallExperience}</p>}
          <RatingPill options={config.overallRatings} value={form.overallExperience}
            onChange={v => { setForm({ ...form, overallExperience: v }); setErrors({ ...errors, overallExperience: '' }); }} />
        </div>

        {/* Section 3: Subject Feedback */}
        {activeSubjects.length > 0 && (
          <>
            <SectionHeader number={3} title="Subject-wise Feedback" />
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
                <span style={{ fontSize: '13px', color: 'var(--mid)' }}>Rate your experience for each subject (optional but recommended)</span>
              </div>
              {activeSubjects.map(subject => (
                <SubjectRow key={subject.id} subject={subject}
                  value={form.subjects[subject.id] || ''}
                  onChange={v => setForm({ ...form, subjects: { ...form.subjects, [subject.id]: v } })}
                  options={config.subjectRatings} />
              ))}
            </div>
          </>
        )}

        {/* Section 4: Branch Experience */}
        <SectionHeader number={activeSubjects.length > 0 ? 4 : 3} title="Branch Experience" />
        <div className="card" style={{ padding: '20px' }} data-has-error={!!errors.branchFacilities}>
          <label className="label">How would you rate branch facilities/services? <span style={{ color: 'var(--error)' }}>*</span></label>
          {errors.branchFacilities && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.branchFacilities}</p>}
          <RatingPill options={config.overallRatings} value={form.branchFacilities}
            onChange={v => { setForm({ ...form, branchFacilities: v }); setErrors({ ...errors, branchFacilities: '' }); }} />
        </div>

        {/* Section 5: Comments */}
        {config.showComments && (
          <>
            <SectionHeader number={activeSubjects.length > 0 ? 5 : 4} title="Detailed Feedback (Optional)" />
            <div className="card" style={{ padding: '20px' }}>
              <label className="label">{config.commentsLabel}</label>
              <textarea className="input" placeholder="Share your thoughts, suggestions, or concerns..."
                rows={4} value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
          </>
        )}

        {/* Error */}
        {submitError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', marginTop: '20px', color: 'var(--error)', fontSize: '14px' }}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="btn-primary" disabled={submitting} style={{
          width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px',
          borderRadius: '12px', marginTop: '24px', boxShadow: '0 4px 16px rgba(232,71,10,0.35)'
        }}>
          {submitting ? (
            <>
              <span className="spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              Submitting...
            </>
          ) : '✓ Submit Feedback'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--mid)', fontSize: '12px', marginTop: '16px' }}>
          Your feedback is confidential and will help us improve.
        </p>
      </form>
    </div>
  );
}
