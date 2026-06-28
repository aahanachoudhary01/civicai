import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

function BarChart({ data, maxValue, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 8px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
          <p style={{ color: '#9090bb', fontSize: '11px', fontWeight: '700' }}>{item.value}</p>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            backgroundColor: color,
            height: `${maxValue > 0 ? (item.value / maxValue) * 160 : 4}px`,
            minHeight: '4px',
            transition: 'height 0.5s ease'
          }}></div>
          <p style={{ color: '#9090bb', fontSize: '10px', textAlign: 'center', lineHeight: '1.2' }}>{item.label}</p>
        </div>
      ))}
    </div>
  )
}

function Trends() {
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

  // Category wise count
  const categories = ['Pothole', 'Water Leakage', 'Broken Streetlight', 'Garbage', 'Damaged Road', 'Open Drain', 'Other']
  const categoryData = categories.map(cat => ({
    label: cat.split(' ')[0],
    value: issues.filter(i => i.category === cat).length
  }))
  const maxCategory = Math.max(...categoryData.map(d => d.value), 1)

  // Severity wise count
  const severities = ['Low', 'Medium', 'High', 'Critical']
  const severityData = severities.map(sev => ({
    label: sev,
    value: issues.filter(i => i.severity === sev).length
  }))
  const maxSeverity = Math.max(...severityData.map(d => d.value), 1)

  // Status wise
  const statusData = [
    { label: 'Open', value: issues.filter(i => i.status === 'Open').length },
    { label: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length },
    { label: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length },
    { label: 'Rejected', value: issues.filter(i => i.status === 'Rejected').length },
  ]
  const maxStatus = Math.max(...statusData.map(d => d.value), 1)

  // Top affected areas
  const areaMap = {}
  issues.forEach(i => {
    const area = i.location?.split(',')[0] || 'Unknown'
    areaMap[area] = (areaMap[area] || 0) + 1
  })
  const topAreas = Object.entries(areaMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // AI Insights
  const mostCommonCategory = categoryData.sort((a, b) => b.value - a.value)[0]
  const resolutionRate = issues.length ? Math.round((issues.filter(i => i.status === 'Resolved').length / issues.length) * 100) : 0
  const avgPriority = issues.length ? Math.round(issues.reduce((a, b) => a + (b.priorityScore || 0), 0) / issues.length) : 0
  const criticalCount = issues.filter(i => i.severity === 'Critical').length

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Analytics</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Trend Analysis</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '48px' }}>AI-powered insights into civic issues across the city.</p>

        {/* AI Insights Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Most Common Issue', value: mostCommonCategory?.label || 'N/A', color: '#ff6b6b', insight: 'Needs immediate attention' },
            { label: 'Resolution Rate', value: resolutionRate + '%', color: '#4ade80', insight: resolutionRate > 50 ? 'Good performance' : 'Needs improvement' },
            { label: 'Avg Priority Score', value: avgPriority, color: '#8b8bff', insight: avgPriority > 60 ? 'High urgency area' : 'Moderate urgency' },
            { label: 'Critical Issues', value: criticalCount, color: '#ff3b3b', insight: criticalCount > 0 ? 'Immediate action needed' : 'All clear' },
          ].map((card, i) => (
            <div key={i} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '24px' }}>
              <p style={{ color: '#9090bb', fontSize: '12px', marginBottom: '8px' }}>{card.label}</p>
              <p style={{ color: card.color, fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>{card.value}</p>
              <p style={{ color: '#5C5C99', fontSize: '12px' }}>{card.insight}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '24px' }}>

          {/* Category Chart */}
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#8b8bff', textTransform: 'uppercase', marginBottom: '8px' }}>Issues by Category</p>
            <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px', marginBottom: '24px' }}>Category Breakdown</h3>
            {loading ? <p style={{ color: '#9090bb' }}>Loading...</p> : <BarChart data={categoryData} maxValue={maxCategory} color="#8b8bff" />}
          </div>

          {/* Severity Chart */}
          <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#ff6b6b', textTransform: 'uppercase', marginBottom: '8px' }}>Severity Distribution</p>
            <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px', marginBottom: '24px' }}>Issue Severity</h3>
            {loading ? <p style={{ color: '#9090bb' }}>Loading...</p> : <BarChart data={severityData} maxValue={maxSeverity} color="#ff6b6b" />}
          </div>

        </div>

        {/* Status Chart */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#4ade80', textTransform: 'uppercase', marginBottom: '8px' }}>Resolution Tracking</p>
          <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px', marginBottom: '24px' }}>Status Overview</h3>
          {loading ? <p style={{ color: '#9090bb' }}>Loading...</p> : (
            <div style={{ maxWidth: '400px' }}>
              <BarChart data={statusData} maxValue={maxStatus} color="#4ade80" />
            </div>
          )}
        </div>

        {/* Top Problem Areas */}
        <div style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#FFB300', textTransform: 'uppercase', marginBottom: '8px' }}>Hotspots</p>
          <h3 style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px', marginBottom: '24px' }}>Top Problem Areas</h3>
          {topAreas.length === 0 ? (
            <p style={{ color: '#9090bb' }}>No data yet</p>
          ) : (
            topAreas.map(([area, count], i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{area}</p>
                  <p style={{ color: '#FFB300', fontSize: '14px', fontWeight: '700' }}>{count} issues</p>
                </div>
                <div style={{ backgroundColor: '#12122a', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    backgroundColor: '#FFB300',
                    height: '100%',
                    borderRadius: '100px',
                    width: `${(count / topAreas[0][1]) * 100}%`
                  }}></div>
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

export default Trends