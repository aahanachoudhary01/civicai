import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useRef } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function VoiceReport() {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ location: '', anonymous: false })
  const recognitionRef = useRef(null)
  const { user, loginWithGoogle } = useAuth()

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Your browser does not support voice recognition. Please use Chrome.'); return }

    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setRecording(false)
      await analyzeTranscript(text)
    }

    recognition.onerror = () => {
      setRecording(false)
      alert('Voice recognition failed. Please try again.')
    }

    recognition.onend = () => setRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  const analyzeTranscript = async (text) => {
    setLoading(true)
    try {
      const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a civic issue AI. Analyze this voice complaint and respond ONLY in JSON format:
"${text}"
{
  "title": "short issue title",
  "category": "Pothole or Water Leakage or Broken Streetlight or Garbage or Damaged Road or Open Drain or Other",
  "severity": "Low or Medium or High or Critical",
  "description": "professional complaint description",
  "affectedCitizens": 100,
  "estimatedDays": 3
}`
              }]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
          })
        }
      )
      const data = await response.json()
      if (data.error) { setAiResult(null); return }
      const text2 = data.candidates[0].content.parts[0].text
      const clean = text2.replace(/```json|```/g, '').trim()
      setAiResult(JSON.parse(clean))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!aiResult) return alert('Please record a voice complaint first!')
    if (!form.location.trim()) return alert('Location is required!')
    if (!user) { loginWithGoogle(); return }

    try {
      await addDoc(collection(db, 'issues'), {
        title: aiResult.title,
        category: aiResult.category,
        description: aiResult.description,
        location: form.location,
        anonymous: form.anonymous,
        severity: aiResult.severity,
        confidence: 85,
        affectedCitizens: aiResult.affectedCitizens,
        estimatedDays: aiResult.estimatedDays,
        status: 'Open',
        votes: 0,
        priorityScore: Math.min(99, (aiResult.affectedCitizens / 10) + (aiResult.severity === 'Critical' ? 40 : aiResult.severity === 'High' ? 30 : 20)),
        reportedBy: user?.uid || 'anonymous',
        reporterName: form.anonymous ? 'Anonymous' : (user?.displayName || 'Anonymous'),
        reporterPhoto: form.anonymous ? null : (user?.photoURL || null),
        voiceTranscript: transcript,
        reportType: 'voice',
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Error submitting. Try again!')
    }
  }

  if (submitted) return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4ade8022', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#4ade80', fontSize: '28px' }}>✓</div>
        <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>Voice Report Submitted!</h2>
        <p style={{ color: '#9090bb', marginBottom: '32px' }}>Your voice complaint has been analyzed and logged.</p>
        <button onClick={() => { setSubmitted(false); setTranscript(''); setAiResult(null); setForm({ location: '', anonymous: false }) }}
          style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Report Another
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Voice Reporting</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Voice Complaint</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>Speak your complaint in Hindi or English — AI will analyze and create the report automatically.</p>

        {/* Voice Button */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button
            onClick={recording ? stopRecording : startRecording}
            style={{
              width: '140px', height: '140px', borderRadius: '50%',
              backgroundColor: recording ? '#ff6b6b22' : '#8b8bff22',
              border: `3px solid ${recording ? '#ff6b6b' : '#8b8bff'}`,
              color: recording ? '#ff6b6b' : '#8b8bff',
              fontSize: '48px', cursor: 'pointer',
              animation: recording ? 'pulse 1.5s infinite' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            {recording ? '⏹' : '🎤'}
          </button>
          <p style={{ color: recording ? '#ff6b6b' : '#9090bb', fontWeight: '600', fontSize: '15px' }}>
            {recording ? 'Recording... Click to stop' : 'Click to start recording'}
          </p>
          <p style={{ color: '#5C5C99', fontSize: '13px', marginTop: '8px' }}>Supports Hindi and English</p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#9090bb', textTransform: 'uppercase', marginBottom: '12px' }}>Your Voice Input</p>
            <p style={{ color: '#ffffff', fontSize: '16px', lineHeight: '1.6', fontStyle: 'italic' }}>"{transcript}"</p>
          </div>
        )}

        {/* AI Loading */}
        {loading && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: '#8b8bff', fontWeight: '600' }}>Gemini AI analyzing your complaint...</p>
          </div>
        )}

        {/* AI Result */}
        {aiResult && !loading && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '16px' }}>Gemini AI Analysis</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Title', value: aiResult.title, color: '#ffffff' },
                { label: 'Category', value: aiResult.category, color: '#8b8bff' },
                { label: 'Severity', value: aiResult.severity, color: '#ff6b6b' },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ color: item.color, fontWeight: '700', fontSize: '14px' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <p style={{ color: '#9090bb', fontSize: '14px', lineHeight: '1.6' }}>{aiResult.description}</p>
          </div>
        )}

        {/* Location */}
        {aiResult && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#CCCCFF', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Location</label>
              <input
                type="text"
                placeholder="e.g. MG Road, Sector 12, Jaipur"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                style={{ width: '100%', backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '12px', padding: '14px 16px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <input type="checkbox" id="anon" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} />
              <label htmlFor="anon" style={{ color: '#9090bb', fontSize: '14px' }}>Report anonymously</label>
            </div>

            <button onClick={handleSubmit} style={{
              width: '100%', backgroundColor: '#8b8bff', color: '#12122a',
              padding: '16px', borderRadius: '12px', fontWeight: '800',
              fontSize: '16px', border: 'none', cursor: 'pointer'
            }}>
              Submit Voice Report
            </button>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default VoiceReport