import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
