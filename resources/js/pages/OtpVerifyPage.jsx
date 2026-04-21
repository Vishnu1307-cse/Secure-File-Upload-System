import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, ShieldCheck, RefreshCcw, ArrowLeft, Activity, Cpu, KeyRound } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const OtpVerifyPage = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const navigate = useNavigate();
    const inputRefs = useRef([]);
    const { mode, toggleTheme } = useTheme();
    const { toast } = useToast();
    const { login } = useAuth();

    const email = sessionStorage.getItem('temp_email');

    useEffect(() => {
        if (!email) navigate('/login');

        const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown, email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('INCOMPLETE_INJECTION_CODE');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp: otpString
            });

            login(response.data.user, response.data.access_token);
            
            toast({ type: 'success', title: 'SYNCHRONIZED', message: 'Authorization successful. Bridging link...' });
            setSuccess('LINK_ESTABLISHED');
            setTimeout(() => {
                const destination = response.data.user.role === 'admin' ? '/admin' : '/dashboard';
                navigate(destination);
            }, 1000);
        } catch (err) {
            const msg = err.response?.data?.message || 'AUTHORIZATION_DENIED';
            setError(msg);
            toast({ type: 'error', title: 'ACCESS_REJECTED', message: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        
        setResending(true);
        setError('');
        try {
            await api.post('/auth/request-otp', { email });
            toast({ type: 'success', title: 'SIGNAL_SENT', message: 'New decryption code transmitted.' });
            setSuccess('NEW_SIGNAL_BROADCAST');
            setCountdown(60);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            toast({ type: 'error', message: 'BROADCAST_FAILURE' });
            setError('SIG_LOSS_RETRY_LATER');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto pt-32 px-4 relative">
             <div className="flex justify-between items-center mb-8 relative">
                <Button variant="ghost" onClick={() => navigate('/login')} className="!text-[10px] !px-2 border-none">
                    <ArrowLeft size={16} /> ABORT_LINK
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-ef-accent text-zinc-950 rounded-sm">
                        <KeyRound size={24} />
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
                     SEC_LVL_02
                </button>
            </div>

            <Card>
                <div className="text-center mb-10">
                    <h1 className="ef-title text-2xl !mb-2 italic">Sec_Verify_Identity</h1>
                    <p className="text-sm text-zinc-500 font-medium ef-text-mono">
                        Signal transmitted to identity link: <br/>
                        <span className="text-ef-accent opacity-80 decoration-dotted underline underline-offset-4">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-10">
                    <div className="flex gap-2 justify-between">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                className="w-12 h-16 text-center text-2xl font-black ef-text-mono bg-zinc-950 border border-zinc-800 focus:border-ef-accent focus:ring-1 focus:ring-ef-accent/20 rounded-sm transition-all outline-none disabled:opacity-50 text-zinc-100"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                maxLength={1}
                                disabled={loading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                    
                    {error && <div className="text-[10px] font-black uppercase tracking-widest text-red-500 text-center bg-red-500/10 py-2 border border-red-500/20">ERROR: {error}</div>}
                    {success && <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center bg-emerald-500/10 py-2 border border-emerald-500/20">{success}</div>}

                    <Button type="submit" className="w-full" disabled={loading || otp.join('').length < 6}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <div className="flex items-center justify-center gap-3">
                                <span className="translate-y-[1px]">Execute Verification</span>
                                <ShieldCheck size={20} />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
                    {countdown > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">Next signal window</span>
                            <div className="ef-text-mono font-black text-ef-accent">00:{countdown < 10 ? `0${countdown}` : countdown}</div>
                        </div>
                    ) : (
                        <button 
                            className="text-ef-accent hover:brightness-125 font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 transition-all disabled:opacity-30" 
                            onClick={handleResend}
                            disabled={resending}
                        >
                            {resending ? <Loader2 className="animate-spin size-4" /> : <RefreshCcw size={16} />}
                            Re-Transmit Signal
                        </button>
                    )}
                </div>

                <div className="absolute bottom-[-20px] left-[-20px] opacity-5 pointer-events-none ef-text-mono text-[60px] font-black">
                    VERIFY
                </div>
            </Card>
            
            <div className="mt-12 ef-text-mono text-[8px] opacity-20 flex justify-between uppercase">
                <div>Encryption Integrity: Verified</div>
                <div>Server Link: Active</div>
                <div>Node: FR-01-PARIS</div>
            </div>
        </div>
    );
};

export default OtpVerifyPage;
