import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import RestrictedAccess from './pages/RestrictedAccess';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
    const { isAuthenticated, isAdmin, isApproved, isPending, isBanned } = useAuth();
    // Standard Route Guards
    const ProtectedRoute = ({ children, adminOnly = false }) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        
        // If pending or banned, move to restricted page unless already there
        if (!isApproved && !isAdmin) {
             return <Navigate to="/restricted" replace />;
        }

        if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
        return children;
    };

    const PublicRoute = ({ children }) => {
        if (isAuthenticated) {
            if (isBanned || isPending) return <Navigate to="/restricted" replace />;
            return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
        }
        return children;
    };

    return (
        <div className="flex justify-center items-center p-0 md:p-4 min-h-screen">
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/verify-otp" element={<PublicRoute><OtpVerifyPage /></PublicRoute>} />
                <Route path="/restricted" element={isAuthenticated ? <RestrictedAccess /> : <Navigate to="/login" replace />} />
                
                {/* Functional Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                
                {/* Fallbacks */}
                <Route path="/" element={
                    isAuthenticated ? (
                        (isBanned || isPending) ? <Navigate to="/restricted" replace /> : 
                        (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)
                    ) : <Navigate to="/login" replace />
                } />
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
