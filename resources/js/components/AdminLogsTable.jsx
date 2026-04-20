import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Search, Filter, RefreshCw, Clock, User as UserIcon, Activity, Globe } from 'lucide-react';
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
            if (isSilent) toast({ type: 'success', message: 'Logs updated.', duration: 2000 });
        } catch (err) {
            toast({ type: 'error', message: 'Failed to fetch audit logs.' });
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
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search system logs..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <select 
                        value={actionFilter} 
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 py-2.5 px-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 border border-zinc-200 dark:border-slate-800 px-4 py-2.5 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Auto Refresh</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                    {liveRefresing && <RefreshCw size={14} className="animate-spin text-emerald-500" />}
                </div>
            </div>

            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 bg-zinc-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4">Security Event</th>
                                <th className="px-6 py-4">Initiator</th>
                                <th className="px-6 py-4">Source IP</th>
                                <th className="px-6 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-slate-800/50 text-sm">
                            {loading && logs.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-6 py-6"><div className="h-5 bg-zinc-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-500">No security logs recorded.</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-2 rounded-lg
                                                    ${log.action.includes('FAILED') || log.action.includes('UNAUTHORIZED') 
                                                        ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}
                                                `}>
                                                    <Activity size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-zinc-50">{log.action}</div>
                                                    <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono text-slate-500 dark:text-zinc-500">ID: {log.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-medium opacity-80 text-slate-700 dark:text-zinc-300">
                                                <UserIcon size={14} className="opacity-50" />
                                                {log.user?.email || 'System / Guest'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                                <Globe size={14} className="opacity-40" />
                                                {log.metadata?.ip || '0.0.0.0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="opacity-40" />
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
