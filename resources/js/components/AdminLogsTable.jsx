import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Search, Filter, RefreshCw, Clock, User as UserIcon, Activity, Globe, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

const AdminLogsTable = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [liveRefresing, setLiveRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const { toast } = useToast();

    const fetchLogs = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await api.get('/admin/logs');
            setLogs(response.data.data);
            if (isSilent) toast({ type: 'success', message: 'AUDIT_SIGNAL_SYNC', duration: 2000 });
        } catch (err) {
            toast({ type: 'error', message: 'AUDIT_LINK_FAILED' });
        } finally {
            setLoading(false);
            setLiveRefreshing(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                setLiveRefreshing(true);
                fetchLogs(true);
            }, 30000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs]);

    const filteredLogs = logs.filter(log => {
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        const matchesSearch = log.user?.email?.toLowerCase().includes(search.toLowerCase()) || 
                             log.action.toLowerCase().includes(search.toLowerCase());
        return matchesAction && matchesSearch;
    });

    const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action))];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 items-center bg-zinc-950/50 p-4 border border-zinc-900 rounded-sm backdrop-blur-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input 
                        type="text" 
                        placeholder="SEARCH_EVENT_CACHE..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 rounded-sm ef-text-mono text-[11px] text-zinc-200 outline-none transition-all placeholder:opacity-20"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="ef-text-mono text-[8px] font-black uppercase opacity-40">Filter_Sig:</span>
                    <select 
                        value={actionFilter} 
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-400 py-3 px-4 rounded-sm ef-text-mono text-[10px] font-black uppercase tracking-widest focus:border-ef-accent outline-none"
                    >
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4 border-l border-zinc-800 pl-4 ml-auto">
                    <div className="flex items-center gap-3">
                         <span className="ef-text-mono text-[10px] font-black uppercase tracking-widest text-zinc-600">Sync_Protocol</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:bg-ef-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-sm after:h-4 after:w-4 after:transition-all peer-checked:bg-ef-accent/20 border border-zinc-700"></div>
                        </label>
                    </div>
                    <button 
                        onClick={() => fetchLogs()} 
                        disabled={loading}
                        className={`p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-ef-accent transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <Card className="!p-0 overflow-hidden !border-t-0 bg-transparent shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-900 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Event_Signature</th>
                                <th className="px-6 py-4">Infiltration_Source</th>
                                <th className="px-6 py-4">System_IP</th>
                                <th className="px-6 py-4">Event_Timeline</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] ef-text-mono">
                            {loading && logs.length === 0 ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-6 py-4"><div className="h-10 bg-zinc-900/30 border border-zinc-800/30 animate-pulse" /></td></tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-24 text-center text-zinc-600 uppercase tracking-widest font-black">No_Security_Events_Found</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="group">
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-l border-zinc-900 group-hover:border-ef-accent/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    p-2 rounded-sm border
                                                    ${log.action.includes('FAILED') || log.action.includes('UNAUTHORIZED') 
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}
                                                `}>
                                                    <Activity size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-zinc-200 group-hover:text-ef-accent uppercase tracking-tighter">{log.action}</div>
                                                    <div className="text-[8px] opacity-30 mt-0.5">SIG_ID: {log.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30 opacity-90">
                                            <div className="flex items-center gap-3 font-bold text-zinc-300">
                                                <UserIcon size={14} className="opacity-80 text-ef-accent" />
                                                {log.user?.email || 'SYSTEM_NODE'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30 opacity-80">
                                            <div className="flex items-center gap-3 text-zinc-400">
                                                <Globe size={14} className="opacity-90 text-sky-400" />
                                                {log.metadata?.ip || '0.0.0.0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-r border-zinc-900 group-hover:border-ef-accent/30 text-zinc-400">
                                            <div className="flex items-center gap-3">
                                                <Clock size={14} className="opacity-80 text-ef-accent" />
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminLogsTable;
