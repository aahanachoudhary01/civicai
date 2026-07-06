import Navbar from '../components/Navbar'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase' 
import { collection, onSnapshot, query } from 'firebase/firestore'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const severityColor = { Low: '#4ade80', Medium: '#FFB300', High: '#ff6b6b', Critical: '#ff3b3b' }

function MapController({ activeLocation, issues }) {
  const map = useMap()
  
  useEffect(() => {
    // 1. Agar user kisi specific card par click kare, toh wahan smooth fly kare
    if (activeLocation) {
      map.flyTo([activeLocation.lat, activeLocation.lng], 15, { animate: true, duration: 1.5 })
    } 
    // 2. Agar page load hote hi issues mil jayein, toh map automatic loaded data par center ho jaye
    else if (issues.length > 0) {
      map.setView([issues[0].lat, issues[0].lng], 13)
    }
  }, [activeLocation, map, issues])
  
  return null
}

function Map() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeLocation, setActiveLocation] = useState(null)
  
  // Marker open karne ke liye refs dictionary
  const markerRefs = useRef({})

  useEffect(() => {
    const q = query(collection(db, 'issues'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => {
        const docData = d.data();
        return { 
          id: d.id, 
          ...docData,
          lat: Number(docData.lat), 
          // Typo handling: 'lng' check karega, fallback 'lan' par rakhega
          lng: Number(docData.lng || docData.lan) 
        }
      }).filter(issue => !isNaN(issue.lat) && !isNaN(issue.lng) && issue.lat !== 0)
      
      setIssues(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleCardClick = (issue) => {
    setActiveLocation({ lat: issue.lat, lng: issue.lng })
    // Click hote hi map par popup automatic open ho jaye
    const marker = markerRefs.current[issue.id]
    if (marker) {
      marker.openPopup()
    }
  }

  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Live Intelligence</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Issue Heatmap</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '36px' }}>Real-time civic issues across the city. Driven strictly by verified database coordinates.</p>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {Object.entries(severityColor).map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
              <span style={{ color: '#9090bb', fontSize: '13px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Map Container */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a4a', height: '500px' }}>
          <MapContainer center={[26.9124, 75.7873]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            
            <MapController activeLocation={activeLocation} issues={issues} />

            {issues.map((issue) => (
              <div key={issue.id}>
                <Circle
                  center={[issue.lat, issue.lng]}
                  radius={100 + (issue.votes || 0) * 4} 
                  pathOptions={{ 
                    color: severityColor[issue.severity] || '#FFB300', 
                    fillColor: severityColor[issue.severity] || '#FFB300', 
                    fillOpacity: 0.25,
                    weight: 1.5
                  }}
                />
                <Marker 
                  position={[issue.lat, issue.lng]}
                  ref={(el) => (markerRefs.current[issue.id] = el)}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px', minWidth: '160px' }}>
                      <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>{issue.title || 'Civic Issue'}</strong>
                      <span style={{ color: '#555', fontSize: '12px', display: 'block' }}><b>Location:</b> {issue.location}</span>
                      <span style={{ color: severityColor[issue.severity] || '#FFB300', fontSize: '12px', display: 'block' }}><b>Severity:</b> {issue.severity || 'Medium'}</span>
                      <span style={{ color: '#8b8bff', fontSize: '12px', display: 'block', fontWeight: '700', marginTop: '4px' }}>🔥 {issue.votes || 0} Votes</span>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>

        {/* Interactive Issue Cards */}
        <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', marginTop: '48px', marginBottom: '16px' }}>Explore Nearby Issues</h2>
        
        {loading ? (
          <div style={{ color: '#9090bb', textAlign: 'center', padding: '40px' }}>Loading live database coordinates...</div>
        ) : issues.length === 0 ? (
          <div style={{ color: '#9090bb', textAlign: 'center', padding: '40px' }}>No issues currently found on the map. Please add technical locations via Report form.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {issues.map((issue) => (
              <div 
                key={issue.id} 
                onClick={() => handleCardClick(issue)}
                style={{ 
                  backgroundColor: '#1a1a38', 
                  border: activeLocation?.lat === issue.lat ? `1px solid ${severityColor[issue.severity] || '#8b8bff'}` : '1px solid #2a2a4a', 
                  borderRadius: '14px', 
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{issue.title || 'Civic Issue'}</span>
                  <span style={{ backgroundColor: (severityColor[issue.severity] || '#FFB300') + '22', color: severityColor[issue.severity] || '#FFB300', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>
                    {issue.severity || 'Medium'}
                  </span>
                </div>
                <p style={{ color: '#9090bb', fontSize: '13px', marginTop: '6px' }}>{issue.location}</p>
                <p style={{ color: '#8b8bff', fontSize: '13px', fontWeight: '700', textAlign: 'right', marginTop: '12px' }}>
                  {issue.votes || 0} votes
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Map