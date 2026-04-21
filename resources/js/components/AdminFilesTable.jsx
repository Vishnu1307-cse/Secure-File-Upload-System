import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, User as UserIcon, Trash2, Clock, Shield, Database, HardDrive, AlertCircle, X } from 'lucide-react';
import Card from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

const AdminFilesTable = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchAllFiles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/all-files');
            setFiles(response.data.data);
        } catch (err) {
            toast({ type: 'error', message: 'ERROR: FILE_REGISTRY_LINK_FAILURE' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllFiles();
    }, []);

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-zinc-950/50 p-6 border border-zinc-900 rounded-sm backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-ef-accent/10 text-ef-accent rounded-sm border border-ef-accent/20">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic tracking-tighter text-zinc-50 uppercase">Global Data Manifest</h3>
                        <p className="text-[10px] ef-text-mono font-black uppercase tracking-widest opacity-40">Monitoring {files.length} active/purged data nodes</p>
                    </div>
                </div>
            </div>

            <Card className="!p-0 overflow-hidden !border-t-0 bg-transparent shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-900 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Node_Identity</th>
                                <th className="px-6 py-4">Origin_Authority</th>
                                <th className="px-6 py-4">Link_Status</th>
                                <th className="px-6 py-4">Infiltration_Specs</th>
                                <th className="px-6 py-4">Timeline</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] ef-text-mono">
                            {loading && files.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-12 bg-zinc-900/30 border border-zinc-800/30 animate-pulse" /></td></tr>
                                ))
                            ) : files.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-24 text-center text-zinc-600 uppercase tracking-widest font-black">No_File_Nodes_Found</td></tr>
                            ) : (
                                files.map((file) => (
                                    <tr key={file.id} className={`group ${file.deleted_at ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-l border-zinc-900 group-hover:border-ef-accent/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-sm border shadow-lg transition-all ${file.deleted_at ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-ef-accent/20 text-ef-accent border-ef-accent/40 shadow-[0_0_12px_rgba(var(--ef-accent-rgb),0.2)]'}`}>
                                                    <FileText size={20} className="group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-zinc-100 group-hover:text-ef-accent uppercase tracking-tighter transition-colors">{file.file_name}</div>
                                                    <div className="text-[8px] opacity-30 mt-0.5">NODE_ID: {file.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center text-[8px] font-black uppercase text-zinc-500">
                                                    {file.user?.email?.[0] || '?'}
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-300">{file.user?.email || 'UNKNOWN_AGENT'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30">
                                            <span className={`
                                                px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] flex items-center w-fit gap-1.5 border
                                                ${file.deleted_at 
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                                    : 'bg-ef-accent/10 text-ef-accent border-ef-accent/20'}
                                            `}>
                                                {file.deleted_at ? <><X size={12} /> Purged</> : <><Shield size={12} /> Active</>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30 opacity-70">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-zinc-200 flex items-center gap-1.5">
                                                    <HardDrive size={12} className="opacity-80 text-ef-accent" /> {formatSize(file.size)}
                                                </div>
                                                <div className="text-[8px] text-zinc-400 uppercase tracking-tighter">
                                                    {file.mime_type} • {file.download_count} STREAMS
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-6 py-4 bg-[#0c0c0e] border-y border-r border-zinc-900 group-hover:border-ef-accent/30 text-zinc-400">
                                             <div className="space-y-1">
                                                <div className="text-[9px] flex items-center gap-1.5 font-bold uppercase">
                                                    <Clock size={12} className="opacity-80 text-ef-accent" /> INI: {new Date(file.created_at).toLocaleDateString()}
                                                </div>
                                                {file.deleted_at && (
                                                    <div className="text-[8px] flex items-center gap-1.5 font-black text-red-400 uppercase">
                                                        <AlertCircle size={12} /> PRG: {new Date(file.deleted_at).toLocaleDateString()}
                                                    </div>
                                                )}
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

export default AdminFilesTable;
