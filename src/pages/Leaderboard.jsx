import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const badges = [
  { name: 'Bronze Hero', min: 1, color: '#cd7f32' },
  { name: 'Silver Guardian', min: 5, color: '#C0C0C0' },
  { name: 'Gold Champion', min: 10, color: '#FFD700' },
  { name: 'Platinum Legend', min: 20, color: '#8b8bff' },
]

function getBadge(reports) {
  let badge = badges[0]
  for (const b of badges) {
    if (reports >= b.min) badge = b
  }
  return badge
}

function Leaderboard() {
  const [issues, setIssues] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Group by reporter (userId)
  const reporterMap = {}
  issues.forEach(issue => {
    const uid = issue.reportedBy || 'anonymous'
    const name = issue.reporterName || 'Anonymous'
    const photo = issue.reporterPhoto || null
    if (!reporterMap[uid]) reporterMap[uid] = { uid, name, photo, reports: 0, votes: 0 }
    reporterMap[uid].reports += 1
    reporterMap[uid].votes += issue.votes || 0
  })

  const leaderboard = Object.values(reporterMap)
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 10)

  const cityScore = Math.min(100, Math.round(
    (issues.filter(i => i.status === 'Resolved').length / Math.max(1, issues.length)) * 100
  ))

  const categoryCount = {}
  issues.forEach(i => {
    categoryCount[i.category] = (categoryCount[i.category] || 0) + 1
  })
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Community</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>City Health & Leaderboard</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>Track your city's health and top civic contributors.</p>

        {/* City Health Score */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '36px', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '24px' }}>AI City Health Score</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                border: `8px solid ${cityScore >= 70 ? '#4ade80' : cityScore >= 40 ? '#FFB300' : '#ff6b6b'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <p style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff' }}>{cityScore}</p>
                <p style={{ fontSize: '11px', color: '#9090bb' }}>/ 100</p>
              </div>
              <p style={{ color: cityScore >= 70 ? '#4ade80' : cityScore >= 40 ? '#FFB300' : '#ff6b6b', fontWeight: '700', marginTop: '12px' }}>
                {cityScore >= 70 ? 'Healthy' : cityScore >= 40 ? 'Needs Attention' : 'Critical'}
              </p>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { label: 'Total Issues', value: issues.length, color: '#8b8bff' },
                { label: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, color: '#4ade80' },
                { label: 'Open Issues', value: issues.filter(i => i.status === 'Open').length, color: '#FFB300' },
                { label: 'Top Problem', value: topCategory ? topCategory[0] : 'N/A', color: '#ff6b6b' },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: '#12122a', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '4px' }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: '20px', fontWeight: '800' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Stats */}
        {user && (
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #8b8bff', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '16px' }}>Your Stats</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <img src={user.photoURL} alt="avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #8b8bff' }} />
              <div>
                <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>{user.displayName}</p>
                <p style={{ color: '#9090bb', fontSize: '13px' }}>{user.email}</p>
              </div>
              {(() => {
                const myReports = issues.filter(i => i.reportedBy === user.uid).length
                const badge = getBadge(myReports)
                return (
                  <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: badge.color + '22', border: `3px solid ${badge.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <span style={{ fontSize: '20px' }}>★</span>
                    </div>
                    <p style={{ color: badge.color, fontWeight: '700', fontSize: '13px' }}>{badge.name}</p>
                    <p style={{ color: '#9090bb', fontSize: '12px' }}>{myReports} reports</p>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #2a2a4a' }}>
            <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>Top Community Heroes</h2>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9090bb' }}>No data yet — start reporting issues!</div>
          ) : (
            leaderboard.map((reporter, i) => {
              const badge = getBadge(reporter.reports)
              return (
                <div key={reporter.uid} style={{
                  padding: '16px 28px',
                  borderBottom: i < leaderboard.length - 1 ? '1px solid #2a2a4a' : 'none',
                  display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <p style={{ color: i < 3 ? '#FFD700' : '#9090bb', fontWeight: '900', fontSize: '18px', width: '28px' }}>#{i + 1}</p>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#12122a', border: '2px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9090bb', fontWeight: '700' }}>
                    {reporter.name?.charAt(0) || 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>{reporter.name}</p>
                    <p style={{ color: badge.color, fontSize: '12px', fontWeight: '600' }}>{badge.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8b8bff', fontWeight: '800', fontSize: '16px' }}>{reporter.reports}</p>
                    <p style={{ color: '#9090bb', fontSize: '11px' }}>reports</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px' }}>{reporter.votes}</p>
                    <p style={{ color: '#9090bb', fontSize: '11px' }}>votes earned</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Leaderboard