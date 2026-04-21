import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
        isApproved: user?.status === 'approved',
        isPending: user?.status === 'pending',
        isBanned: user?.status === 'banned',
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white font-display relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05),transparent)] pointer-events-none" />
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-ef-accent animate-spin mb-6" />
                        <div className="absolute inset-0 blur-xl bg-ef-accent/20 animate-pulse rounded-full" />
                    </div>
                    <div className="ef-text-mono text-xs font-black tracking-[1em] uppercase text-zinc-500 animate-pulse">Initializing_Tactical_Link</div>
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
