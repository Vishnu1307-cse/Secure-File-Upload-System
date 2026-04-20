import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'bg-zinc-200 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-slate-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-slate-800 text-slate-600 dark:text-zinc-400 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
    };

    return (
        <button 
            className={`${variants[variant] || variants.primary} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
