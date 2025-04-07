import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordStrengthChecker from '@/components/password-checker/PasswordStrengthChecker';

export default function PasswordChecker() {
  return (
    <AppLayout title="Password Checker">
      <div className="max-w-3xl mx-auto">
        {/* Introduction */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Password Strength Checker</h2>
          <p className="text-gray-300 mb-4">
            Our comprehensive password strength checker analyzes your password using multiple criteria to determine how secure it is. 
            It checks password length, character variety, common patterns, and even searches for your password in known data breaches.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-purple-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">What we check:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Password length (12+ characters recommended)
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Character variety (uppercase, lowercase, numbers, symbols)
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Common patterns and sequences
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Data breach presence via Have I Been Pwned
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Why it matters:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>Weak passwords are the #1 cause of account breaches</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>Reused passwords put multiple accounts at risk</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>Modern computing makes weak passwords easy to crack</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Password Checker Component */}
        <PasswordStrengthChecker />
        
        {/* Tips Section */}
        <div className="glass-card rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Tips for Strong Passwords</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 mt-1">
                1
              </div>
              <div>
                <h3 className="font-medium">Use passphrases instead of passwords</h3>
                <p className="text-sm text-gray-300">
                  Longer combinations of words are easier to remember and harder to crack.
                  Example: "horse-battery-correct-staple" instead of "p@ssw0rd"
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 mt-1">
                2
              </div>
              <div>
                <h3 className="font-medium">Avoid personal information</h3>
                <p className="text-sm text-gray-300">
                  Don't use birthdays, names, or other personal details that could be guessed or found online.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 mt-1">
                3
              </div>
              <div>
                <h3 className="font-medium">Use a different password for each account</h3>
                <p className="text-sm text-gray-300">
                  This prevents a single breach from compromising all your accounts. Use our password manager to keep track.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 mt-1">
                4
              </div>
              <div>
                <h3 className="font-medium">Enable two-factor authentication (2FA)</h3>
                <p className="text-sm text-gray-300">
                  Even the strongest password can be compromised. 2FA adds an additional layer of security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
