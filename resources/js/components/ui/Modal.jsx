import React from 'react';
import Card from './Card';
import { X, Activity } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fade-in">
            {/* Background scanner line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
                <div className="w-full h-[1px] bg-ef-accent animate-scan-line shadow-[0_0_15px_var(--ef-accent)]" />
            </div>

            <div className="w-full relative" style={{ maxWidth }}>
                <Card className="relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-t-4 border-t-ef-accent">
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
                        {title && (
                            <div className="flex flex-col">
                                <span className="ef-text-mono text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">Authorization_Dialog</span>
                                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-50 flex items-center gap-3">
                                    <Activity size={18} className="text-ef-accent animate-pulse" />
                                    {title}
                                </h2>
                            </div>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-sm transition-all ml-auto border border-transparent hover:border-zinc-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="relative">
                        {children}
                    </div>

                    {/* Footer HUD info */}
                    <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center opacity-20 pointer-events-none">
                        <div className="ef-text-mono text-[6px] uppercase tracking-widest leading-none">
                            SYS_MODAL_ACTIVE<br/>
                            V_2.4.0_SEC
                        </div>
                        <div className="w-12 h-1 bg-ef-accent/50"></div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Modal;
