import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered';
}

export default function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white rounded-lg shadow-md',
    bordered: 'bg-white rounded-lg border border-gray-200',
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
