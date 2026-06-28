import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

function BeforeAfter() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const resolved = issues.filter(i => i.status === 'Resolved')
  const open = issues.filter(i => i.status === 'Open')
  const inProgress = issues.filter(i => i.status === 'In Progress')

  const statusColor = { 'Open': '#FFB300', 'In Progress': '#8b8bff', 'Resolved': '#4ade80', 'Rejected': '#ff6b6b' }
  const severityColor = { 'Low': '#4ade80', 'Medium': '#FFB300', 'High': '#ff6b6b', 'Critical': '#ff3b3b' }

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Resolution Tracking</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Issue Resolution Center</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>Track every civic issue from reported to resolved with full transparency.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Total Issues', value: issues.length, color: '#8b8bff' },
            { label: 'Open', value: open.length, color: '#FFB300' },
            { label: 'In Progress', value: inProgress.length, color: '#8b8bff' },
            { label: 'Resolved', value: resolved.length, color: '#4ade80' },
            { label: 'Resolution Rate', value: issues.length ? Math.round((resolved.length / issues.length) * 100) + '%' : '0%', color: '#4ade80' },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px' }}>
              <p style={{ color: '#9090bb', fontSize: '13px', marginBottom: '8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '28px', fontWeight: '900' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Resolution Progress Bar */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
          <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>City Resolution Progress</p>
          <div style={{ backgroundColor: '#12122a', borderRadius: '100px', height: '16px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{
              backgroundColor: '#4ade80', height: '100%', borderRadius: '100px',
              width: `${issues.length ? (resolved.length / issues.length) * 100 : 0}%`,
              transition: 'width 1s ease'
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ color: '#9090bb', fontSize: '13px' }}>0%</p>
            <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>
              {issues.length ? Math.round((resolved.length / issues.length) * 100) : 0}% Resolved
            </p>
            <p style={{ color: '#9090bb', fontSize: '13px' }}>100%</p>
          </div>
        </div>

        {/* Resolved Issues */}
        {resolved.length > 0 && (
          <>
            <h2 style={{ color: '#ffffff', fontWeight: '800', fontSize: '24px', marginBottom: '24px' }}>Resolved Issues</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '48px' }}>
              {resolved.map(issue => (
                <div key={issue.id} style={{ backgroundColor: '#1a1a38', border: '1px solid #4ade8044', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px', flex: 1, marginRight: '12px' }}>{issue.title}</p>
                    <span style={{ backgroundColor: '#4ade8022', color: '#4ade80', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>Resolved</span>
                  </div>
                  <p style={{ color: '#9090bb', fontSize: '13px', marginBottom: '8px' }}>{issue.location} · {issue.category}</p>
                  <p style={{ color: '#5C5C99', fontSize: '12px', marginBottom: '16px' }}>{issue.description?.slice(0, 80)}...</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ backgroundColor: (severityColor[issue.severity] || '#FFB300') + '22', color: severityColor[issue.severity] || '#FFB300', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>
                      {issue.severity}
                    </span>
                    <span style={{ color: '#9090bb', fontSize: '12px', padding: '3px 0' }}>{issue.votes} votes · Priority: {Math.round(issue.priorityScore || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Open Issues */}
        {open.length > 0 && (
          <>
            <h2 style={{ color: '#ffffff', fontWeight: '800', fontSize: '24px', marginBottom: '24px' }}>Open Issues</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {open.map(issue => (
                <div key={issue.id} style={{ backgroundColor: '#1a1a38', border: '1px solid #FFB30044', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px', flex: 1, marginRight: '12px' }}>{issue.title}</p>
                    <span style={{ backgroundColor: '#FFB30022', color: '#FFB300', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>Open</span>
                  </div>
                  <p style={{ color: '#9090bb', fontSize: '13px', marginBottom: '8px' }}>{issue.location} · {issue.category}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ backgroundColor: (severityColor[issue.severity] || '#FFB300') + '22', color: severityColor[issue.severity] || '#FFB300', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>
                      {issue.severity}
                    </span>
                    <span style={{ color: '#9090bb', fontSize: '12px', padding: '3px 0' }}>{issue.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#9090bb', padding: '48px' }}>Loading...</div>}

        {!loading && issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No issues yet</p>
            <p style={{ color: '#9090bb' }}>Report issues to see resolution tracking here.</p>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default BeforeAfter