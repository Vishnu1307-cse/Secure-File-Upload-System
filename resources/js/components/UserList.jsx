import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Shield, User as UserIcon, Trash2, Calendar, LogIn, AlertTriangle, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data);
        } catch (err) {
            toast({ type: 'error', message: 'Failed to access user directory.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async () => {
        if (!deleteModal) return;
        try {
            const res = await api.delete(`/admin/users/${deleteModal.id}`);
            setUsers(users.filter(u => u.id !== deleteModal.id));
            setDeleteModal(null);
            toast({ type: 'success', title: 'Access Revoked', message: 'The user account has been purged.' });
        } catch (err) {
            toast({ type: 'error', title: 'Operation Failed', message: err.response?.data?.message || 'Failed to delete user.' });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 bg-zinc-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4">User Authority</th>
                                <th className="px-6 py-4">Security Level</th>
                                <th className="px-6 py-4">Activity telemetry</th>
                                <th className="px-6 py-4 text-right">Access Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-slate-800/50">
                            {loading && users.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-6 py-8"><div className="h-8 bg-zinc-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
                                ))
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg
                                                ${user.role === 'admin' ? 'bg-gradient-to-tr from-emerald-600 to-teal-400' : 'bg-gradient-to-tr from-primary-600 to-indigo-400'}
                                            `}>
                                                {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-zinc-100">{user.name || 'Record ID: ' + user.id}</div>
                                                <div className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5 font-medium">
                                                    <Mail size={12} className="opacity-50" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${user.role === 'admin' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                                                : 'bg-primary-500/10 border-primary-500/20 text-primary-600'}
                                        `}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold flex items-center gap-2 text-slate-900 dark:text-zinc-50">
                                                <LogIn size={12} className="text-emerald-500" /> {user.login_count || 0} Established Sessions
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Calendar size={12} className="opacity-40" /> Initialized {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setDeleteModal(user)}
                                            className="!p-2 !w-auto text-red-500 hover:bg-red-500/10 rounded-lg ml-auto"
                                            title="Revoke All Access"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
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
                title="Authorize Deployment Termination"
            >
                <div className="text-center space-y-6 pt-4">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-zinc-50">Verify Destruction</h3>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                            You are about to permanently purge <strong>{deleteModal?.email}</strong> and all associated encrypted vault records. This operation cannot be reversed.
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
