import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black border-white hover:bg-transparent hover:text-white',
        secondary:
          'bg-[#171717] text-white border-[#333333] hover:bg-[#262626] hover:border-[#888888]',
        outline:
          'bg-transparent border-[#333333] text-white hover:bg-white hover:text-black hover:border-white',
        ghost:
          'bg-transparent border-transparent text-white hover:bg-[#262626] hover:border-[#333333]',
        destructive:
          'bg-transparent text-[#ff4444] border-[#ff4444] hover:bg-[#ff4444] hover:text-black',
        link: 'bg-transparent border-transparent text-white underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
