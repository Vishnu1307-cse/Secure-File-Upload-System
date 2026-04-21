import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Loader2, User, Mail, Building, Zap, Cpu, History, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { mode, toggleTheme } = useTheme();
    const { toast } = useToast();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            
            toast({ 
                type: 'success', 
                title: 'INITIALIZATION_SUCCESS',
                message: 'Profile established. Awaiting administrative authorization.' 
            });
            
            navigate('/login');
        } catch (err) {
            toast({ 
                type: 'error', 
                title: 'PROTOCOL_ERROR',
                message: err.response?.data?.message || 'Access registration failed.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto pt-24 px-4 relative pb-20">
            {/* Background HUD Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-10 right-[-50px] rotate-[10deg] ef-text-mono text-[100px] font-black italic whitespace-nowrap uppercase">Protocol_Registration</div>
                <div className="absolute bottom-10 left-[-50px] rotate-[-5deg] ef-text-mono text-[120px] font-black italic whitespace-nowrap opacity-50 uppercase">New_Node_Init</div>
            </div>

            <div className="flex justify-between items-center mb-8 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-ef-accent text-zinc-950 rounded-sm">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-tighter opacity-40">System Node</div>
                        <h1 className="ef-title text-2xl !mb-0">SecureVault v2.4</h1>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme} 
                    className={`
                        flex items-center gap-2 px-3 py-1.5 border ef-text-mono text-[10px] font-bold uppercase tracking-widest transition-all
                        ${mode === 'hazard' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-sky-500/10 border-sky-500 text-sky-500'}
                    `}
                >
                    <History size={12} className="animate-pulse" />
                    {mode === 'neon' ? 'protocol_hazard' : 'protocol_neon'}
                </button>
            </div>

            <Card className="relative overflow-hidden">
                <div className="flex items-center gap-2 mb-8 p-3 bg-zinc-900/50 border-l-4 border-ef-accent">
                    <Zap size={18} className="text-ef-accent" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-200">Initialize Identity Request</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-xl font-bold mb-2 text-zinc-50 uppercase italic tracking-tighter">New_Operator_Enrollment</h2>
                    <p className="text-sm text-zinc-500 font-medium">Submit your credentials for administrative authorization.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="ef-label flex justify-between">
                            <span>Operator Full Name</span>
                            <span className="opacity-20 font-mono">ID_NAME</span>
                        </label>
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-ef-accent transition-colors" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 pl-12 pr-4 py-4 ef-text-mono text-sm text-zinc-100 outline-none transition-all placeholder:opacity-20"
                                placeholder="LASTNAME, FIRSTNAME"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="ef-label flex justify-between">
                            <span>Primary Identity Link</span>
                            <span className="opacity-20 font-mono">ID_EMAIL</span>
                        </label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-ef-accent transition-colors" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 pl-12 pr-4 py-4 ef-text-mono text-sm text-zinc-100 outline-none transition-all placeholder:opacity-20"
                                placeholder="operator@securevault.field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="ef-label flex justify-between">
                            <span>Assigned Department</span>
                            <span className="opacity-20 font-mono">ID_DEPT</span>
                        </label>
                        <div className="relative group">
                            <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-ef-accent transition-colors" />
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 pl-12 pr-4 py-4 ef-text-mono text-sm text-zinc-100 outline-none transition-all placeholder:opacity-20"
                                placeholder="e.g. LOGISTICS / INFRASTRUCTURE"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <div className="flex items-center justify-center gap-3">
                                    <span className="translate-y-[1px]">Submit Authorization Request</span>
                                    <Zap size={18} />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-center">
                    <Link to="/login" className="text-[10px] font-black uppercase text-zinc-500 hover:text-ef-accent transition-colors tracking-widest">
                        [ Return_to_Login_Protocol ]
                    </Link>
                </div>

                <div className="mt-10 flex justify-between items-end opacity-20">
                    <div className="ef-text-mono text-[8px] space-y-1">
                        <div>REQUEST: INITIAL_AUTH</div>
                        <div>NODE_STATUS: PENDING</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] font-black uppercase">Identity Manifest v2</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
