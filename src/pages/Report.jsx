import Navbar from '../components/Navbar'
import { useState } from 'react'
import { analyzeImage } from '../utils/gemini'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const categories = ['Pothole', 'Water Leakage', 'Broken Streetlight', 'Garbage', 'Damaged Road', 'Open Drain', 'Other']

function Report() {
  const [form, setForm] = useState({ title: '', category: '', description: '', location: '', anonymous: false })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const { user, loginWithGoogle } = useAuth()

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
  })

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const base64 = await toBase64(file)
      const result = await analyzeImage(base64)
      setAiResult(result)
      setForm(f => ({ ...f, category: result.category, description: result.description }))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    else if (form.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters'
    if (!form.location.trim()) newErrors.location = 'Location is required'
    if (!form.category) newErrors.category = 'Please select a category'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    else if (form.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters'
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    if (!user) { loginWithGoogle(); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'issues'), {
        title: form.title,
        category: form.category || aiResult?.category || 'Other',
        description: form.description,
        location: form.location,
        anonymous: form.anonymous,
        severity: aiResult?.severity || 'Medium',
        confidence: aiResult?.confidence || 0,
        affectedCitizens: aiResult?.affectedCitizens || 0,
        estimatedDays: aiResult?.estimatedDays || 0,
        status: 'Open',
        votes: 0,
        priorityScore: aiResult ? Math.min(99, (aiResult.affectedCitizens / 10) + (aiResult.severity === 'Critical' ? 40 : aiResult.severity === 'High' ? 30 : aiResult.severity === 'Medium' ? 20 : 10)) : 50,
        reportedBy: user?.uid || 'anonymous',
        reporterName: form.anonymous ? 'Anonymous' : (user?.displayName || 'Anonymous'),
        reporterPhoto: form.anonymous ? null : (user?.photoURL || null),
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Error submitting. Try again!')
    }
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4ade8022', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px', color: '#4ade80' }}>✓</div>
        <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>Issue Reported!</h2>
        <p style={{ color: '#9090bb', marginBottom: '32px' }}>Gemini AI has analyzed and logged your issue.</p>
        <button onClick={() => { setSubmitted(false); setForm({ title: '', category: '', description: '', location: '', anonymous: false }); setAiResult(null); setPreview(null) }}
          style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Report Another
        </button>
      </div>
    </div>
  )

  const inputStyle = (hasError) => ({
    width: '100%', backgroundColor: '#1a1a38',
    border: `1px solid ${hasError ? '#ff6b6b' : '#2a2a4a'}`,
    borderRadius: '12px', padding: '14px 16px',
    color: '#ffffff', fontSize: '14px', outline: 'none'
  })

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Citizen Reporting</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Report an Issue</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>Upload a photo and Gemini AI will auto-detect the issue for you.</p>

        {/* Image Upload */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>Upload Photo / Video</label>
          <label htmlFor="file-upload" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #2a2a4a', borderRadius: '16px', padding: '40px',
            cursor: 'pointer', backgroundColor: '#1a1a38'
          }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: '200px', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '12px', color: '#8b8bff' }}>+</div>
                <p style={{ color: '#9090bb', fontSize: '14px' }}>Click to upload photo or video</p>
              </>
            )}
          </label>
          <input id="file-upload" type="file" accept="image/*,video/*" onChange={handleImage} style={{ display: 'none' }} />
        </div>

        {/* AI Loading */}
        {loading && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <p style={{ color: '#8b8bff', fontWeight: '600' }}>Gemini AI analyzing your image...</p>
          </div>
        )}

        {/* AI Result */}
        {aiResult && !loading && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '16px' }}>Gemini AI Analysis</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Category', value: aiResult.category, color: '#ffffff' },
                { label: 'Severity', value: aiResult.severity, color: aiResult.severity === 'Critical' ? '#ff3b3b' : aiResult.severity === 'High' ? '#ff6b6b' : '#FFB300' },
                { label: 'Confidence', value: aiResult.confidence + '%', color: '#4ade80' },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ color: item.color, fontWeight: '700', fontSize: '16px' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Affected Citizens', value: aiResult.affectedCitizens + '+' },
                { label: 'Estimated Resolution', value: aiResult.estimatedDays + ' days' },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ color: '#ffffff', fontWeight: '700' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <p style={{ color: '#9090bb', fontSize: '14px', lineHeight: '1.6' }}>{aiResult.description}</p>
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Issue Title</label>
          <input type="text" placeholder="e.g. Large pothole near main market"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle(errors.title)} />
          {errors.title && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px' }}>{errors.title}</p>}
        </div>

        {/* Location */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Location</label>
          <input type="text" placeholder="e.g. MG Road, Sector 12, Jaipur"
            value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            style={inputStyle(errors.location)} />
          {errors.location && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px' }}>{errors.location}</p>}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={inputStyle(errors.category)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px' }}>{errors.category}</p>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Description</label>
          <textarea rows={4} placeholder="Describe the issue..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle(errors.description), resize: 'vertical' }} />
          {errors.description && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px' }}>{errors.description}</p>}
        </div>

        {/* Anonymous */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <input type="checkbox" id="anon" checked={form.anonymous}
            onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} />
          <label htmlFor="anon" style={{ color: '#9090bb', fontSize: '14px' }}>Report anonymously</label>
        </div>

        {!user && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ color: '#9090bb', fontSize: '14px', marginBottom: '8px' }}>Login required to submit a report</p>
            <button onClick={loginWithGoogle} style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '8px 24px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
              Login with Google
            </button>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting} style={{
          width: '100%', backgroundColor: submitting ? '#5C5C99' : '#8b8bff',
          color: '#12122a', padding: '16px', borderRadius: '12px',
          fontWeight: '800', fontSize: '16px', border: 'none',
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  )
}

export default Report