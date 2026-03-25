import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-white">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-md
          bg-spotify-elevated border border-spotify-border
          text-white placeholder-spotify-subtext
          focus:outline-none focus:border-white
          transition-colors duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
