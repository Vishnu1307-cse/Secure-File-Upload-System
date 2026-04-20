import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-500 dark:text-zinc-400 ml-1">
                    {label}
                </label>
            )}
            <input 
                className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`} 
                {...props} 
            />
            {error && (
                <span className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
