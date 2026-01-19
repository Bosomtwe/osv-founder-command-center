import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div>
      {authenticated ? (
        <Dashboard />
      ) : (
        <Login onLogin={() => setAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;