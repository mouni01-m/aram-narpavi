import React from 'react';
import { cn } from '@/lib/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 border-b border-gray-100', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);
CardBody.displayName = 'CardBody';

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 border-t border-gray-100', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
