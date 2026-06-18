import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#0f3d2e] to-[#3e7c4a] text-white hover:shadow-lg hover:from-[#0f3d2e] hover:to-[#2f6438]',
        secondary:
          'bg-gradient-to-r from-[#3e7c4a] to-[#2f6438] text-white hover:shadow-lg hover:from-[#2f6438] hover:to-[#0f3d2e]',
        accent: 'bg-gradient-to-r from-[#ff8c42] to-[#ffb366] text-white hover:shadow-lg',
        outline:
          'border-2 border-[#0f3d2e] text-[#0f3d2e] hover:bg-[#0f3d2e]/5 font-semibold',
        ghost: 'text-[#0f3d2e] hover:bg-[#0f3d2e]/10 font-semibold',
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
