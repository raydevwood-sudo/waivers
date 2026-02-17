import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = ''
}) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl disabled:bg-gray-300',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 disabled:bg-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 disabled:text-gray-400'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-medium transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-primary/20
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
