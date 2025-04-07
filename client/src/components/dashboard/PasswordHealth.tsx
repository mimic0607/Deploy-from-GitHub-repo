import React from 'react';
import { useLocation } from 'wouter';
import { 
  HeartPulse, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/dataContext';
import { formatDateRelative, calculatePasswordStrengthColor, calculatePasswordStrengthLabel } from '@/lib/utils';

export default function PasswordHealth() {
  const [_, navigate] = useLocation();
  const { passwordHealth } = useData();
  
  const { 
    overallScore, 
    strongCount, 
    mediumCount, 
    weakCount, 
    totalCount, 
    breachedCount, 
    expiringCount, 
    reusedCount,
    recentlyChanged
  } = passwordHealth;

  const percentStrong = totalCount ? Math.round((strongCount / totalCount) * 100) : 0;
  const percentMedium = totalCount ? Math.round((mediumCount / totalCount) * 100) : 0;
  const percentWeak = totalCount ? Math.round((weakCount / totalCount) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <HeartPulse className="h-6 w-6 text-purple-500 mr-2" />
          Password Health Dashboard
        </h2>
        <Button
          variant="link"
          className="text-sm text-purple-500 hover:text-purple-light transition-fade flex items-center"
          onClick={() => navigate('/vault')}
        >
          <span>View Full Report</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Health Score */}
        <div className="bg-purple-500/10 rounded-xl p-4 text-center">
          <h3 className="text-sm font-medium mb-2">Overall Health Score</h3>
          <div className="relative inline-block mb-1">
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3d1b5c"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray={`${(overallScore / 100) * 100}, 100`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a76dff" />
                  <stop offset="100%" stopColor="#5ee7df" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-2xl font-bold block">{overallScore}%</span>
              <span className="text-xs text-gray-400">
                {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300">
            {strongCount} out of {totalCount} passwords are strong
          </p>
        </div>
        
        {/* Password Strength Distribution */}
        <div className="bg-purple-500/10 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2">Strength Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Strong</span>
                <span>{strongCount} passwords</span>
              </div>
              <div className="h-2 w-full bg-purple-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success" 
                  style={{ width: `${percentStrong}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Medium</span>
                <span>{mediumCount} passwords</span>
              </div>
              <div className="h-2 w-full bg-purple-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning" 
                  style={{ width: `${percentMedium}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Weak</span>
                <span>{weakCount} passwords</span>
              </div>
              <div className="h-2 w-full bg-purple-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-danger" 
                  style={{ width: `${percentWeak}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <Button
              variant="outline"
              className="w-full bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500/10 py-1.5 rounded-full text-sm transition-fade"
              onClick={() => navigate('/vault')}
            >
              Fix Weak Passwords
            </Button>
          </div>
        </div>
        
        {/* Security Alerts */}
        <div className="bg-purple-500/10 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2">Security Alerts</h3>
          <div className="space-y-3">
            {breachedCount > 0 && (
              <div className="flex items-start bg-danger/10 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-danger mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium">{breachedCount} passwords appeared in data breaches</p>
                  <p className="text-xs text-gray-400">Last checked: Today</p>
                </div>
              </div>
            )}
            {expiringCount > 0 && (
              <div className="flex items-start bg-warning/10 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-warning mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium">{expiringCount} passwords are due for rotation</p>
                  <p className="text-xs text-gray-400">Older than 90 days</p>
                </div>
              </div>
            )}
            {reusedCount > 0 && (
              <div className="flex items-start bg-purple-500/10 p-2 rounded-lg">
                <Copy className="h-4 w-4 text-purple-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium">{reusedCount} reused passwords detected</p>
                  <p className="text-xs text-gray-400">Using unique passwords is recommended</p>
                </div>
              </div>
            )}
            {breachedCount === 0 && expiringCount === 0 && reusedCount === 0 && (
              <div className="flex items-start bg-success/10 p-2 rounded-lg">
                <HeartPulse className="h-4 w-4 text-success mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium">Your password health is good!</p>
                  <p className="text-xs text-gray-400">No urgent issues detected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recently Modified Passwords */}
      {recentlyChanged.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Recently Changed Passwords</h3>
          <div className="bg-purple-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="py-3 px-4 text-left font-medium">Service</th>
                  <th className="py-3 px-4 text-left font-medium">Username</th>
                  <th className="py-3 px-4 text-left font-medium">Changed</th>
                  <th className="py-3 px-4 text-left font-medium">Strength</th>
                </tr>
              </thead>
              <tbody>
                {recentlyChanged.map((item, index) => (
                  <tr key={item.id} className={index < recentlyChanged.length - 1 ? "border-b border-purple-500/10" : ""}>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4 text-gray-400">{item.username}</td>
                    <td className="py-2 px-4 text-gray-400">{formatDateRelative(item.createdAt)}</td>
                    <td className="py-2 px-4">
                      <span className={`flex items-center ${calculatePasswordStrengthColor(item.password.length > 12 ? 8 : 5)}`}>
                        <span className={`h-2 w-2 rounded-full mr-1 ${calculatePasswordStrengthColor(item.password.length > 12 ? 8 : 5)} bg-current`}></span>
                        {calculatePasswordStrengthLabel(item.password.length > 12 ? 8 : 5)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
