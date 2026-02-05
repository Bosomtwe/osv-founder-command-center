import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InstallButton from './components/InstallButton';
import { authAPI } from './api';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // 1. First, get CSRF token
        try {
          await authAPI.getCSRFToken();
          console.log('CSRF token obtained');
        } catch (csrfError) {
          console.warn('CSRF token fetch failed (might be okay):', csrfError.message);
        }
        
        // 2. Check if user is already logged in
        const authData = await authAPI.checkAuth();
        
        console.log('Auth check result:', authData);
        if (authData.authenticated && authData.user) {
          setAuthenticated(true);
          setUser(authData.user);
          console.log('User already authenticated:', authData.user.username);
        } else {
          setAuthenticated(false);
          setUser(null);
          console.log('User not authenticated');
        }
      } catch (error) {
        // This is NORMAL - user is not logged in
        console.log('User not authenticated (expected):', error.message);
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log('Login successful for:', userData.username);
    setAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await authAPI.logout();
    setAuthenticated(false);
    setUser(null);
    console.log('Logged out successfully');
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isMobile ? '#f5f5f5' : '#f9fafb'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            width: isMobile ? '50px' : '40px',
            height: isMobile ? '50px' : '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ 
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: '500'
          }}>
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      {authenticated ? (
        <>
          <Dashboard user={user} onLogout={handleLogout} />
          <InstallButton />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;