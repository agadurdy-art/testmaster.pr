import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TestInterface from './pages/TestInterface';
import Results from './pages/Results';
import TipsPage from './pages/TipsPage';
import CoursesPage from './pages/CoursesPage';
import Profile from './pages/Profile';
import ContentAdmin from './pages/ContentAdmin';
import { Toaster } from './components/ui/sonner';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage onLogin={handleLogin} user={user} />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/test/:testType" 
            element={user ? <TestInterface user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/results/:attemptId" 
            element={user ? <Results user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/tips" 
            element={user ? <TipsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/courses" 
            element={user ? <CoursesPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/content" 
            element={<ContentAdmin />} 
          />
        {/* Emergent badge shown only on speaking test page */}
        {window.location.pathname.startsWith('/test/speaking') && (
          <a
            id="emergent-badge"
            target="_blank"
            rel="noreferrer"
            href="https://app.emergent.sh/?utm_source=emergent-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'fixed',
              bottom: 20,
              left: 20,
              textDecoration: 'none',
              padding: '6px 10px',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              fontSize: 12,
              zIndex: 9999,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <img
                style={{ width: 20, height: 20, marginRight: 8 }}
                src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
                alt="Emergent avatar"
              />
              <p
                style={{
                  color: '#000000',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
                  fontSize: 12,
                  alignItems: 'center',
                  marginBottom: 0
                }}
              >
                Made with Emergent
              </p>
            </div>
          </a>
        )}

        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;