import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const statusColor = { 'Open': '#FFB300', 'In Progress': '#8b8bff', 'Resolved': '#4ade80', 'Rejected': '#ff6b6b' }
const severityColor = { 'Low': '#4ade80', 'Medium': '#FFB300', 'High': '#ff6b6b', 'Critical': '#ff3b3b' }

function TimelineModal({ issue, onClose }) {
  const timeline = [
    { status: 'Reported', date: issue.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently', color: '#8b8bff' },
    ...(issue.status !== 'Open' ? [{ status: 'In Progress', date: 'Under Review', color: '#FFB300' }] : []),
    ...(issue.status === 'Resolved' ? [{ status: 'Resolved', date: 'Completed', color: '#4ade80' }] : []),
    ...(issue.status === 'Rejected' ? [{ status: 'Rejected', date: 'Closed', color: '#ff6b6b' }] : []),
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontWeight: '800', fontSize: '20px' }}>Issue Timeline</h3>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: '#9090bb', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ color: '#ffffff', fontWeight: '600', marginBottom: '24px' }}>{issue.title}</p>

        <div style={{ position: 'relative' }}>
          {timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></div>
                {i < timeline.length - 1 && <div style={{ width: '2px', flex: 1, backgroundColor: '#2a2a4a', marginTop: '4px' }}></div>}
              </div>
              <div style={{ paddingBottom: '8px' }}>
                <p style={{ color: item.color, fontWeight: '700', fontSize: '15px' }}>{item.status}</p>
                <p style={{ color: '#9090bb', fontSize: '13px' }}>{item.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#12122a', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <p style={{ color: '#9090bb', fontSize: '13px', marginBottom: '4px' }}>Location</p>
          <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{issue.location}</p>
          <p style={{ color: '#9090bb', fontSize: '13px', marginTop: '8px', marginBottom: '4px' }}>Category</p>
          <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{issue.category}</p>
          <p style={{ color: '#9090bb', fontSize: '13px', marginTop: '8px', marginBottom: '4px' }}>Description</p>
          <p style={{ color: '#ffffff', fontSize: '14px' }}>{issue.description}</p>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [votedIssues, setVotedIssues] = useState({})
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const { user, loginWithGoogle } = useAuth()

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('priorityScore', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const loadVotes = async () => {
      const voteDoc = await getDoc(doc(db, 'userVotes', user.uid))
      if (voteDoc.exists()) setVotedIssues(voteDoc.data())
    }
    loadVotes()
  }, [user])

  const handleUpvote = async (issueId) => {
    if (!user) { loginWithGoogle(); return }
    if (votedIssues[issueId]) return
    const newVoted = { ...votedIssues, [issueId]: true }
    setVotedIssues(newVoted)
    await Promise.all([
      updateDoc(doc(db, 'issues', issueId), { votes: increment(1) }),
      setDoc(doc(db, 'userVotes', user.uid), newVoted)
    ])
  }

  const handleShare = (issue) => {
    const text = `Civic Issue Reported: ${issue.title} at ${issue.location}. Severity: ${issue.severity}. Help us fix it! ${window.location.origin}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const filtered = issues
    .filter(i => filterStatus === 'All' || i.status === filterStatus)
    .filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase()))

  const total = issues.length
  const open = issues.filter(i => i.status === 'Open').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const resolved = issues.filter(i => i.status === 'Resolved').length

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      {selectedIssue && <TimelineModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Live Overview</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '48px' }}>Issue Dashboard</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Issues', value: total, color: '#8b8bff' },
            { label: 'Open', value: open, color: '#FFB300' },
            { label: 'In Progress', value: inProgress, color: '#8b8bff' },
            { label: 'Resolved', value: resolved, color: '#4ade80' },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px' }}>
              <p style={{ color: '#9090bb', fontSize: '13px', marginBottom: '8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '32px', fontWeight: '900' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '10px', padding: '10px 16px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
          />
          {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{
              backgroundColor: filterStatus === f ? '#8b8bff' : '#1a1a38',
              color: filterStatus === f ? '#12122a' : '#9090bb',
              border: '1px solid #2a2a4a', padding: '10px 20px',
              borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>{f}</button>
          ))}
        </div>

        {!user && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#9090bb', fontSize: '14px' }}>Login with Google to upvote issues</p>
            <button onClick={loginWithGoogle} style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '8px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              Login with Google
            </button>
          </div>
        )}

        {/* Issues List */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>Recent Issues</h2>
            <span style={{ color: '#9090bb', fontSize: '13px' }}>{filtered.length} issues found</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>Loading issues...</div>
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
                  {issue.description && <p style={{ color: '#5C5C99', fontSize: '12px', marginTop: '4px' }}>{issue.description?.slice(0, 80)}...</p>}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: (severityColor[issue.severity] || '#FFB300') + '22', color: severityColor[issue.severity] || '#FFB300', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                    {issue.severity}
                  </span>
                  <span style={{ backgroundColor: (statusColor[issue.status] || '#FFB300') + '22', color: statusColor[issue.status] || '#FFB300', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                    {issue.status}
                  </span>

                  <button onClick={() => handleUpvote(issue.id)} style={{
                    backgroundColor: votedIssues[issue.id] ? '#8b8bff22' : '#12122a',
                    border: `1px solid ${votedIssues[issue.id] ? '#8b8bff' : '#2a2a4a'}`,
                    color: votedIssues[issue.id] ? '#8b8bff' : '#9090bb',
                    padding: '6px 14px', borderRadius: '100px', fontSize: '13px',
                    cursor: votedIssues[issue.id] ? 'default' : 'pointer', fontWeight: '600'
                  }}>
                    {votedIssues[issue.id] ? 'Voted' : 'Upvote'} {issue.votes}
                  </button>

                  {/* Share Button */}
                  <button onClick={() => handleShare(issue)} style={{
                    backgroundColor: '#12122a', border: '1px solid #2a2a4a',
                    color: '#4ade80', padding: '6px 14px', borderRadius: '100px',
                    fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                  }}>
                    Share
                  </button>

                  {/* Timeline Button */}
                  <button onClick={() => setSelectedIssue(issue)} style={{
                    backgroundColor: '#12122a', border: '1px solid #2a2a4a',
                    color: '#8b8bff', padding: '6px 14px', borderRadius: '100px',
                    fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                  }}>
                    Timeline
                  </button>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8b8bff', fontWeight: '800', fontSize: '16px' }}>{Math.round(issue.priorityScore || 0)}</p>
                    <p style={{ color: '#9090bb', fontSize: '11px' }}>Priority</p>
                  </div>
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

export default Dashboard