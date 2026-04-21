import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import AdminLogsTable from '../components/AdminLogsTable';
import UserList from '../components/UserList';
import { 
    LayoutDashboard, Users, History, 
    Database, Activity, TrendingUp, 
    ShieldCheck, DownloadCloud, HardDrive, 
    FileUp, RefreshCcw, Sun, Moon, LogOut, Loader2
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
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const fetchStats = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
            if (isSilent) toast({ type: 'success', message: 'Telemetry updated.' });
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else if (!isSilent) {
                toast({ type: 'error', message: 'Core telemetry offline.' });
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
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <header className="mb-10 flex flex-wrap gap-6 justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-emerald-500 tracking-tight mb-2">Command Center</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">System-wide monitoring and vault security audit.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/dashboard')} 
                        className="!w-auto bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 border border-primary-500/20 px-4"
                    >
                        <HardDrive size={18} /> My Vault
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => fetchStats(true)} 
                        className="!w-auto bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-4"
                    >
                        <RefreshCcw size={18} /> Sync Telemetry
                    </Button>
                    <Button variant="ghost" onClick={toggleTheme} className="p-2 !w-auto">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="p-2 !w-auto text-red-500 hover:bg-red-500/10">
                        <LogOut size={20} />
                    </Button>
                </div>
            </header>

            {/* Admin Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <StatCard 
                    title="Population" 
                    value={stats?.totals?.users || 0} 
                    icon={<Users size={24} />} 
                    color="emerald" 
                    subtitle="Registered Identities"
                />
                <StatCard 
                    title="Storage" 
                    value={stats?.totals?.files || 0} 
                    icon={<Database size={24} />} 
                    color="blue" 
                    subtitle="Encrypted Data Units"
                />
                <StatCard 
                    title="Throughput" 
                    value={stats?.performance?.total_downloads || 0} 
                    icon={<DownloadCloud size={24} />} 
                    color="amber" 
                    subtitle="Decryption Injections"
                />
                <StatCard 
                    title="Security Audits" 
                    value={stats?.totals?.logs || 0} 
                    icon={<Activity size={24} />} 
                    color="indigo" 
                    subtitle="Immutable Log Entries"
                />
            </div>

            {/* Main Tabs Navigation */}
            <Card className="!p-1.5 mb-8 flex gap-1 rounded-2xl bg-zinc-100/50 dark:bg-slate-900/50" animate={false}>
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={18} />} label="Security Audit Feed" />
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<ShieldCheck size={18} />} label="Access Management" />
                <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<TrendingUp size={18} />} label="System Performance" />
            </Card>

            {/* Tab Content */}
            <div className="animate-fade-in min-h-[400px]">
                {loading && !stats ? (
                   <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <span className="font-bold tracking-widest uppercase text-sm">Synchronizing Data Layer...</span>
                   </div>
                ) : (
                    <>
                        {activeTab === 'logs' && <AdminLogsTable />}
                        {activeTab === 'users' && <UserList />}
                        {activeTab === 'system' && <SystemPerformanceView stats={stats} />}
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
    const colorClasses = {
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    };

    const classes = colorClasses[color] || colorClasses.emerald;
    const [textColor, bgColor, borderColor] = classes.split(' ');

    return (
        <Card className={`!p-6 border-l-4 !rounded-2xl flex flex-col justify-between ${borderColor}`} animate={false}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${bgColor} ${textColor}`}>{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-slate-900 dark:text-zinc-50">System Node</span>
            </div>
            <div className="space-y-1">
                <div className="text-4xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-zinc-50">{value}</div>
                <div className="font-bold text-sm text-slate-700 dark:text-zinc-300">{title}</div>
                <div className="text-[10px] uppercase font-medium opacity-50 tracking-tighter text-slate-500 dark:text-zinc-500">{subtitle}</div>
            </div>
        </Card>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all
            ${active 
                ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-zinc-200 dark:border-slate-700' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-slate-800/50'}
        `}
    >
        {icon} <span className="hidden sm:inline">{label}</span>
    </button>
);

const SystemPerformanceView = ({ stats }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="!p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FileUp size={20} /></div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Content Infiltration Leaderboard</h2>
            </div>
            <div className="space-y-4">
                {stats?.top_downloaded_files?.length > 0 ? stats.top_downloaded_files.map((file, idx) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black opacity-20 text-slate-900 dark:text-zinc-50">0{idx + 1}</span>
                            <span className="font-bold text-sm text-slate-900 dark:text-zinc-50">{file.file_name}</span>
                        </div>
                        <span className="text-xs font-black bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full">{file.download_count} Streams</span>
                    </div>
                )) : (
                    <div className="text-center py-10 opacity-30 italic">No infiltration data recorded.</div>
                )}
            </div>
        </Card>
        
        <Card className="!p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Users size={20} /></div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Identity Engagement Audit</h2>
            </div>
            <div className="space-y-4">
                {stats?.most_active_users?.length > 0 ? stats.most_active_users.map((user, idx) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black opacity-20 text-slate-900 dark:text-zinc-50">0{idx + 1}</span>
                            <span className="font-bold text-sm text-slate-900 dark:text-zinc-50">{user.email}</span>
                        </div>
                        <span className="text-xs font-black bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">{user.login_count} Sessions</span>
                    </div>
                )) : (
                    <div className="text-center py-10 opacity-30 italic">No engagement data recorded.</div>
                )}
            </div>
        </Card>
    </div>
);

export default AdminDashboard;
