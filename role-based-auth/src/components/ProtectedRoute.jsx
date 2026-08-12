import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0d0e12',
        color: '#a0aec0',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '15px'
        }}></div>
        <p>Restoring Secure Session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not logged in, redirect to login page, preserving path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role checking is needed and user does not have permission, redirect to unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
