import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PageTitle({ title, subtitle, icon, className }: PageTitleProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={cn("relative mb-6", className)}>
      <div className="flex items-center">
        {icon && (
          <div className="mr-3 transform transition-all duration-500 ease-out animate-fadeIn">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold relative">
            {title}
            <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" 
              style={{ 
                width: animationComplete ? '100%' : '0%',
                transition: 'width 0.6s ease-in-out' 
              }}
            />
          </h1>
          {subtitle && (
            <p className="text-gray-400 mt-1 animate-fadeSlideUp">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div 
        className="absolute -z-10 top-0 left-0 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
        style={{
          transform: animationComplete ? 'scale(1)' : 'scale(0)',
          opacity: animationComplete ? 0.5 : 0,
          transition: 'all 0.8s ease-out',
        }}
      />
    </div>
  );
}