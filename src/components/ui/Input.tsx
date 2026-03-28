import React, { type ReactNode, useState } from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: ReactNode;
  infoTooltip?: ReactNode;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  infoTooltip,
  showPasswordToggle = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const inputType = showPasswordToggle && type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className="flex flex-col gap-1 w-full relative">
      {label && (
        <div className="flex items-center gap-1">
          <label className="text-sm font-semibold text-white">{label}</label>
          {infoTooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <HelpCircle size={14} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-full mt-2 z-50 w-64 p-3 bg-gray-900 border border-white/10 rounded-lg shadow-xl">
                  {infoTooltip}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-md
            bg-spotify-elevated border border-spotify-border
            text-white placeholder-spotify-subtext
            focus:outline-none focus:border-white
            transition-colors duration-200
            ${error ? 'border-red-500' : ''}
            ${icon ? 'pl-10' : ''}
            ${showPasswordToggle ? 'pr-10' : ''}
            ${className}
          `}
          type={inputType}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
