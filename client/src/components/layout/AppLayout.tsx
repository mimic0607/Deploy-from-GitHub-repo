import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar - normal in desktop, hidden in mobile unless opened */}
      <div className={`${isMobile && !isMobileMenuOpen ? 'hidden' : 'block'} ${isMobile ? 'fixed inset-0 z-40 w-full md:w-64' : ''}`}>
        <Sidebar />
        
        {/* Dark overlay for mobile menu */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="glass-card p-4 sticky top-0 z-10 shadow-md border-b border-purple-500/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isMobile && (
                <button 
                  className="text-white mr-4"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
              <div className="relative">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-purple-500/20 transition-fade">
                <Bell className="h-5 w-5 text-purple-500" />
              </button>
              <button className="p-2 rounded-full hover:bg-purple-500/20 transition-fade">
                <HelpCircle className="h-5 w-5 text-purple-500" />
              </button>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-purple-500/20 transition-fade">
                  <Search className="h-5 w-5 text-purple-500" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
