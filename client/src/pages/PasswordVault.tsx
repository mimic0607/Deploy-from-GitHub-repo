import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordVault from '@/components/vault/PasswordVault';

export default function PasswordVaultPage() {
  return (
    <AppLayout title="Password Vault">
      {/* Password Vault Component */}
      <PasswordVault />
      
      {/* Information Section */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Secure Password Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-500/10 p-4 rounded-lg">
            <div className="text-center mb-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="font-medium">AES Encryption</h3>
            </div>
            <p className="text-sm text-gray-300">
              Your vault is secured with industry-standard AES-256 encryption, which is virtually impossible to break through brute force methods.
            </p>
          </div>
          
          <div className="bg-purple-500/10 p-4 rounded-lg">
            <div className="text-center mb-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m16.24 7.76-4.24 4.24-4.24-4.24" />
                  <path d="m7.76 16.24 4.24-4.24 4.24 4.24" />
                </svg>
              </div>
              <h3 className="font-medium">Zero-Knowledge Design</h3>
            </div>
            <p className="text-sm text-gray-300">
              Your master password never leaves your device. We use client-side encryption, meaning we can't access your stored passwords even if we wanted to.
            </p>
          </div>
          
          <div className="bg-purple-500/10 p-4 rounded-lg">
            <div className="text-center mb-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-medium">Secure By Default</h3>
            </div>
            <p className="text-sm text-gray-300">
              Auto-logout, clipboard clearing, and password expiry reminders are just a few of the security features we've implemented to keep your data safe.
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-purple-500/20">
          <h3 className="font-medium mb-3">Vault Security Tips</h3>
          
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 12 5 5 9-9" />
              </svg>
              <span>Create a strong, unique master password that you don't use anywhere else</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 12 5 5 9-9" />
              </svg>
              <span>Enable two-factor authentication for an additional layer of security</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 12 5 5 9-9" />
              </svg>
              <span>Regularly export and backup your vault to prevent data loss</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 12 5 5 9-9" />
              </svg>
              <span>Never share your master password with anyone, even the support team</span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
