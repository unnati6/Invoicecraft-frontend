import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Update path as needed

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white hover:bg-blue-500',
        secondary: 'border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'border-transparent bg-red-600 text-white hover:bg-red-500',
        outline: 'border border-gray-300 text-gray-900',
        'status-overdue': 'border-transparent bg-yellow-500 text-white hover:bg-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
