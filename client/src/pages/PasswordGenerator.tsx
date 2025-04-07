import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordGenerator from '@/components/password-generator/PasswordGenerator';

export default function PasswordGeneratorPage() {
  return (
    <AppLayout title="Password Generator">
      <div className="max-w-3xl mx-auto">
        {/* Introduction */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Password Generator</h2>
          <p className="text-gray-300 mb-4">
            Generate secure, random passwords that are difficult to crack yet tailored to your needs.
            Our generator creates strong passwords with high entropy, making them resistant to brute force attacks
            and other common password cracking techniques.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Password Entropy</h3>
              <p className="text-sm text-gray-300 mb-2">
                Entropy measures randomness and unpredictability, which determines how resistant a password is to brute force attacks.
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Below 40 bits:</span>
                  <span className="text-danger">Very Weak</span>
                </li>
                <li className="flex justify-between">
                  <span>40-60 bits:</span>
                  <span className="text-warning">Weak</span>
                </li>
                <li className="flex justify-between">
                  <span>60-80 bits:</span>
                  <span className="text-warning">Reasonable</span>
                </li>
                <li className="flex justify-between">
                  <span>80-100 bits:</span>
                  <span className="text-success">Strong</span>
                </li>
                <li className="flex justify-between">
                  <span>100+ bits:</span>
                  <span className="text-success">Very Strong</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-500/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Customization Options</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Password length (longer is stronger)
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Character types (uppercase, lowercase, numbers, symbols)
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Exclude ambiguous characters (1, l, I, 0, O)
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Password Generator Component */}
        <PasswordGenerator />
        
        {/* Additional Information */}
        <div className="glass-card rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Why Use a Password Generator?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Humans are predictable</h3>
                <p className="text-sm text-gray-300">
                  Most people use patterns or personal information in passwords, making them easy to guess or crack.
                  Random generation eliminates this problem.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Increased entropy</h3>
                <p className="text-sm text-gray-300">
                  Our generator creates passwords with high entropy, making them practically impossible to crack through brute force methods.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Save time</h3>
                <p className="text-sm text-gray-300">
                  Generate strong, unique passwords for every account instantly without having to think of them yourself.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Perfect for password managers</h3>
                <p className="text-sm text-gray-300">
                  Generate complex passwords you don't need to remember and save them in your password vault for easy access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
