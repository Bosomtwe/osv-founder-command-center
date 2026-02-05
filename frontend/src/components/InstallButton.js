import React, { useState, useEffect } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
      setIsStandalone(isStandalone);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkStandalone();
    handleResize();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  // Don't show button if app is already installed or can't be installed
  if (isStandalone || !deferredPrompt || !isMobile) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, #1976d2, #2196f3)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 9999,
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.5)';
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
      }}
    >
      <span style={{ fontSize: '20px' }}>📲</span>
      <span>Install App</span>
    </button>
  );
}

export default InstallButton;