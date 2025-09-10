/**
 * Reusable Card component for consistent styling
 */

import React from 'react';
import { cn } from '@/src/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'rounded-lg';
  
  const variants = {
    default: 'bg-white border border-gray-200',
    outline: 'border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardClasses = cn(
    baseClasses,
    variants[variant],
    paddings[padding],
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;