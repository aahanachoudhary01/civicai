import Navbar from '../components/Navbar'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const issues = [
  { id: 1, title: 'Large pothole near bus stand', category: 'Pothole', severity: 'High', lat: 26.9124, lng: 75.7873, votes: 47 },
  { id: 2, title: 'Street light not working', category: 'Streetlight', severity: 'Medium', lat: 26.9200, lng: 75.7800, votes: 23 },
  { id: 3, title: 'Water leakage on main road', category: 'Water Leakage', severity: 'High', lat: 26.9050, lng: 75.7950, votes: 61 },
  { id: 4, title: 'Garbage not collected', category: 'Garbage', severity: 'Medium', lat: 26.9300, lng: 75.7700, votes: 38 },
  { id: 5, title: 'Open drain causing accidents', category: 'Open Drain', severity: 'Critical', lat: 26.9150, lng: 75.8000, votes: 82 },
]

const severityColor = { Low: '#4ade80', Medium: '#FFB300', High: '#ff6b6b', Critical: '#ff3b3b' }

function Map() {
  return (
    <div style={{ backgroundColor: '#12122a', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '140px 24px 80px' }}>

        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#5C5C99', textTransform: 'uppercase', marginBottom: '12px' }}>Live Intelligence</p>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>Issue Heatmap</h1>
        <p style={{ color: '#9090bb', fontSize: '15px', marginBottom: '36px' }}>Real-time civic issues across the city. Red zones indicate high-density problem areas.</p>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {Object.entries(severityColor).map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
              <span style={{ color: '#9090bb', fontSize: '13px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a4a', height: '500px' }}>
          <MapContainer center={[26.9124, 75.7873]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            {issues.map((issue) => (
              <div key={issue.id}>
                <Circle
                  center={[issue.lat, issue.lng]}
                  radius={300}
                  pathOptions={{ color: severityColor[issue.severity], fillColor: severityColor[issue.severity], fillOpacity: 0.3 }}
                />
                <Marker position={[issue.lat, issue.lng]}>
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif' }}>
                      <strong>{issue.title}</strong><br />
                      Category: {issue.category}<br />
                      Severity: {issue.severity}<br />
                      Votes: {issue.votes}
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>

        {/* Issue List below map */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {issues.map((issue) => (
            <div key={issue.id} style={{ backgroundColor: '#1a1a38', border: '1px solid #2a2a4a', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{issue.title}</span>
                <span style={{ backgroundColor: severityColor[issue.severity] + '22', color: severityColor[issue.severity], padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>
                  {issue.severity}
                </span>
              </div>
              <p style={{ color: '#9090bb', fontSize: '13px' }}>{issue.category} &nbsp;·&nbsp; {issue.votes} votes</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Map