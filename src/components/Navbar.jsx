import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, loginWithGoogle, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Report', path: '/report' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Map', path: '/map' },
    { label: 'AI Assistant', path: '/assistant' },
    { label: 'Authority', path: '/authority' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ]

  return (
    <nav style={{
      backgroundColor: 'rgba(18,18,42,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #2a2a4a',
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b8bff' }}></div>
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>
            Civic<span style={{ color: '#8b8bff' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: '24px' }} className="desktop-nav">
          {links.map((item, i) => (
            <Link key={i} to={item.path} style={{ color: '#9090bb', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-nav">
          {user ? (
            <>
              <img src={user.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #8b8bff' }} />
              <span style={{ color: '#9090bb', fontSize: '13px' }}>{user.displayName?.split(' ')[0]}</span>
              <button onClick={logout} style={{ backgroundColor: 'transparent', color: '#9090bb', padding: '8px 16px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', border: '1px solid #2a2a4a', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={loginWithGoogle} style={{ backgroundColor: 'transparent', color: '#9090bb', padding: '8px 16px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', border: '1px solid #2a2a4a', cursor: 'pointer' }}>
                Login
              </button>
              <button onClick={() => navigate('/report')} style={{ backgroundColor: '#8b8bff', color: '#12122a', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                Report Now
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-nav" style={{
          backgroundColor: 'transparent', border: '1px solid #2a2a4a',
          color: '#ffffff', width: '40px', height: '40px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-nav" style={{
          backgroundColor: '#0e0e22', borderTop: '1px solid #2a2a4a',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {links.map((item, i) => (
            <Link key={i} to={item.path} onClick={() => setMenuOpen(false)}
              style={{ color: '#9090bb', fontSize: '15px', textDecoration: 'none', fontWeight: '500', padding: '8px 0', borderBottom: '1px solid #1a1a38' }}>
              {item.label}
            </Link>
          ))}
          <div style={{ paddingTop: '8px', display: 'flex', gap: '10px' }}>
            {user ? (
              <button onClick={logout} style={{ flex: 1, backgroundColor: 'transparent', color: '#9090bb', padding: '10px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', border: '1px solid #2a2a4a', cursor: 'pointer' }}>
                Logout
              </button>
            ) : (
              <>
                <button onClick={loginWithGoogle} style={{ flex: 1, backgroundColor: 'transparent', color: '#9090bb', padding: '10px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', border: '1px solid #2a2a4a', cursor: 'pointer' }}>
                  Login
                </button>
                <button onClick={() => { navigate('/report'); setMenuOpen(false) }} style={{ flex: 1, backgroundColor: '#8b8bff', color: '#12122a', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Report Now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar