import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Loader2, Mail, ShieldAlert, Cpu, Activity, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { mode, toggleTheme } = useTheme();
    const { toast } = useToast();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/request-otp', { email });
            sessionStorage.setItem('temp_email', email);
            toast({ type: 'success', message: 'Identity link established. Verify code.' });
            navigate('/verify-otp');
        } catch (err) {
            toast({ type: 'error', message: err.response?.data?.message || 'Access denied.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto pt-32 px-4 relative">
            {/* Background HUD Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-[-50px] rotate-[-10deg] ef-text-mono text-[100px] font-black italic whitespace-nowrap">INITIATING SECURE PROTOCOL</div>
                <div className="absolute bottom-10 right-[-50px] rotate-[5deg] ef-text-mono text-[120px] font-black italic whitespace-nowrap opacity-50">END-FIELD-LINK</div>
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
                    <Activity size={12} className="animate-pulse" />
                    {mode === 'neon' ? 'SWITCH_TO_HAZARD' : 'SWITCH_TO_NEON'}
                </button>
            </div>

            <Card className="relative overflow-hidden">
                <div className="flex items-center gap-2 mb-8 p-3 bg-zinc-900/50 border-l-4 border-ef-accent">
                    <Zap size={18} className="text-ef-accent" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-200">Authorization Required</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-xl font-bold mb-2 text-zinc-50">Identity Verification</h2>
                    <p className="text-sm text-zinc-500 font-medium">Input your primary identity link (email) to receive a secure decryption key.</p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-8">
                    <div>
                        <label className="ef-label flex justify-between">
                            <span>Primary Identity Link</span>
                            <span className="opacity-20 font-mono">0x-AUTH-ADDR</span>
                        </label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-ef-accent transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 pl-12 pr-4 py-4 ef-text-mono text-sm text-zinc-100 outline-none transition-all placeholder:opacity-20"
                                placeholder="operator@securevault.field"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !email}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <div className="flex items-center justify-center gap-3">
                                <span className="translate-y-[1px]">Initialize Link Protocol</span>
                                <Zap size={18} />
                            </div>
                        )}
                    </Button>

                    <div className="pt-2 text-center">
                        <Link to="/register" className="text-[10px] font-black uppercase text-zinc-500 hover:text-ef-accent transition-colors tracking-widest">
                            [ REQUEST_NEW_OPERATOR_ACCESS ]
                        </Link>
                    </div>
                </form>

                <div className="mt-12 flex justify-between items-end opacity-20 hover:opacity-100 transition-all pointer-events-none sm:pointer-events-auto">
                    <div className="ef-text-mono text-[8px] space-y-1">
                        <div>ENCRYPTION: AES-256-CTR</div>
                        <div>AUTH: MULTI-LAYER OTP</div>
                        <div>STATUS: STANDBY</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] font-black uppercase">Secure Protocol Active</span>
                    </div>
                </div>
            </Card>

            {/* Static HUD Decoration */}
            <div className="fixed bottom-10 left-10 opacity-10 animate-pulse hidden lg:block">
                <div className="ef-text-mono text-[10px] space-y-2">
                    <div>LOCATION: [48.8566° N, 2.3522° E]</div>
                    <div>NETWORK: ENCRYPTED_FIELD_LINK</div>
                    <div className="w-20 h-1 bg-ef-accent opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
