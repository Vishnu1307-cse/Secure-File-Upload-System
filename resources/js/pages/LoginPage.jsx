import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Loader2, Moon, Sun } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/request-otp', { email });
            sessionStorage.setItem('temp_email', email);
            toast({ type: 'success', title: 'Code Sent', message: 'Check your logs/email for the secure code.' });
            navigate('/verify-otp');
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please check your email.';
            setError(msg);
            toast({ type: 'error', title: 'Request Failed', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md pt-20">
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/20">S</div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">SecureVault</span>
                </div>
                <Button variant="ghost" onClick={toggleTheme} className="p-2 !w-auto">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
            </div>

            <Card>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-display mb-3 text-slate-900 dark:text-zinc-50">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-zinc-400">Enter your email to receive a secure login code.</p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error}
                        required
                    />

                    <Button type="submit" className="w-full" disabled={loading || !email}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>Request OTP <ArrowRight size={20} /></>
                        )}
                    </Button>
                </form>
            </Card>
            
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                Secure chunked encryption active for all account data.
            </p>
        </div>
    );
};

export default LoginPage;
