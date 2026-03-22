import { useEffect, useState } from 'react';

function App() {
  const [health, setHealth] = useState<{ status: string; timestamp: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '2rem',
      fontFamily: 'system-ui, sans-serif',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
        FamilyWall Kiosk
      </div>
      <div style={{ fontSize: '1.5rem', color: '#666' }}>
        {health ? (
          <>
            <div style={{ color: '#22c55e' }}>✓ System Online</div>
            <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
              Backend: Connected
            </div>
          </>
        ) : error ? (
          <>
            <div style={{ color: '#ef4444' }}>✗ Connection Error</div>
            <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
              {error}
            </div>
          </>
        ) : (
          <div>Connecting...</div>
        )}
      </div>
      <div style={{ fontSize: '1rem', color: '#999', marginTop: '2rem' }}>
        Infrastructure deployment verified
      </div>
    </div>
  );
}

export default App;
