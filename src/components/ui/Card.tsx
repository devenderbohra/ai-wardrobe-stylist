/**
 * Reusable Card component for consistent styling
 */

import React from 'react';
import { cn } from '@/src/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick
}) => {
  // Base card classes
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100';
  
  // Padding classes
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Hover effect
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer' : '';
  
  // Click handler
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        paddingClasses[padding],
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;