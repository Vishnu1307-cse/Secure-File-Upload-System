import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '', title }) => {
    const baseStyles = 'ef-button-ghost focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ef-text-mono';
    
    if (variant === 'primary' || variant === 'danger') {
        const colorClass = variant === 'danger' ? '!bg-red-600 !text-white' : '';
        return (
            <button 
                type={type} 
                onClick={onClick} 
                disabled={disabled}
                title={title}
                className={`ef-button-primary ${colorClass} ${className}`}
            >
                {children}
            </button>
        );
    }

    return (
        <button 
            type={type} 
            onClick={onClick} 
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${className} ${variant === 'ghost' ? 'border-transparent hover:bg-zinc-800/50' : ''}`}
        >
            {children}
        </button>
    );
};

export default Button;
