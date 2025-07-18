import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ className, children, href, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
          "bg-primary text-primary-foreground px-4 py-2 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';