import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const base = 'font-semibold rounded-full transition-all duration-200 cursor-pointer';

  const variants = {
    primary: 'bg-spotify-green text-black hover:bg-spotify-green-hover',
    secondary: 'bg-transparent border border-spotify-border text-white hover:border-white',
    ghost: 'bg-transparent text-spotify-subtext hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
