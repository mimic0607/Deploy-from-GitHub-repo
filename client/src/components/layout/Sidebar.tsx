import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/dataContext';
import {
  Shield,
  ChartPie,
  CheckCircle,
  Key,
  Vault,
  Lock,
  Share2,
  Cog,
  LogOut,
  User
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export default function Sidebar() {
  const [location] = useLocation();
  const { currentUser } = useData();
  
  const navItems: NavItem[] = [
    {
      icon: <ChartPie className="w-6 h-6" />,
      label: 'Dashboard',
      path: '/'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: 'Password Checker',
      path: '/password-checker'
    },
    {
      icon: <Key className="w-6 h-6" />,
      label: 'Password Generator',
      path: '/password-generator'
    },
    {
      icon: <Vault className="w-6 h-6" />,
      label: 'Password Vault',
      path: '/vault'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      label: 'Crypto Tools',
      path: '/crypto-tools'
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      label: 'Password Sharing',
      path: '/password-sharing'
    },
    {
      icon: <Cog className="w-6 h-6" />,
      label: 'Settings',
      path: '/settings'
    }
  ];

  return (
    <div className="glass-card w-full md:w-64 flex-shrink-0 border-r border-purple-500/20 overflow-y-auto md:h-screen h-auto">
      <div className="p-4 flex items-center justify-center md:justify-start border-b border-purple-500/20">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-500 text-white mr-2">
          <Shield className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold text-white">SecurePass</h1>
      </div>
      
      <div className="p-2">
        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.path}
                  className={cn(
                    "nav-item",
                    location === item.path && "nav-item-active"
                  )}
                >
                  <span className={cn(
                    "w-6 text-center transition-all duration-300",
                    location === item.path && "scale-110 text-white"
                  )}>
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: location === item.path ? "text-white" : "text-purple-500"
                    })}
                  </span>
                  <span className={cn(
                    "ml-2 transition-all duration-300",
                    location === item.path && "font-semibold text-white"
                  )}>
                    {item.label}
                  </span>
                  {location === item.path && (
                    <span className="ml-auto">
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-purple-500/20">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">{currentUser?.username || 'Guest'}</div>
            <div className="text-xs text-gray-400">{currentUser?.email || 'guest@example.com'}</div>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white transition-fade">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
