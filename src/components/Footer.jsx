import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer style={{ backgroundColor: '#0e0e22', borderTop: '1px solid #2a2a4a', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b8bff' }}></div>
            <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '18px' }}>Civic<span style={{ color: '#8b8bff' }}>AI</span></span>
          </div>
          <p style={{ color: '#9090bb', fontSize: '13px' }}>India's Smartest Civic Intelligence Platform</p>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Home', path: '/' },
            { label: 'Report Issue', path: '/report' },
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Live Map', path: '/map' },
          ].map((item, i) => (
            <Link key={i} to={item.path} style={{ color: '#9090bb', fontSize: '13px', textDecoration: 'none' }}>{item.label}</Link>
          ))}
        </div>

        <p style={{ color: '#5C5C99', fontSize: '12px' }}>Powered by Gemini AI + Google Cloud</p>
      </div>
    </footer>
  )
}

export default Footer