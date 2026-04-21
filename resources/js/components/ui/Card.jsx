import React from 'react';

const Card = ({ children, className = '', animate = true }) => {
    return (
        <div className={`
            ef-panel ef-corner-border p-6 rounded-sm
            ${animate ? 'transition-all duration-500' : ''}
            ${className}
        `}>
            {/* Technical Detail Elements */}
            <div className="absolute top-1 right-1 opacity-20 pointer-events-none">
                <div className="text-[8px] font-mono tracking-widest uppercase">ID: 0x-SF-VT</div>
            </div>
            
            {children}
        </div>
    );
};

export default Card;
