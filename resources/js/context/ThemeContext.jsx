import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Modes: 'neon' (blue) or 'hazard' (orange)
    const [mode, setMode] = useState(() => localStorage.getItem('ef-mode') || 'neon');

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', mode);
        localStorage.setItem('ef-mode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode(prev => prev === 'neon' ? 'hazard' : 'neon');
    };

    return (
        <ThemeContext.Provider value={{ mode, isHazard: mode === 'hazard', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
