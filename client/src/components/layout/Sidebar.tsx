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
      icon: <ChartPie className="w-6 h-6 text-purple-primary" />,
      label: 'Dashboard',
      path: '/'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-purple-primary" />,
      label: 'Password Checker',
      path: '/password-checker'
    },
    {
      icon: <Key className="w-6 h-6 text-purple-primary" />,
      label: 'Password Generator',
      path: '/password-generator'
    },
    {
      icon: <Vault className="w-6 h-6 text-purple-primary" />,
      label: 'Password Vault',
      path: '/vault'
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-primary" />,
      label: 'Crypto Tools',
      path: '/crypto-tools'
    },
    {
      icon: <Share2 className="w-6 h-6 text-purple-primary" />,
      label: 'Password Sharing',
      path: '/password-sharing'
    },
    {
      icon: <Cog className="w-6 h-6 text-purple-primary" />,
      label: 'Settings',
      path: '/settings'
    }
  ];

  return (
    <div className="glass-card w-full md:w-64 flex-shrink-0 border-r border-purple-primary/20 overflow-y-auto md:h-screen h-auto">
      <div className="p-4 flex items-center justify-center md:justify-start border-b border-purple-primary/20">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-primary text-white mr-2">
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
                    "flex items-center p-3 rounded-lg text-white hover:bg-purple-primary/20 transition-fade mb-1 glow-effect",
                    location === item.path && "bg-purple-primary/20"
                  )}
                >
                  <span className="w-6 text-center">{item.icon}</span>
                  <span className="ml-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-purple-primary/20">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-primary flex items-center justify-center">
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
