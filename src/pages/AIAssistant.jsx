import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am CivicAI Assistant. Ask me about civic issues, area problems, or how to report an issue.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
  {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.text }]
              })),
              { role: 'user', parts: [{ text: input }] }
            ],
            systemInstruction: {
              parts: [{ text: 'You are CivicAI Assistant, an AI helper for a civic issue reporting platform in India. Help citizens with reporting issues, understanding priorities, area problems, and civic awareness. Be concise, helpful, and friendly. Answer in the same language the user uses (Hindi or English).' }]
            }
          })
        }
      )
      const data = await response.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that. Please try again.'
      setMessages(m => [...m, { role: 'assistant', text: reply }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>AI Powered</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Civic Assistant</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '40px' }}>Ask anything about civic issues, area problems, or how to get things fixed.</p>

        {/* Chat Window */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '24px', height: '460px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6',
                  backgroundColor: msg.role === 'user' ? '#8b8bff' : '#12122a',
                  color: msg.role === 'user' ? '#12122a' : '#ffffff',
                  fontWeight: msg.role === 'user' ? '600' : '400',
                  border: msg.role === 'assistant' ? '1px solid #2a2a4a' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#12122a', border: '1px solid #2a2a4a', padding: '12px 16px', borderRadius: '12px', color: '#9090bb', fontSize: '14px' }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid #2a2a4a', padding: '16px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about civic issues in your area..."
              style={{
                flex: 1, backgroundColor: '#12122a', border: '1px solid #2a2a4a',
                borderRadius: '10px', padding: '12px 16px', color: '#ffffff',
                fontSize: '14px', outline: 'none'
              }}
            />
            <button onClick={sendMessage} disabled={loading} style={{
              backgroundColor: '#8b8bff', color: '#12122a', padding: '12px 24px',
              borderRadius: '10px', fontWeight: '700', fontSize: '14px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              Send
            </button>
          </div>
        </div>

        {/* Quick Questions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            'Most urgent issues near me?',
            'How to report a pothole?',
            'Mera area safe hai?',
            'Water leakage kaise report karein?'
          ].map((q, i) => (
            <button key={i} onClick={() => { setInput(q) }} style={{
              backgroundColor: '#1a1a38', border: '1px solid #2a2a4a',
              color: '#9090bb', padding: '8px 16px', borderRadius: '100px',
              fontSize: '13px', cursor: 'pointer'
            }}>
              {q}
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AIAssistant