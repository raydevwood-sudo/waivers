import React from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  placeholder?: string;
  label?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

export default function Input({ 
  id,
  name,
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  onInput,
  required = false,
  pattern,
  minLength,
  maxLength,
  autoComplete,
  className = ''
}: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onInput={onInput}
        required={required}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none hover:border-gray-300"
      />
    </div>
  );
}
