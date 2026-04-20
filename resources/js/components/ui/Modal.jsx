import React from 'react';
import Card from './Card';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full" style={{ maxWidth }}>
                <Card className="relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        {title && <h2 className="text-xl font-bold flex items-center gap-3">{title}</h2>}
                        <button 
                            onClick={onClose} 
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export default Modal;
