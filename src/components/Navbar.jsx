import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, loginWithGoogle, logout } = useAuth()

  return (
    <nav style={{
      backgroundColor: 'rgba(18,18,42,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #2a2a4a',
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '18px 32px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b8bff' }}></div>
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>
            Civic<span style={{ color: '#8b8bff' }}>AI</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Home', path: '/' },
            { label: 'Report', path: '/report' },
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Map', path: '/map' },
            { label: 'AI Assistant', path: '/assistant' },
            { label: 'Authority', path: '/authority' },
            { label: 'Leaderboard', path: '/leaderboard' },
          ].map((item, i)  => (
            <Link key={i} to={item.path} style={{ color: '#9090bb', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <img src={user.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #8b8bff' }} />
              <span style={{ color: '#9090bb', fontSize: '13px' }}>{user.displayName?.split(' ')[0]}</span>
              <button onClick={logout} style={{
                backgroundColor: 'transparent', color: '#9090bb',
                padding: '8px 16px', borderRadius: '10px', fontWeight: '600',
                fontSize: '13px', border: '1px solid #2a2a4a', cursor: 'pointer'
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={loginWithGoogle} style={{
                backgroundColor: 'transparent', color: '#9090bb',
                padding: '8px 16px', borderRadius: '10px', fontWeight: '600',
                fontSize: '13px', border: '1px solid #2a2a4a', cursor: 'pointer'
              }}>
                Login
              </button>
              <button onClick={() => navigate('/report')} style={{
                backgroundColor: '#8b8bff', color: '#12122a',
                padding: '10px 24px', borderRadius: '10px',
                fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer'
              }}>
                Report Now
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar