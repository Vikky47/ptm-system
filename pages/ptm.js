// pages/ptm.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const RATINGS = ['Very Satisfied', 'Satisfied', 'Neutral', 'Not Satisfied', 'Very Dissatisfied'];
const RATING_COLORS = {
  'Very Satisfied': '#16a34a',
  'Satisfied': '#65a30d',
  'Neutral': '#d97706',
  'Not Satisfied': '#ea580c',
  'Very Dissatisfied': '#dc2626',
};

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Science', 'MAT'];

function RatingPill({ options, value, onChange, name }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '8px 14px',
              borderRadius: '24px',
              border: `2px solid ${selected ? RATING_COLORS[opt] || 'var(--brand)' : 'var(--border)'}`,
              background: selected ? RATING_COLORS[opt] || 'var(--brand)' : 'white',
              color: selected ? 'white' : 'var(--mid)',
              fontWeight: selected ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >{opt}</button>
        );
      })}
    </div>
  );
}

function SubjectRow({ subject, value, onChange }) {
  const COMPACT = ['Very Satisfied', 'Satisfied', 'Neutral', 'Not Satisfied'];
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '10px'
    }}>
      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--dark)' }}>{subject}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {COMPACT.map(opt => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1.5px solid ${selected ? RATING_COLORS[opt] : 'var(--border)'}`,
                background: selected ? RATING_COLORS[opt] : 'white',
                color: selected ? 'white' : 'var(--mid)',
                fontWeight: selected ? '600' : '400',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function PTMForm() {
  const router = useRouter();
  const { region, branch, branchId } = router.query;

  const [form, setForm] = useState({
    psid: '',
    stream: '',
    mode: '',
    overallExperience: '',
    subjects: {},
    branchFacilities: '',
    comments: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.psid.trim()) e.psid = 'PSID is required';
    if (form.psid.trim().length > 0 && form.psid.trim().length < 3) e.psid = 'Please enter a valid PSID';
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
      const firstError = document.querySelector('[data-error]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psid: form.psid,
          stream: form.stream,
          mode: form.mode,
          region: region || 'Unknown',
          branch: branch || 'Unknown',
          branchId: branchId || '',
          overallExperience: form.overallExperience,
          physics: form.subjects['Physics'] || '',
          chemistry: form.subjects['Chemistry'] || '',
          mathematics: form.subjects['Mathematics'] || '',
          biology: form.subjects['Biology'] || '',
          english: form.subjects['English'] || '',
          socialScience: form.subjects['Social Science'] || '',
          mat: form.subjects['MAT'] || '',
          branchFacilities: form.branchFacilities,
          comments: form.comments
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error. Please check your connection and try again.');
    }
    setSubmitting(false);
  };

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
          <h1 style={{ color: 'white', fontSize: '26px', marginBottom: '12px' }}>
            Thank You!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', marginBottom: '8px' }}>
            Your feedback has been submitted successfully.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
            We appreciate you taking the time to share your experience at <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{branch}</strong>.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
            padding: '16px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              🎓 Aakash Institute — PTM 2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--dark)',
        padding: '20px 20px 24px',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>🎓</span>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Aakash Institute</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>PTM Attendance & Feedback — 2025</div>
            </div>
          </div>
          {branch && (
            <div style={{
              background: 'rgba(232,71,10,0.2)', border: '1px solid rgba(232,71,10,0.4)',
              borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{branch}</div>
                {region && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{region} Region</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Section 1: Basic Details */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: 'var(--brand)', borderRadius: '10px',
            marginBottom: '16px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section 1 — Basic Details
            </span>
          </div>

          {/* PSID */}
          <div className="card" style={{ padding: '20px', marginBottom: '12px' }} data-error={errors.psid ? 'true' : undefined}>
            <label className="label">
              Student PSID <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              className={`input ${errors.psid ? 'error' : ''}`}
              placeholder="Enter PS ID (e.g. PS12345)"
              value={form.psid}
              onChange={e => { setForm({ ...form, psid: e.target.value }); setErrors({ ...errors, psid: '' }); }}
            />
            {errors.psid && <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px' }}>{errors.psid}</p>}
            <p style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '8px' }}>
              ℹ️ PS ID is the unique number assigned to your ward. Check with branch staff if unavailable.
            </p>
          </div>

          {/* Stream */}
          <div className="card" style={{ padding: '20px', marginBottom: '12px' }} data-error={errors.stream ? 'true' : undefined}>
            <label className="label">
              Student Stream <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            {errors.stream && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.stream}</p>}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Medical', 'Engineering', 'Foundation'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setForm({ ...form, stream: s }); setErrors({ ...errors, stream: '' }); }}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${form.stream === s ? 'var(--brand)' : 'var(--border)'}`,
                    background: form.stream === s ? 'var(--brand)' : 'white',
                    color: form.stream === s ? 'white' : 'var(--dark)',
                    fontWeight: '600', fontSize: '14px', transition: 'all 0.15s'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="card" style={{ padding: '20px' }} data-error={errors.mode ? 'true' : undefined}>
            <label className="label">
              Mode of PTM Attended <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            {errors.mode && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.mode}</p>}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Branch (In-person)', 'Virtual'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setForm({ ...form, mode: m }); setErrors({ ...errors, mode: '' }); }}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${form.mode === m ? 'var(--brand)' : 'var(--border)'}`,
                    background: form.mode === m ? 'var(--brand)' : 'white',
                    color: form.mode === m ? 'white' : 'var(--dark)',
                    fontWeight: '600', fontSize: '14px', transition: 'all 0.15s'
                  }}
                >{m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Overall Experience */}
        <div style={{ marginTop: '20px', marginBottom: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: '#1a1a2e', borderRadius: '10px', marginBottom: '16px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section 2 — Overall Experience
            </span>
          </div>
          <div className="card" style={{ padding: '20px' }} data-error={errors.overallExperience ? 'true' : undefined}>
            <label className="label">
              How was your overall PTM experience? <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            {errors.overallExperience && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.overallExperience}</p>}
            <RatingPill
              options={RATINGS}
              value={form.overallExperience}
              onChange={v => { setForm({ ...form, overallExperience: v }); setErrors({ ...errors, overallExperience: '' }); }}
            />
          </div>
        </div>

        {/* Section 3: Subject-wise Feedback */}
        <div style={{ marginTop: '20px', marginBottom: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: '#1a1a2e', borderRadius: '10px', marginBottom: '16px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section 3 — Subject-wise Feedback
            </span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
              <span style={{ fontSize: '14px', color: 'var(--mid)' }}>
                Rate your experience for each subject (optional but recommended)
              </span>
            </div>
            {SUBJECTS.map(subject => (
              <SubjectRow
                key={subject}
                subject={subject}
                value={form.subjects[subject] || ''}
                onChange={v => setForm({ ...form, subjects: { ...form.subjects, [subject]: v } })}
              />
            ))}
          </div>
        </div>

        {/* Section 4: Branch Experience */}
        <div style={{ marginTop: '20px', marginBottom: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: '#1a1a2e', borderRadius: '10px', marginBottom: '16px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section 4 — Branch Experience
            </span>
          </div>
          <div className="card" style={{ padding: '20px' }} data-error={errors.branchFacilities ? 'true' : undefined}>
            <label className="label">
              How would you rate branch facilities/services? <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            {errors.branchFacilities && <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '8px' }}>{errors.branchFacilities}</p>}
            <RatingPill
              options={RATINGS}
              value={form.branchFacilities}
              onChange={v => { setForm({ ...form, branchFacilities: v }); setErrors({ ...errors, branchFacilities: '' }); }}
            />
          </div>
        </div>

        {/* Section 5: Comments */}
        <div style={{ marginTop: '20px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: '#1a1a2e', borderRadius: '10px', marginBottom: '16px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section 5 — Detailed Feedback (Optional)
            </span>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <label className="label">Any suggestions or detailed feedback?</label>
            <textarea
              className="input"
              placeholder="Share your thoughts, suggestions, or concerns..."
              rows={4}
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Submit */}
        {submitError && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            borderRadius: '10px', padding: '14px 16px', marginBottom: '16px',
            color: 'var(--error)', fontSize: '14px'
          }}>
            ⚠️ {submitError}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            padding: '16px', fontSize: '16px', borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(232,71,10,0.35)'
          }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spin" style={{
                width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%', display: 'inline-block'
              }} />
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
