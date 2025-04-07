import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordSharingComponent from '@/components/password-sharing/PasswordSharing';

export default function PasswordSharing() {
  return (
    <AppLayout title="Password Sharing">
      {/* Password Sharing Component */}
      <PasswordSharingComponent />
      
      {/* Information Section */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Secure Sharing Best Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-primary/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 flex-shrink-0">1</span>
                <span>Choose a credential from your vault to share securely</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 flex-shrink-0">2</span>
                <span>We encrypt the credential using end-to-end encryption</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 flex-shrink-0">3</span>
                <span>A secure sharing link is generated for the recipient</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 flex-shrink-0">4</span>
                <span>Optional access code adds an additional layer of protection</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-3 flex-shrink-0">5</span>
                <span>The shared credential automatically expires after the set time period</span>
              </li>
            </ol>
          </div>
          
          <div className="bg-purple-primary/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Security Measures</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  <strong>End-to-End Encryption:</strong> Your shared passwords are encrypted before transmission and can only be decrypted by the recipient with the proper access code.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  <strong>Time-Limited Access:</strong> Shared credentials automatically expire after a period you define, from 1 hour to 7 days.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  <strong>Access Revocation:</strong> You can manually revoke access to any shared credential at any time.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  <strong>Separate Channels:</strong> For maximum security, send the access link and code through different communication channels.
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-purple-primary/20">
          <h3 className="font-medium mb-3">When to Use Password Sharing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-purple-primary mb-2">Recommended Use Cases</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                  <span>Sharing account access with trusted family members</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                  <span>Providing temporary access to team members</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                  <span>Emergency access for trusted contacts</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-danger mb-2">Not Recommended For</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                  <span>Sharing highly sensitive accounts (banking, etc.) without necessity</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                  <span>Sharing with unreliable or untrusted individuals</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                  <span>Using as a permanent sharing solution (create separate accounts instead)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
