import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/layout';
import Navbar from './components/layout/navbar';
import Sidebar from './components/layout/sidebar';

// Page imports (will be created in Phase 3)
// import LoginPage from './Pages/LoginPage';
// import SignupPage from './Pages/SignupPage';
// import DashboardPage from './Pages/DashboardPage';
// import UsersPage from './Pages/UsersPage';

const LoginPage = () => <div className="flex items-center justify-center min-h-screen">Login Page</div>;
const SignupPage = () => <div className="flex items-center justify-center min-h-screen">Signup Page</div>;
const DashboardPage = () => <div className="flex items-center justify-center min-h-screen">Dashboard Page</div>;
const UsersPage = () => <div className="flex items-center justify-center min-h-screen">Users Page</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes - without sidebar/navbar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes - with Layout */}
        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="/" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;