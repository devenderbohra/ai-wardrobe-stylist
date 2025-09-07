/**
 * Occasion selector component with pill-style buttons
 */

import React from 'react';
import { Occasion } from '@/src/types';
import { cn } from '@/src/utils';

export interface OccasionSelectorProps {
  selected: Occasion | null;
  onSelect: (occasion: Occasion) => void;
  occasions?: Occasion[];
  className?: string;
}

// Default occasions with icons and descriptions
const DEFAULT_OCCASIONS: Array<{
  value: Occasion;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed everyday wear',
    icon: '👕'
  },
  {
    value: 'work',
    label: 'Work',
    description: 'Professional business attire',
    icon: '💼'
  },
  {
    value: 'date',
    label: 'Date',
    description: 'Romantic dinner or date night',
    icon: '💕'
  },
  {
    value: 'formal',
    label: 'Formal',
    description: 'Elegant formal events',
    icon: '🎩'
  },
  {
    value: 'party',
    label: 'Party',
    description: 'Fun social gatherings',
    icon: '🎉'
  }
];

const OccasionSelector: React.FC<OccasionSelectorProps> = ({
  selected,
  onSelect,
  occasions,
  className
}) => {
  const occasionList = occasions 
    ? DEFAULT_OCCASIONS.filter(occ => occasions.includes(occ.value))
    : DEFAULT_OCCASIONS;

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900">
        Choose an Occasion
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {occasionList.map(({ value, label, description, icon }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              selected === value
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-semibold text-sm',
                  selected === value ? 'text-purple-900' : 'text-gray-900'
                )}>
                  {label}
                </h4>
                <p className={cn(
                  'text-xs mt-1 leading-relaxed',
                  selected === value ? 'text-purple-700' : 'text-gray-600'
                )}>
                  {description}
                </p>
              </div>
            </div>
            
            {/* Selection indicator */}
            {selected === value && (
              <div className="mt-3 flex items-center text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-xs font-medium">Selected</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OccasionSelector;