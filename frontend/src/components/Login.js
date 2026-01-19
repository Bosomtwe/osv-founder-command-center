import React, { useState, useEffect } from 'react';
import api from '../api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login if already authenticated
  useEffect(() => {
    api.get('tasks/')
      .then(() => onLogin())
      .catch(() => {});
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('login/', { username, password });  // ← Correct: /api/login/
      onLogin();
    } catch (err) {
      setError('Invalid username or password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '40px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        OSV Founder Command Center
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '15px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '20px', fontSize: '16px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;