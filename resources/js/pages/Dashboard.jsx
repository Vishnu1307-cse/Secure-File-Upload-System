import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { 
    FileUp, Download, Trash2, Shield, 
    Share2, Loader2, HardDrive, Filter, 
    Search, LogOut, Activity, Database,
    FileText, X, AlertOctagon, Terminal
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [shareModal, setShareModal] = useState(null);
    const [shareLink, setShareLink] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, logout, isAdmin } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/files');
            setFiles(response.data.data);
        } catch (err) {
            toast({ type: 'error', message: 'CRITICAL: VAULT_SYNC_FAILURE' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFiles();
        const interval = setInterval(() => {
            api.get('/files').then(res => setFiles(res.data.data)).catch(() => {});
        }, 60000); 
        return () => clearInterval(interval);
    }, [fetchFiles]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/files', formData);
            toast({ type: 'success', title: 'DEPOSIT_SUCCESS', message: 'Data node successfully encrypted and vaulted.' });
            fetchFiles();
        } catch (err) {
            toast({ type: 'error', message: 'DEPOSIT_REJECTED' });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            toast({ type: 'success', message: 'INITIALIZING_DECRYPTION_STREAM' });
            const response = await api.get(`/files/${file.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast({ type: 'error', message: 'DECRYPTION_FAILED' });
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/files/${deleteModal.id}`);
            toast({ type: 'success', title: 'NODE_PURGED', message: 'Encrypted object permanently removed.' });
            setDeleteModal(null);
            fetchFiles();
        } catch (err) {
            toast({ type: 'error', message: 'PURGE_FAILED' });
        }
    };

    const handleShare = async (file) => {
        try {
            const res = await api.post(`/files/${file.id}/share`);
            setShareLink(res.data.share_link);
            setShareModal(file);
        } catch (err) {
            toast({ type: 'error', message: 'LINK_GENERATION_FAILED' });
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const filteredFiles = files.filter(f => f.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-6">
            <header className="mb-12 flex flex-wrap gap-8 justify-between items-end border-b border-zinc-900 pb-10 relative">
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Terminal size={16} className="text-ef-accent opacity-50" />
                        <span className="ef-text-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Session ID: 0x-{user?.id || 'AUTH'}</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-zinc-50 uppercase flex items-center gap-4">
                        Personal Vault <Shield size={32} className="text-ef-accent" />
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                         <Activity size={14} className="text-emerald-500 animate-pulse" /> Secure_Storage_Protocol v2.4
                    </p>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                    {isAdmin && (
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/admin')} 
                            className="!px-4 bg-ef-accent/10 text-ef-accent border-ef-accent/20 hover:bg-ef-accent/20"
                        >
                             COMMAND_CENTER [🛡️]
                        </Button>
                    )}
                    <button 
                        onClick={toggleTheme} 
                        className={`
                            px-4 py-2 border ef-text-mono text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105
                            ${mode === 'hazard' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-sky-500/10 border-sky-500 text-sky-500'}
                        `}
                    >
                         {mode === 'hazard' ? 'EXECUTE_NEON_LINK' : 'EXECUTE_HAZARD_LINK'}
                    </button>
                    <Button variant="ghost" onClick={logout} className="!w-auto !p-2 text-red-500 border-red-500/20 hover:bg-red-500/10">
                        <LogOut size={20} />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <aside className="space-y-8">
                    <Card className="!p-0 overflow-hidden !border-t-0">
                        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
                            <FileUp size={16} className="text-ef-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Infiltration_Zone</span>
                        </div>
                        <div className="p-6">
                            <label className="group block cursor-pointer">
                                <div className={`
                                    border-2 border-dashed border-zinc-800 rounded-sm p-8 flex flex-col items-center justify-center transition-all
                                    group-hover:border-ef-accent group-hover:bg-ef-accent/5
                                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                                `}>
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-ef-accent mb-4" size={32} />
                                    ) : (
                                        <Database className="text-zinc-700 group-hover:text-ef-accent transition-colors mb-4" size={32} />
                                    )}
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors">
                                        {uploading ? 'ENCRYPTING...' : 'Deposit Data Node'}
                                    </span>
                                </div>
                                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                            </label>
                            <div className="mt-4 ef-text-mono text-[8px] opacity-30 uppercase italic text-center">MAX_PAYLOAD: 100MiB</div>
                        </div>
                    </Card>

                    <Card className="!p-0 overflow-hidden">
                        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
                            <Filter size={16} className="text-ef-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global_Index_Sort</span>
                        </div>
                        <div className="p-4">
                            <div className="relative border border-zinc-800 bg-zinc-950 focus-within:border-ef-accent transition-all">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                    type="text" 
                                    placeholder="Search Hash / Name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-none pl-9 pr-3 py-3 text-xs ef-text-mono text-zinc-200 outline-none placeholder:opacity-20"
                                />
                            </div>
                        </div>
                    </Card>
                </aside>

                <main className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center px-4 bg-zinc-950 border-l-2 border-ef-accent py-2 opacity-60">
                        <span className="ef-text-mono text-[10px] font-black uppercase">Active Data Manifest</span>
                        <span className="ef-text-mono text-[10px] font-black">{filteredFiles.length} Nodes Identified</span>
                    </div>

                    <div className="space-y-4 min-h-[500px]">
                        {loading && files.length === 0 ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-zinc-900/30 border border-zinc-800/50 rounded-sm animate-pulse" />
                            ))
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 border border-zinc-900 border-dashed rounded-xl opacity-20">
                                <Database size={48} className="mb-4" />
                                <span className="ef-text-mono text-sm font-black uppercase tracking-[0.5em]">Vault_Empty</span>
                            </div>
                        ) : filteredFiles.map((file) => (
                            <div key={file.id} className="group relative">
                                <div className="absolute inset-0 bg-ef-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="flex items-center justify-between p-5 bg-[#0c0c0e] border border-zinc-900 border-l-4 border-l-ef-accent shadow-sm transition-all group-hover:translate-x-1 group-hover:border-zinc-700">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-ef-accent/10 border border-ef-accent/30 text-ef-accent group-hover:bg-ef-accent/20 transition-all relative shadow-[0_0_10px_rgba(var(--ef-accent-rgb),0.1)]">
                                            <FileText size={24} className="scale-110" />
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-ef-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-50 tracking-tight mb-1">{file.file_name}</h3>
                                            <div className="flex items-center gap-4 ef-text-mono text-[10px] font-black uppercase tracking-tighter text-zinc-400">
                                                <span>SPEC: {formatSize(file.size)}</span>
                                                <span className="hidden sm:inline opacity-30">|</span>
                                                <span className="hidden sm:inline">TYPE: {file.mime_type?.split('/')[1] || 'DATA'}</span>
                                                <span className="hidden sm:inline opacity-30">|</span>
                                                <span className="hidden sm:inline">DEPOSITED: {new Date(file.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleDownload(file)} 
                                            title="Stream Decrypt"
                                            className="hover:!text-ef-accent hover:!bg-ef-accent/5 border-none"
                                        >
                                            <Download size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleShare(file)} 
                                            title="Generate Share Sig"
                                            className="hover:!text-sky-500 hover:!bg-sky-500/5 border-none"
                                        >
                                            <Share2 size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setDeleteModal(file)} 
                                            title="Initialize Purge"
                                            className="hover:!text-red-500 hover:!bg-red-500/5 border-none"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Share Modal */}
            <Modal
                isOpen={!!shareModal}
                onClose={() => setShareModal(null)}
                title="Link_Infiltration_Established"
            >
                <div className="space-y-8 pt-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 ef-text-mono text-[11px] leading-relaxed break-all relative group">
                        <div className="text-zinc-600 mb-2 font-black uppercase tracking-widest text-[8px] flex justify-between">
                            <span>Temporary_Signed_Signature</span>
                            <span>VAL_72H</span>
                        </div>
                        <span className="text-zinc-200">{shareLink}</span>
                        <div className="absolute inset-0 bg-ef-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight flex items-center gap-2">
                         <AlertOctagon size={14} className="text-ef-accent" />
                         Signature will self-destruct in 72 hours. Unauthorized redistribution is prohibited.
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="primary" onClick={() => {
                            navigator.clipboard.writeText(shareLink);
                            toast({ type: 'success', message: 'SIG_COPIED_TO_BUFFER' });
                        }}>Copy Link to Buffer</Button>
                        <Button variant="ghost" onClick={() => setShareModal(null)}>Dismiss HUD</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Confirm_Data_Purge"
            >
                <div className="text-center space-y-8 pt-4">
                    <div className="w-20 h-20 bg-red-950/20 text-red-500 rounded-sm border border-red-500/30 flex items-center justify-center mx-auto relative overflow-hidden group">
                        <Trash2 size={40} className="relative z-10 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="ef-text-mono text-lg font-black text-zinc-50 mb-2 uppercase">Destruction_Sequence_Active</h3>
                        <p className="text-zinc-500 text-xs font-medium leading-relaxed uppercase">
                            Warning: You are about to permanently purge node <span className="text-zinc-200">[{deleteModal?.file_name}]</span> from the encrypted vault. This operation is irrevocable.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="danger" onClick={handleDelete} className="w-full">Authorize Purge</Button>
                        <Button variant="ghost" onClick={() => setDeleteModal(null)} className="w-full">Abort Sequence</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
