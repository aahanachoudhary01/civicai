import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const statusColor = { 'Open': '#FFB300', 'In Progress': '#8b8bff', 'Resolved': '#4ade80', 'Rejected': '#ff6b6b' }
const severityColor = { 'Low': '#4ade80', 'Medium': '#FFB300', 'High': '#ff6b6b', 'Critical': '#ff3b3b' }

const AUTHORIZED_EMAILS = [
  'demo123@gmail.com'
]

function Authority() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const { user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('priorityScore', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'issues', id), { status })
  }

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter)

  const total = issues.length
  const open = issues.filter(i => i.status === 'Open').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const resolved = issues.filter(i => i.status === 'Resolved').length
  const critical = issues.filter(i => i.severity === 'Critical').length
  const avgPriority = issues.length ? Math.round(issues.reduce((a, b) => a + (b.priorityScore || 0), 0) / issues.length) : 0

 if (!user || !AUTHORIZED_EMAILS.includes(user.email)) return (
  <div style={{ backgroundColor: '#12122a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Navbar />
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>Authority Access Restricted</h2>
      <p style={{ color: '#9090bb', marginBottom: '32px' }}>This dashboard is only accessible to verified municipal authorities.</p>
      {!user && (
        <button onClick={loginWithGoogle} style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Login with Google
        </button>
      )}
    </div>
  </div>
)

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Admin Panel</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Authority Dashboard</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>Manage, prioritize and resolve civic issues across the city.</p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Total Issues', value: total, color: '#8b8bff' },
            { label: 'Open', value: open, color: '#FFB300' },
            { label: 'In Progress', value: inProgress, color: '#8b8bff' },
            { label: 'Resolved', value: resolved, color: '#4ade80' },
            { label: 'Critical', value: critical, color: '#ff3b3b' },
            { label: 'Avg Priority', value: avgPriority, color: '#8b8bff' },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '20px' }}>
              <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '28px', fontWeight: '900' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Resource Recommendation */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '16px' }}>AI Resource Recommendation</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Workers Needed', value: Math.max(2, open + inProgress), unit: 'persons' },
              { label: 'Vehicles Required', value: Math.max(1, Math.ceil((open + inProgress) / 3)), unit: 'vehicles' },
              { label: 'Est. Budget', value: `₹${(open + inProgress) * 15}K`, unit: 'approx' },
              { label: 'Days to Clear', value: Math.max(3, Math.ceil(open / 2)), unit: 'days' },
            ].map((r, i) => (
              <div key={i}>
                <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '4px' }}>{r.label}</p>
                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900' }}>{r.value} <span style={{ color: '#5C5C99', fontSize: '12px' }}>{r.unit}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              backgroundColor: filter === f ? '#8b8bff' : '#1a1a38',
              color: filter === f ? '#12122a' : '#9090bb',
              border: '1px solid #2a2a4a', padding: '8px 20px',
              borderRadius: '100px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Issues Table */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>Issue Management</h2>
            <span style={{ color: '#9090bb', fontSize: '13px' }}>{filtered.length} issues</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>No issues found.</div>
          ) : (
            filtered.map((issue, i) => (
              <div key={issue.id} style={{
                padding: '20px 28px',
                borderBottom: i < filtered.length - 1 ? '1px solid #2a2a4a' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{issue.title}</p>
                  <p style={{ color: '#9090bb', fontSize: '13px' }}>{issue.location} · {issue.category}</p>
                  {issue.description && <p style={{ color: '#5C5C99', fontSize: '12px', marginTop: '4px' }}>{issue.description}</p>}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <span style={{ color: '#9090bb', fontSize: '12px' }}>{issue.votes} votes</span>
                    <span style={{ color: '#8b8bff', fontSize: '12px', fontWeight: '700' }}>Priority: {Math.round(issue.priorityScore || 0)}</span>
                    <span style={{ color: '#4ade80', fontSize: '12px' }}>ETA: {issue.estimatedDays || 0} days</span>
                    <span style={{ color: '#9090bb', fontSize: '12px' }}>Affected: {issue.affectedCitizens || 0}+</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: (severityColor[issue.severity] || '#FFB300') + '22', color: severityColor[issue.severity] || '#FFB300', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                    {issue.severity}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={issue.status}
                    onChange={e => updateStatus(issue.id, e.target.value)}
                    style={{
                      backgroundColor: '#12122a', border: '1px solid #2a2a4a',
                      color: statusColor[issue.status] || '#ffffff',
                      padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Authority