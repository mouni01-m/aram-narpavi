import React from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-[#0F3D2E] text-white',
      secondary: 'bg-[#3E7C4A] text-white',
      accent: 'bg-[#D6B25E] text-[#0F3D2E]',
      success: 'bg-green-100 text-green-800',
    };

    return (
      <span
        ref={ref}
        className={cn('inline-block px-3 py-1 rounded-full text-xs font-semibold', variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
