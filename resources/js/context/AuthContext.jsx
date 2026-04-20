import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        try {
            if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                setToken(storedToken);
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && typeof parsedUser === 'object') {
                    setUser(parsedUser);
                }
            }
        } catch (e) {
            console.error("Auth initialization failed", e);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.clear();
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-display">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-xl font-bold tracking-widest uppercase opacity-50">Initializing Secure Layer...</div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
