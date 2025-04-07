import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4", className)}>
      <div className="flex flex-1 items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}