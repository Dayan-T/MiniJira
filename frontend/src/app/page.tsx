'use client'

export default function Home() {
  const login = async () => {
    alert('Login clicked!') 
    
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'owner@example.com',
          password: 'test1234'
        })
      })
      
      const data = await res.json()
      console.log('Login response:', data)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>MiniJira</h1>
      <button 
        onClick={login}
        style={{
          padding: '1rem 2rem',
          background: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Login Owner
      </button>
    </div>
  )
}
