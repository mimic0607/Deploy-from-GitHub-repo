import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordStrengthChecker from '@/components/password-checker/PasswordStrengthChecker';
import PasswordGenerator from '@/components/password-generator/PasswordGenerator';
import PasswordHealth from '@/components/dashboard/PasswordHealth';

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      {/* Overview Cards */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Welcome to SecurePass</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-purple-primary/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Total Passwords</h3>
              <p className="text-2xl font-bold mt-1">27</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-primary/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Security Score</h3>
              <p className="text-2xl font-bold mt-1">85%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-primary/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Weak Passwords</h3>
              <p className="text-2xl font-bold mt-1 text-warning">4</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-primary/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Data Breaches</h3>
              <p className="text-2xl font-bold mt-1 text-danger">3</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-danger/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Utility Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PasswordStrengthChecker />
        <PasswordGenerator />
      </div>
      
      {/* Password Health Dashboard */}
      <PasswordHealth />
    </AppLayout>
  );
}
