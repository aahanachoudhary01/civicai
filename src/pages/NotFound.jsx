import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      backgroundColor: '#12122a', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '24px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '120px', fontWeight: '900', color: '#1a1a38', lineHeight: '1', marginBottom: '0' }}>404</p>
        <div style={{ width: '80px', height: '4px', backgroundColor: '#8b8bff', borderRadius: '2px', margin: '-16px auto 32px' }}></div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ color: '#9090bb', fontSize: '16px', maxWidth: '400px', lineHeight: '1.6' }}>
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/')} style={{
          backgroundColor: '#8b8bff', color: '#12122a',
          padding: '12px 32px', borderRadius: '12px',
          fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer'
        }}>
          Go Home
        </button>
        <button onClick={() => navigate(-1)} style={{
          backgroundColor: 'transparent', color: '#CCCCFF',
          padding: '12px 32px', borderRadius: '12px',
          fontWeight: '600', fontSize: '15px',
          border: '1px solid #5C5C99', cursor: 'pointer'
        }}>
          Go Back
        </button>
      </div>
    </div>
  )
}

export default NotFound