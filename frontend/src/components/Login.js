import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfReady, setCsrfReady] = useState(false);

  // Initialize CSRF token on mount
  useEffect(() => {
    const setupCSRF = async () => {
      try {
        await authAPI.getCSRFToken();
        setCsrfReady(true);
      } catch (err) {
        console.error('CSRF setup failed:', err);
        if (err.response && err.response.status === 404) {
          setError('Cannot connect to server. Please try again later.');
        } else {
          setError('Server connection issue. Please try again.');
        }
      }
    };
    setupCSRF();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfReady) {
      setError('Server connection not ready. Please wait...');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.login(username, password);
      
      if (result.user) {
        onLoginSuccess(result.user);
      } else {
        setError('Login successful but no user data received');
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400 || status === 401) {
          setError(data.error || data.detail || 'Invalid username or password');
        } else if (status === 403) {
          setError('Security token issue. Please refresh the page.');
        } else if (status === 404) {
          setError('Service unavailable. Please try again later.');
        } else {
          setError(`Server error (${status}). Please try again.`);
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid #eaeaea'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#1976d2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 15px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          OSV
        </div>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#333', 
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Founder Command Center
        </h2>
        <p style={{ 
          color: '#666', 
          fontSize: '14px',
          margin: 0
        }}>
          Sign in to your account
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#555',
            fontSize: '14px'
          }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '14px', 
              boxSizing: 'border-box',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none',
              transition: 'border 0.2s',
              backgroundColor: '#fafafa'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1976d2'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#555',
            fontSize: '14px'
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '14px', 
              boxSizing: 'border-box',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none',
              transition: 'border 0.2s',
              backgroundColor: '#fafafa'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1976d2'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !csrfReady}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: loading || !csrfReady ? '#9ca3af' : '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '15px', 
            cursor: loading || !csrfReady ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'background 0.2s',
            height: '46px'
          }}
          onMouseOver={(e) => {
            if (!loading && csrfReady) e.target.style.background = '#1565c0';
          }}
          onMouseOut={(e) => {
            if (!loading && csrfReady) e.target.style.background = '#1976d2';
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>⏳</span>
              Signing in...
            </>
          ) : csrfReady ? (
            'Sign In'
          ) : (
            'Connecting...'
          )}
        </button>
        
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            marginTop: '20px', 
            padding: '12px', 
            background: '#ffebee', 
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '14px',
            border: '1px solid #ffcdd2'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {!csrfReady && !error && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#f5f5f5', 
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#666',
            border: '1px solid #eee'
          }}>
            Establishing secure connection...
          </div>
        )}
      </form>
      
      <div style={{ 
        marginTop: '30px', 
        paddingTop: '20px', 
        borderTop: '1px solid #eee',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#999',
          margin: 0
        }}>
          © {new Date().getFullYear()} OSV Founder Command Center. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;