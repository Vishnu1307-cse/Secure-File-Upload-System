import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, ShieldCheck, RefreshCcw, ArrowLeft, Sun, Moon } from 'lucide-react';
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
    const { isDark, toggleTheme } = useTheme();
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
            setError('Please enter the full 6-digit code.');
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
            
            toast({ type: 'success', title: 'Login Successful', message: 'Redirecting to your vault...' });
            setSuccess('Authenticated! Redirecting...');
            setTimeout(() => {
                const destination = response.data.user.role === 'admin' ? '/admin' : '/dashboard';
                navigate(destination);
            }, 1000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid code. Please try again.';
            setError(msg);
            toast({ type: 'error', title: 'Verification Failed', message: msg });
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
            toast({ type: 'success', message: 'New security code sent!' });
            setSuccess('New code sent!');
            setCountdown(60);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            toast({ type: 'error', message: 'Resend failed.' });
            setError('Could not resend code. Please try again later.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-md pt-20">
            <div className="flex justify-between items-center mb-12">
                <Button variant="ghost" onClick={() => navigate('/login')} className="!w-auto !py-2 !px-3 px-text-slate-500">
                    <ArrowLeft size={20} /> Back
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                </div>
                <Button variant="ghost" onClick={toggleTheme} className="p-2 !w-auto">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
            </div>

            <Card>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-zinc-50">Verify Identity</h1>
                    <p className="text-slate-500 dark:text-zinc-400">
                        We've sent a 6-digit code to <br/><span className="text-primary-600 dark:text-primary-400 font-semibold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div className="flex gap-2 justify-between">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                className="w-12 h-16 text-center text-2xl font-bold bg-zinc-100/50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none disabled:opacity-50"
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
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-500 text-center">{success}</p>}

                    <Button type="submit" className="w-full" disabled={loading || otp.join('').length < 6}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>Verify & Continue <ShieldCheck size={20} /></>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    {countdown > 0 ? (
                        <p className="text-sm text-slate-500 dark:text-zinc-500">
                            Resend code in <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{countdown}s</span>
                        </p>
                    ) : (
                        <button 
                            className="text-primary-600 hover:text-primary-700 font-bold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-50" 
                            onClick={handleResend}
                            disabled={resending}
                        >
                            {resending ? <Loader2 className="animate-spin size-4" /> : <RefreshCcw size={16} />}
                            Resend Code
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default OtpVerifyPage;
