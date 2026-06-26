import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

const features = [
  { title: 'AI Issue Detection', desc: 'Upload a photo — Gemini AI detects the issue, category, and severity automatically.' },
  { title: 'Smart Priority Engine', desc: 'Issues ranked by severity, affected citizens, traffic and report age.' },
  { title: 'Real-Time Tracking', desc: 'Every issue tracked from reported to resolved with full transparency.' },
  { title: 'Community Verification', desc: 'AI filters fake reports. Citizens verify what is genuine.' },
  { title: 'Predictive Insights', desc: 'AI flags areas likely to face problems before they escalate.' },
  { title: 'Authority Dashboard', desc: 'Heatmaps, resource plans and resolution analytics — all in one place.' },
]

const steps = [
  { number: '01', title: 'Report', desc: 'Upload a photo or video with your location.' },
  { number: '02', title: 'AI Analyzes', desc: 'Gemini categorizes, scores severity, detects duplicates.' },
  { number: '03', title: 'Community Acts', desc: 'Citizens upvote, verify and track together.' },
  { number: '04', title: 'Resolved', desc: 'Authorities act. AI verifies the fix.' },
]

function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '140px', paddingBottom: '120px' }} className="text-center px-6">
        <span style={{
          display: 'inline-block', backgroundColor: 'rgba(92,92,153,0.3)',
          border: '1px solid #5C5C99', color: '#CCCCFF', fontSize: '11px',
          fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
          padding: '6px 20px', borderRadius: '100px', marginBottom: '40px'
        }}>
          AI-Powered Civic Intelligence
        </span>

        <h1 style={{ fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: '900', lineHeight: '1.05', marginBottom: '28px', color: '#ffffff' }}>
          Fix Your City.<br />
          <span style={{ color: '#8b8bff' }}>Powered by AI.</span>
        </h1>

        <p style={{ color: '#9090bb', fontSize: '18px', maxWidth: '560px', margin: '0 auto 48px', lineHeight: '1.7' }}>
          Report civic issues, track resolutions, and build a stronger community — with Gemini AI and real-time intelligence.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/report')} style={{
            backgroundColor: '#8b8bff', color: '#12122a',
            padding: '14px 36px', borderRadius: '12px', fontWeight: '700',
            fontSize: '15px', border: 'none', cursor: 'pointer'
          }}>
            Report an Issue
          </button>
          <button onClick={() => navigate('/map')} style={{
            backgroundColor: 'transparent', color: '#CCCCFF',
            padding: '14px 36px', borderRadius: '12px', fontWeight: '600',
            fontSize: '15px', border: '1px solid #5C5C99', cursor: 'pointer'
          }}>
            View Live Map
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', marginTop: '96px', flexWrap: 'wrap' }}>
          {[
            { value: '12,400+', label: 'Issues Reported' },
            { value: '89%', label: 'Resolution Rate' },
            { value: '3.2 Days', label: 'Avg Resolution Time' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '36px', fontWeight: '900', color: '#8b8bff' }}>{stat.value}</p>
              <p style={{ fontSize: '13px', color: '#9090bb', marginTop: '6px' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#2a2a4a', margin: '0 48px' }}></div>

      {/* Features */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '16px' }}>What We Do</p>
          <h2 style={{ textAlign: 'center', fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '72px' }}>Everything Your City Needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '32px' }}>
                <div style={{ width: '32px', height: '3px', backgroundColor: '#8b8bff', borderRadius: '2px', marginBottom: '20px' }}></div>
                <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#9090bb', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#2a2a4a', margin: '0 48px' }}></div>

      {/* How It Works */}
      <section style={{ padding: '120px 24px', backgroundColor: '#0e0e22' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '16px' }}>Simple Process</p>
          <h2 style={{ textAlign: 'center', fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '72px' }}>How CivicAI Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', backgroundColor: '#1a1a38',
                  border: '1px solid #2a2a4a', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '18px', fontWeight: '900', color: '#8b8bff'
                }}>
                  {s.number}
                </div>
                <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '17px', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: '#9090bb', fontSize: '14px', lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#ffffff', marginBottom: '16px' }}>Ready to Fix Your City?</h2>
        <p style={{ color: '#9090bb', fontSize: '18px', marginBottom: '48px' }}>Join thousands of citizens making their communities better.</p>
        <button onClick={() => navigate('/report')} style={{
          backgroundColor: '#8b8bff', color: '#12122a',
          padding: '16px 48px', borderRadius: '12px', fontWeight: '800',
          fontSize: '16px', border: 'none', cursor: 'pointer'
        }}>
          Report an Issue Now
        </button>
      </section>

      <Footer />
    </div>
  )
}

export default Home