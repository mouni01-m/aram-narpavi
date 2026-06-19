import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1E5631] text-white hover:bg-[#174526] hover:shadow-lg',
        secondary:
          'bg-[#4F8A3F] text-white hover:bg-[#3f7332] hover:shadow-lg',
        accent: 'bg-[#E69500] text-white hover:bg-[#c77f00] hover:shadow-lg',
        outline:
          'border border-[#1E5631] text-[#1E5631] hover:bg-[#EAF5E4] font-semibold',
        ghost: 'text-[#1E5631] hover:bg-[#EAF5E4] font-semibold',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-6 text-base rounded-xl',
        lg: 'h-12 px-8 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
