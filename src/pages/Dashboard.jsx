import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const statusColor = { 'Open': '#FFB300', 'In Progress': '#8b8bff', 'Resolved': '#4ade80', 'Rejected': '#ff6b6b' }
const severityColor = { 'Low': '#4ade80', 'Medium': '#FFB300', 'High': '#ff6b6b', 'Critical': '#ff3b3b' }

function Dashboard() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [votedIssues, setVotedIssues] = useState({})
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

  const total = issues.length
  const open = issues.filter(i => i.status === 'Open').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const resolved = issues.filter(i => i.status === 'Resolved').length

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Live Overview</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '48px' }}>Issue Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '48px' }}>
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

        {!user && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#9090bb', fontSize: '14px' }}>Login with Google to upvote issues</p>
            <button onClick={loginWithGoogle} style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '8px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              Login with Google
            </button>
          </div>
        )}

        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>Recent Issues</h2>
            <span style={{ color: '#9090bb', fontSize: '13px' }}>Sorted by Priority Score</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>Loading issues...</div>
          ) : issues.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>No issues reported yet.</div>
          ) : (
            issues.map((issue, i) => (
              <div key={issue.id} style={{
                padding: '20px 28px',
                borderBottom: i < issues.length - 1 ? '1px solid #2a2a4a' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{issue.title}</p>
                  <p style={{ color: '#9090bb', fontSize: '13px' }}>{issue.location} &nbsp;·&nbsp; {issue.category}</p>
                  {issue.description && <p style={{ color: '#5C5C99', fontSize: '12px', marginTop: '4px' }}>{issue.description}</p>}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8b8bff', fontWeight: '800', fontSize: '16px' }}>{Math.round(issue.priorityScore || 0)}</p>
                    <p style={{ color: '#9090bb', fontSize: '11px' }}>Priority</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px' }}>{issue.estimatedDays || 0} days</p>
                    <p style={{ color: '#9090bb', fontSize: '11px' }}>ETA</p>
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