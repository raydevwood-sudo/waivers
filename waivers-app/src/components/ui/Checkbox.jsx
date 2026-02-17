import React from 'react';

export default function Checkbox({ 
  id,
  name,
  label,
  checked,
  onChange,
  required = false,
  className = ''
}) {
  return (
    <label 
      htmlFor={id} 
      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        checked 
          ? 'bg-primary/5 border-primary' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-4 focus:ring-primary/20 focus:ring-offset-0 mt-0.5 flex-shrink-0 cursor-pointer"
      />
      <span className="text-base text-gray-700 flex-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
}
