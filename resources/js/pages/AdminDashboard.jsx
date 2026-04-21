import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import AdminLogsTable from '../components/AdminLogsTable';
import UserList from '../components/UserList';
import AdminFilesTable from '../components/AdminFilesTable';
import {
    LayoutDashboard, Users, History,
    Database, Activity, TrendingUp,
    ShieldCheck, DownloadCloud, HardDrive,
    FileUp, RefreshCcw, Sun, Moon, LogOut, Loader2,
    ShieldAlert, Radar, Terminal, UserPlus
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs');
    const { mode, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const fetchStats = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
            if (isSilent) toast({ type: 'success', message: 'TELEMETRY_LINK_SYNC' });
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else if (!isSilent) {
                toast({ type: 'error', message: 'CRITICAL: HUD_DATA_LOSS' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-6">
            <header className="mb-12 flex flex-wrap gap-8 justify-between items-end border-b border-zinc-800 pb-10 relative overflow-hidden">
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Terminal size={16} className="text-ef-accent opacity-50" />
                        <span className="ef-text-mono text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Admin Panel</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
                        Secure File Vault <ShieldAlert size={32} className="text-ef-accent" />
                    </h1>
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                        <Radar size={14} className="text-emerald-500 animate-pulse" /> System_Wide_Diagnostic_Active
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="!px-4 bg-ef-accent/10 text-ef-accent border-ef-accent/20 hover:bg-ef-accent/20"
                    >
                        MY_VAULT [📂]
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => fetchStats(true)}
                        className="!px-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    >
                        SYNC_HUD [♻️]
                    </Button>
                    <button
                        onClick={toggleTheme}
                        className={`
                            px-4 py-2 border ef-text-mono text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105
                            ${mode === 'hazard' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-sky-500/10 border-sky-500 text-sky-400'}
                        `}
                    >
                        {mode === 'hazard' ? 'SWITCH_TO_NEON' : 'SWITCH_TO_HAZARD'}
                    </button>
                    <Button variant="ghost" onClick={handleLogout} className="!w-auto !p-2 text-red-400 border-red-500/20 hover:bg-red-500/10">
                        <LogOut size={20} />
                    </Button>
                </div>

                {/* Background HUD Label */}
                <div className="absolute top-[-20px] right-20 ef-text-mono text-[100px] font-black italic opacity-5 pointer-events-none uppercase text-white">COMMAND</div>
            </header>

            {/* Admin Stat HUD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <StatCard
                    title="Population"
                    value={stats?.totals?.users || 0}
                    icon={<Users size={24} />}
                    color="neon"
                    subtitle="ID_RECORDS"
                />
                <StatCard
                    title="Storage"
                    value={stats?.totals?.files || 0}
                    icon={<Database size={24} />}
                    color="neon"
                    subtitle="DATA_NODES"
                />
                <StatCard
                    title="Throughput"
                    value={stats?.performance?.total_downloads || 0}
                    icon={<DownloadCloud size={24} />}
                    color="neon"
                    subtitle="DECRYPT_LINK"
                />
                <StatCard
                    title="Logs"
                    value={stats?.totals?.logs || 0}
                    icon={<Activity size={24} />}
                    color="neon"
                    subtitle="EVENT_QUEUE"
                />
                <StatCard
                    title="Queue"
                    value={stats?.totals?.pending_users || 0}
                    icon={<UserPlus size={24} className={stats?.totals?.pending_users > 0 ? 'animate-pulse' : ''} />}
                    color="hazard"
                    subtitle="AUTH_QUEUE"
                />
            </div>

            {/* Main Tabs Navigation */}
            <div className="mb-10 flex flex-wrap gap-2">
                <AdminTabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={18} />} label="Security Audit Feed" />
                <AdminTabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<ShieldCheck size={18} />} label="Access Management" />
                <AdminTabButton 
                    active={activeTab === 'queue'} 
                    onClick={() => setActiveTab('queue')} 
                    icon={<UserPlus size={18} />} 
                    label={stats?.totals?.pending_users > 0 ? `Auth Queue (${stats.totals.pending_users})` : "Auth Queue"} 
                />
                <AdminTabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')} icon={<Database size={18} />} label="Master File Registry" />
                <AdminTabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<TrendingUp size={18} />} label="System Performance" />
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in min-h-[500px] relative">
                {loading && !stats ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20 relative">
                        <Loader2 className="animate-spin mb-6 text-ef-accent" size={64} />
                        <span className="ef-text-mono font-black tracking-[1em] uppercase text-sm text-white">Synchronizing_Neural_Link...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'logs' && <AdminLogsTable />}
                        {activeTab === 'users' && <UserList mode="all" />}
                        {activeTab === 'queue' && <UserList mode="pending" />}
                        {activeTab === 'files' && <AdminFilesTable />}
                        {activeTab === 'system' && <SystemPerformanceView stats={stats} />}
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
    return (
        <Card className="!p-6 ef-corner-border bg-zinc-950 shadow-inner group hover:border-ef-accent transition-all border-zinc-800">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-zinc-900 border border-zinc-800 text-ef-accent rounded-sm group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="text-right">
                    <div className="ef-text-mono text-[8px] font-black uppercase tracking-widest opacity-60 text-zinc-400">{subtitle}</div>
                    <div className="text-[10px] font-black uppercase text-zinc-100">Live_Status</div>
                </div>
            </div>
            <div>
                <div className="text-5xl font-black italic tracking-tighter text-white ef-text-mono mb-1">{value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ef-accent opacity-80">{title}</div>
            </div>

            {/* Background Decoration */}
            <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none flex gap-1">
                <div className="w-1 h-3 bg-ef-accent"></div>
                <div className="w-1 h-3 bg-ef-accent opacity-50"></div>
                <div className="w-1 h-3 bg-ef-accent opacity-20"></div>
            </div>
        </Card>
    );
};

const AdminTabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-3 py-3 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ef-text-mono relative
            ${active
                ? 'bg-ef-accent text-zinc-950 border border-ef-accent shadow-[0_0_15px_rgba(var(--ef-accent-rgb),0.3)]'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white hover:bg-zinc-700'}
        `}
    >
        {icon}
        <span>{label}</span>
        {active && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-zinc-950 m-1" />}
    </button>
);

const SystemPerformanceView = ({ stats }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="!p-0 overflow-hidden !border-t-0 bg-transparent shadow-none">
            <div className="flex items-center gap-3 mb-8 p-3 bg-zinc-950 border-l-4 border-ef-accent">
                <FileUp size={18} className="text-ef-accent" />
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-50">Content Infiltration Audit</h2>
            </div>
            <div className="space-y-3">
                {stats?.top_downloaded_files?.length > 0 ? stats.top_downloaded_files.map((file, idx) => (
                    <div key={file.id} className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-ef-accent transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="ef-text-mono text-[10px] font-black opacity-30">0{idx + 1}</span>
                            <span className="font-bold text-sm text-zinc-100">{file.file_name}</span>
                        </div>
                        <span className="ef-text-mono text-[10px] font-black text-ef-accent bg-ef-accent/10 px-3 py-1 rounded-sm border border-ef-accent/20">
                            {file.download_count} STREAMS
                        </span>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 border-dashed rounded-sm opacity-20">
                        <Terminal size={32} className="mb-4" />
                        <span className="ef-text-mono text-[10px] uppercase font-black uppercase tracking-[0.5em]">No_Infiltration_Data</span>
                    </div>
                )}
            </div>
        </Card>

        <Card className="!p-0 overflow-hidden !border-t-0 bg-transparent shadow-none">
            <div className="flex items-center gap-3 mb-8 p-3 bg-zinc-950 border-l-4 border-ef-accent">
                <Users size={18} className="text-ef-accent" />
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-50">Identity Engagement Audit</h2>
            </div>
            <div className="space-y-3">
                {stats?.most_active_users?.length > 0 ? stats.most_active_users.map((user, idx) => (
                    <div key={user.id} className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-ef-accent transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="ef-text-mono text-[10px] font-black opacity-30">0{idx + 1}</span>
                            <span className="font-bold text-sm text-zinc-100">{user.email}</span>
                        </div>
                        <span className="ef-text-mono text-[10px] font-black text-ef-accent bg-ef-accent/10 px-3 py-1 rounded-sm border border-ef-accent/20">
                            {user.login_count} SESSIONS
                        </span>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 border-dashed rounded-sm opacity-20">
                        <Terminal size={32} className="mb-4" />
                        <span className="ef-text-mono text-[10px] uppercase font-black uppercase tracking-[0.5em]">No_Engagement_Data</span>
                    </div>
                )}
            </div>
        </Card>
    </div>
);

export default AdminDashboard;
