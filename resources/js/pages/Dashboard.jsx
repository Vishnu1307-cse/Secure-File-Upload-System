import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    Upload, FileText, Download, Share2, Trash2, 
    Loader2, Search, ExternalLink, HardDrive, ShieldCheck,
    ArrowUpRight, Clock, AlertCircle, X, Sun, Moon, LogOut, Copy, Check
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, downloads: 0 });
    const [deleteModal, setDeleteModal] = useState(null);
    const [shareData, setShareData] = useState(null);
    const [copied, setCopied] = useState(false);
    
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();
    const { logout, isAdmin } = useAuth();

    const fetchFiles = useCallback(async () => {
        try {
            const response = await api.get('/files');
            const data = response.data.data || [];
            setFiles(data);
            const totalDownloads = data.reduce((acc, f) => acc + (f.download_count || 0), 0);
            setStats({ total: data.length, downloads: totalDownloads });
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                toast({ type: 'error', message: 'Failed to sync your vault.' });
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, toast, logout]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (uploadedFile) => {
        if (!uploadedFile) return;
        setUploading(true);
        toast({ type: 'loading', message: 'Encrypting and uploading file...' });

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            await api.post('/files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ type: 'success', title: 'File Secured', message: 'Your file has been encrypted and stored.' });
            fetchFiles();
        } catch (err) {
            const message = err.response?.status === 403 
                ? 'Your account does not have permission to upload files.' 
                : 'File might be too large or invalid.';
            toast({ type: 'error', title: 'Upload Failed', message });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        toast({ type: 'loading', message: 'Decrypting file stream...' });
        try {
            const response = await api.get(`/files/${file.id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({ type: 'success', message: 'File decrypted successfully.' });
            fetchFiles(); // update count
        } catch (err) {
            toast({ type: 'error', message: 'Decryption failed.' });
        }
    };

    const handleShare = async (file) => {
        try {
            const response = await api.post(`/files/${file.id}/share`);
            setShareData({
                link: response.data.share_link,
                expires: response.data.expires_at,
                name: file.file_name
            });
        } catch (err) {
            toast({ type: 'error', message: 'Could not generate signed link.' });
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/files/${deleteModal.id}`);
            setFiles(files.filter(f => f.id !== deleteModal.id));
            setDeleteModal(null);
            toast({ type: 'success', message: 'File purged from vault.' });
        } catch (err) {
            toast({ type: 'error', message: 'Security purge failed.' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const filteredFiles = files.filter(f => f.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Personal Vault</h1>
                    <p className="text-slate-500 dark:text-zinc-400">Secure end-to-end encrypted storage.</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/admin')} 
                            className="text-emerald-500 hover:bg-emerald-500/10 gap-2 border border-emerald-500/20 px-4"
                        >
                            <ShieldCheck size={18} /> Command Center
                        </Button>
                    )}
                    <Button variant="ghost" onClick={toggleTheme} className="p-2 !w-auto">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="p-2 !w-auto text-red-500 hover:bg-red-500/10">
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <Card className="flex items-center gap-6 !p-6" animate={false}>
                    <div className="p-4 bg-primary-500/10 text-primary-600 rounded-2xl"><HardDrive size={28} /></div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-zinc-50">{stats.total}</div>
                        <div className="text-sm font-medium text-slate-500">Secure Files</div>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 !p-6" animate={false}>
                    <div className="p-4 bg-green-500/10 text-green-600 rounded-2xl"><ArrowUpRight size={28} /></div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-zinc-50">{stats.downloads}</div>
                        <div className="text-sm font-medium text-slate-500">Total Decryptions</div>
                    </div>
                </Card>
            </div>

            {/* Upload Zone */}
            <label 
                className={`
                    block mb-10 p-12 text-center rounded-[32px] cursor-pointer transition-all border-2 border-dashed
                    ${isDragging ? 'border-primary-500 bg-primary-500/5 scale-[0.99]' : 'border-zinc-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-zinc-100/50 dark:hover:bg-slate-800/50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}
            >
                <input type="file" hidden onChange={(e) => handleFileUpload(e.target.files[0])} disabled={uploading} />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary-600/20">
                        {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-zinc-50">{uploading ? 'Processing Security Layers...' : 'Vault Deposit'}</h3>
                        <p className="text-slate-500 dark:text-zinc-500">Drag & drop or browse to encrypt files up to 100MB</p>
                    </div>
                </div>
            </label>

            {/* File List */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-zinc-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-50">Stored Records</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-zinc-50/30 dark:bg-slate-900/30">
                            <tr>
                                <th className="px-6 py-4">File Identity</th>
                                <th className="px-6 py-4">Security Size</th>
                                <th className="px-6 py-4">Deposited At</th>
                                <th className="px-6 py-4">Accesses</th>
                                <th className="px-6 py-4 text-right">Vault Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-slate-800/50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-6 py-8"><div className="h-6 bg-zinc-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
                                ))
                            ) : filteredFiles.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500">Your vault is currently empty.</td></tr>
                            ) : (
                                filteredFiles.map(file => (
                                    <tr key={file.id} className="hover:bg-zinc-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg"><FileText size={18} /></div>
                                                <span className="font-semibold text-slate-900 dark:text-zinc-50">{file.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-zinc-500">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-zinc-500">
                                            <div className="flex items-center gap-1.5"><Clock size={14} /> {new Date(file.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-slate-800 text-xs font-bold rounded-full">{file.download_count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" onClick={() => handleDownload(file)} className="p-2 !w-auto rounded-lg"><Download size={18} /></Button>
                                                <Button variant="ghost" onClick={() => handleShare(file)} className="p-2 !w-auto rounded-lg"><Share2 size={18} /></Button>
                                                <Button variant="ghost" onClick={() => setDeleteModal(file)} className="p-2 !w-auto rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 size={18} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Share Modal */}
            <Modal
                isOpen={!!shareData}
                onClose={() => { setShareData(null); setCopied(false); }}
                title="Secure Link Injection"
            >
                <div className="space-y-6">
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">
                        This signed URL allows authorized access to <strong>{shareData?.name}</strong>. Valid for 72 hours.
                    </p>
                    <div className="p-4 bg-zinc-100 dark:bg-slate-950 rounded-2xl border border-zinc-200 dark:border-slate-800 break-all font-mono text-xs text-primary-600 dark:text-primary-400">
                        {shareData?.link}
                    </div>
                    <Button 
                        onClick={() => { 
                            navigator.clipboard.writeText(shareData.link); 
                            setCopied(true);
                            toast({ type: 'success', message: 'Signed URL copied to clipboard.' });
                        }} 
                        className="w-full"
                        variant={copied ? 'secondary' : 'primary'}
                    >
                        {copied ? <><Check size={20} /> Copied</> : <><Copy size={20} /> Copy Security Link</>}
                    </Button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Confirm Record Purge"
            >
                <div className="text-center space-y-6 pt-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">
                        You are about irreversibly purge <strong>{deleteModal?.file_name}</strong> from the secure vault.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Purge Record</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
