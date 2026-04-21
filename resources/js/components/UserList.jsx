import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { 
    Mail, Shield, User as UserIcon, Trash2, Calendar, 
    LogIn, ShieldAlert, Cpu, Search, Filter, CheckCircle, 
    Ban, RefreshCcw, Building 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const UserList = ({ mode = 'all' }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(mode === 'pending' ? 'pending' : '');
    const [deleteModal, setDeleteModal] = useState(null);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'pending' ? '/admin/pending-users' : '/admin/users';
            const params = mode === 'all' ? { search, status: statusFilter } : {};
            const response = await api.get(endpoint, { params });
            setUsers(response.data.data);
        } catch (err) {
            toast({ type: 'error', message: 'ERROR: USER_DIR_ACCESS_DENIED' });
        } finally {
            setLoading(false);
        }
    }, [mode, search, statusFilter, toast]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchUsers]);

    const handleAction = async (userId, action) => {
        try {
            let message = '';
            let title = '';
            
            if (action === 'approve') {
                await api.post(`/admin/users/${userId}/approve`);
                title = 'AUTH_GRANTED';
                message = 'Identity node promoted to ACTIVE_OPERATOR.';
            } else if (action === 'ban') {
                await api.post(`/admin/users/${userId}/ban`);
                title = 'REVOCATION_ACTIVE';
                message = 'Identity node purged to RESTRICTED_LIST.';
            } else if (action === 'unban') {
                await api.post(`/admin/users/${userId}/unban`);
                title = 'AUTH_RESTORED';
                message = 'Identity node returned to ACTIVE_STATUS.';
            }

            toast({ type: 'success', title, message });
            fetchUsers();
        } catch (err) {
            toast({ type: 'error', title: 'MODERATION_FAILURE', message: err.response?.data?.message || 'Protocol synchronization failed.' });
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/admin/users/${deleteModal.id}`);
            setDeleteModal(null);
            toast({ type: 'success', title: 'NODE_PURGED', message: 'Physical identity record removed.' });
            fetchUsers();
        } catch (err) {
            toast({ type: 'error', title: 'PURGE_FAILURE', message: err.response?.data?.message || 'Access revocation failed.' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-zinc-950/50 p-4 border border-zinc-900 rounded-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="SEARCH_IDENTITY..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-ef-accent pl-10 pr-4 py-2 ef-text-mono text-[10px] text-zinc-100 outline-none uppercase placeholder:opacity-30"
                        />
                    </div>
                    {mode === 'all' && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 ef-text-mono text-[10px] px-3 py-2 outline-none focus:border-ef-accent uppercase"
                        >
                            <option value="">ALL_PROTOCOLS</option>
                            <option value="approved">APPROVED_ONLY</option>
                            <option value="pending">PENDING_QUEUE</option>
                            <option value="banned">BANNED_NODES</option>
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[10px] ef-text-mono font-black uppercase tracking-widest opacity-40">MANIFEST_COUNT: {users.length}</div>
                    <Button variant="ghost" onClick={fetchUsers} className="!p-2 !w-auto border-zinc-800 hover:border-ef-accent">
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            <Card className="!p-0 overflow-hidden bg-transparent shadow-none !border-none">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-900 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Operator_Identity</th>
                                <th className="px-6 py-4">Department_Link</th>
                                <th className="px-6 py-4">Auth_Protocol</th>
                                <th className="px-6 py-4">Activity_Logs</th>
                                <th className="px-6 py-4 text-right">Moderation_Layer</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] ef-text-mono">
                            {loading && users.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-16 bg-zinc-900/30 border border-zinc-800/30 animate-pulse" /></td></tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center bg-[#0c0c0e] border border-zinc-900 opacity-30 italic">
                                        NO_IDENTITY_NODES_FOUND_IN_THIS_BRANCH
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="group">
                                    <td className="px-6 py-4 bg-[#0c0c0e] border-y border-l border-zinc-900 group-hover:border-ef-accent/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-10 h-10 rounded-sm flex items-center justify-center text-zinc-950 shadow-lg relative
                                                ${user.role === 'admin' ? 'bg-ef-accent' : user.status === 'banned' ? 'bg-red-500' : 'bg-zinc-700'}
                                            `}>
                                                {user.role === 'admin' ? <Shield size={18} /> : user.status === 'banned' ? <ShieldAlert size={18} /> : <UserIcon size={18} />}
                                                <div className="absolute top-0 right-0 w-1 h-1 bg-zinc-950 m-0.5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-zinc-100 group-hover:text-ef-accent transition-colors">{user.name}</div>
                                                <div className="text-[9px] text-zinc-500 flex items-center gap-1.5 font-medium lowercase">
                                                    <Mail size={10} className="opacity-40" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Building size={12} className="text-ef-accent/50" />
                                            <span className="uppercase text-[9px] font-black tracking-widest">{user.department || 'OUTSIDER'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`
                                                w-fit px-3 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border
                                                ${user.status === 'approved' 
                                                    ? 'bg-ef-accent/10 border-ef-accent/50 text-ef-accent' 
                                                    : user.status === 'pending' 
                                                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 animate-pulse' 
                                                        : 'bg-red-500/10 border-red-500/50 text-red-500'}
                                            `}>
                                                {user.status}
                                            </span>
                                            <span className="text-[7px] text-zinc-600 font-black uppercase tracking-tighter">PERM: {user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-[#0c0c0e] border-y border-zinc-900 group-hover:border-ef-accent/30">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black flex items-center gap-2 text-zinc-100">
                                                <LogIn size={11} className="text-ef-accent shadow-[0_0_8px_rgba(var(--ef-accent-rgb),0.4)]" /> {user.login_count || 0}_EST_LINK
                                            </div>
                                            <div className="text-[8px] text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5 font-bold">
                                                <Calendar size={11} className="opacity-70 text-ef-accent" /> {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-[#0c0c0e] border-y border-r border-zinc-900 group-hover:border-ef-accent/30 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.status === 'pending' && (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                    className="hover:!text-ef-accent !p-2 !w-auto border-none"
                                                    title="APPROVE_AUTHORIZATION"
                                                >
                                                    <CheckCircle size={16} />
                                                </Button>
                                            )}
                                            
                                            {user.status === 'approved' && user.role !== 'admin' && (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => handleAction(user.id, 'ban')}
                                                    className="hover:!text-red-500 !p-2 !w-auto border-none"
                                                    title="REVOKE_ACCESS"
                                                >
                                                    <Ban size={16} />
                                                </Button>
                                            )}

                                            {user.status === 'banned' && (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => handleAction(user.id, 'unban')}
                                                    className="hover:!text-emerald-500 !p-2 !w-auto border-none"
                                                    title="RESTORE_ACCESS"
                                                >
                                                    <RefreshCcw size={16} />
                                                </Button>
                                            )}

                                            <Button 
                                                variant="ghost" 
                                                onClick={() => setDeleteModal(user)}
                                                className="hover:!text-red-600 !p-2 !w-auto border-none"
                                                title="TERMINATE_MANIFEST"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Authorization_Termination"
            >
                <div className="text-center space-y-8 pt-4">
                    <div className="w-20 h-20 bg-red-950/20 text-red-500 rounded-sm border border-red-500/30 flex items-center justify-center mx-auto relative overflow-hidden group">
                        <ShieldAlert size={40} className="relative z-10 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="ef-text-mono text-lg font-black text-zinc-50 mb-2 uppercase">Identity_Purge_Sequence</h3>
                        <p className="text-zinc-500 text-[10px] font-medium leading-relaxed uppercase italic">
                            Warning: Permanent revocation of <span className="text-zinc-200">[{deleteModal?.email}]</span>. This operation is IRREVERSIBLE. Node metadata and associated file links will be severed.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button variant="danger" onClick={handleDeleteUser} className="w-full">Initialize Access Revocation</Button>
                        <Button variant="ghost" onClick={() => setDeleteModal(null)} className="w-full">Abort Operation</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserList;
