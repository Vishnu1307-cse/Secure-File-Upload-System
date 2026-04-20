import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    // Standard Route Guards
    const ProtectedRoute = ({ children, adminOnly = false }) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
        return children;
    };

    const PublicRoute = ({ children }) => {
        if (isAuthenticated) {
            return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
        }
        return children;
    };

    return (
        <div className="flex justify-center items-center p-0 md:p-4 min-h-screen">
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/verify-otp" element={<PublicRoute><OtpVerifyPage /></PublicRoute>} />
                
                {/* Functional Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                
                {/* Fallbacks */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

function Root() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default Root;
