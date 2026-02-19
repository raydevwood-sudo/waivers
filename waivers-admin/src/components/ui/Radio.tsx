import type { ChangeEvent } from 'react';

interface RadioProps {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Radio({ 
  id,
  name,
  value,
  label,
  description,
  checked,
  onChange,
  className = ''
}: RadioProps) {
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
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        className="w-5 h-5 border-gray-300 text-primary focus:ring-4 focus:ring-primary/20 focus:ring-offset-0 mt-0.5 flex-shrink-0 cursor-pointer"
      />
      <div className="flex-1">
        <div className="text-base font-medium text-gray-900">{label}</div>
        {description && <div id={`${id}-description`} className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
    </label>
  );
}
