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
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;