import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, Loader2, Radar, Lock, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';

const RestrictedAccess = () => {
    const { user, logout, isBanned, isPending } = useAuth();
    const { mode } = useTheme();

    const getStatusContent = () => {
        if (isBanned) {
            return {
                title: "Identity_Purged",
                subtitle: "CRITICAL_REVOCATION_ACTIVE",
                description: "Your credentials have been permanently revoked by the Strategic Command. Access to all data nodes and vault records is terminated.",
                icon: <ShieldAlert className="text-red-500 w-20 h-20" />,
                accentColor: "red"
            };
        }
        return {
            title: "Authorization_Pending",
            subtitle: "WAITING_FOR_ADMIN_LINK",
            description: "Your registration request has been received and is currently in the authorization queue. Tactical access will be granted once an administrator verifies your identity.",
            icon: <Radar className="text-ef-accent w-20 h-20 animate-pulse" />,
            accentColor: "blue"
        };
    };

    const content = getStatusContent();

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Hud Decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] ef-text-mono text-[15vw] font-black italic rotate-[-10deg] leading-none uppercase">Restricted</div>
                <div className="absolute bottom-[10%] right-[10%] ef-text-mono text-[15vw] font-black italic rotate-[5deg] leading-none uppercase opacity-50">Authorized_Only</div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-[#0c0c0e] border border-zinc-900 border-t-4 shadow-2xl relative overflow-hidden" 
                     style={{ borderTopColor: isBanned ? '#ef4444' : 'var(--ef-accent)' }}>
                    
                    {/* Animated Grid Scan */}
                    <div className="absolute inset-x-0 h-[2px] bg-ef-accent/20 animate-scan-line top-0 z-20 pointer-events-none" />

                    <div className="p-12">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="relative">
                                <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full bg-${content.accentColor}-500 animate-pulse`} />
                                <div className="relative z-10 p-6 bg-zinc-950 border border-zinc-900 rounded-sm">
                                    {content.icon}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Activity size={14} className="text-zinc-600" />
                                    <span className="ef-text-mono text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase">{content.subtitle}</span>
                                </div>
                                <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase ef-text-mono leading-none">
                                    {content.title}
                                </h1>
                                <div className="h-1 w-20 bg-ef-accent mx-auto mt-4" style={{ backgroundColor: isBanned ? '#ef4444' : 'var(--ef-accent)' }} />
                            </div>

                            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md uppercase tracking-tight">
                                {content.description}
                            </p>

                            <div className="w-full pt-10 space-y-4">
                                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500">
                                        <span>Node_Identity</span>
                                        <span className="text-zinc-300">[{user?.email}]</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500">
                                        <span>Department</span>
                                        <span className="text-zinc-300">{user?.department || 'UNSPECIFIED'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500">
                                        <span>Status</span>
                                        <span className={isBanned ? 'text-red-500' : 'text-ef-accent'}>{user?.status?.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button 
                                        variant="ghost" 
                                        onClick={logout} 
                                        className="w-full !py-4 flex items-center justify-center gap-2 hover:bg-zinc-900"
                                    >
                                        <LogOut size={16} />
                                        <span>Disconnect Protocol</span>
                                    </Button>
                                    {!isBanned && (
                                        <div className="w-full px-6 py-4 bg-ef-accent/10 border border-ef-accent/20 flex items-center justify-center gap-3">
                                            <Loader2 size={16} className="text-ef-accent animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-ef-accent">Syncing Authorization...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HUD Footer Decor */}
                    <div className="bg-zinc-950/80 px-8 py-3 border-t border-zinc-900 flex justify-between items-center opacity-40">
                        <div className="flex gap-4">
                            <Lock size={12} />
                            <div className="ef-text-mono text-[8px] font-bold uppercase tracking-widest leading-none translate-y-[2px]">Secured_Field_Link_Active</div>
                        </div>
                        <div className="ef-text-mono text-[8px] font-bold uppercase">v2.4.9-RESTRICTED</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestrictedAccess;
