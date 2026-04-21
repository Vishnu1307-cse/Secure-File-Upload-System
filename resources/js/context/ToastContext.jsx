import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, message, type }]);

        if (duration !== Infinity) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
                {toasts.map((t) => (
                    <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ title, message, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" />,
        error: <AlertCircle className="text-red-500" />,
        info: <Info className="text-ef-accent" />,
        loading: <Loader2 className="animate-spin text-ef-accent" />
    };

    const bgColors = {
        success: 'border-emerald-500/20 bg-[#0c0c0e] text-emerald-500',
        error: 'border-red-500/20 bg-[#0c0c0e] text-red-500',
        info: 'border-ef-accent/20 bg-[#0c0c0e] text-ef-accent',
        loading: 'border-ef-accent/20 bg-[#0c0c0e] text-ef-accent'
    };

    return (
        <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg animate-fade-in flex gap-4 ${bgColors[type] || bgColors.info}`}>
            <div className="mt-0.5">{icons[type] || icons.info}</div>
            <div className="flex-1">
                {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
                <p className="text-sm opacity-90">{message}</p>
            </div>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
        </div>
    );
};

export const useToast = () => useContext(ToastContext);
