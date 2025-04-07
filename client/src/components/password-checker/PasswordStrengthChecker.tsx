import React, { useState } from 'react';
import { CheckCircle, EyeOff, Eye, AlertTriangle, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzePassword } from '@/lib/passwordUtils';
import type { PasswordStrength } from '@/types';

export default function PasswordStrengthChecker() {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordStrength | null>(null);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setAnalysis(null); // Clear previous analysis
  };
  
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleAnalyzePassword = async () => {
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter a password to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setAnalyzing(true);
      const result = await analyzePassword(password);
      setAnalysis(result);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Could not analyze password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const getResultIcon = (status: boolean) => {
    return status ? (
      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white mr-3">
        <CheckCircle className="h-3 w-3" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-danger flex items-center justify-center text-white mr-3">
        <X className="h-3 w-3" />
      </div>
    );
  };
  
  const getWarningIcon = () => {
    return (
      <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center text-white mr-3">
        <AlertTriangle className="h-3 w-3" />
      </div>
    );
  };
  
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="text-center mb-4">
        <div className="inline-block rounded-full h-16 w-16 flex items-center justify-center bg-purple-primary/20 mb-3">
          <CheckCircle className="h-8 w-8 text-purple-primary" />
        </div>
        <h2 className="text-xl font-bold">Password Strength Checker</h2>
      </div>
      
      <div className="relative mb-6">
        <input 
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password to check..."
          value={password}
          onChange={handlePasswordChange}
          className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:border-purple-primary transition-fade"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAnalyzePassword();
          }}
        />
        <button 
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-fade"
          title="Toggle Visibility"
          onClick={handleTogglePassword}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {analysis && (
        <>
          <div className="mb-6">
            <div className="flex justify-between mb-2 items-center">
              <span className="text-sm font-medium">Strength Score</span>
              <span className="text-purple-primary font-semibold">{analysis.score}/10</span>
            </div>
            <div className="h-2 w-full bg-purple-dark/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-primary to-cyan-500"
                style={{ width: `${analysis.score * 10}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Weak</span>
              <span className="text-xs text-gray-400">Strong</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              {getResultIcon(analysis.length >= 12)}
              <div>
                <h4 className="text-sm font-medium">Length</h4>
                <p className="text-xs text-gray-400">
                  {analysis.length >= 12 
                    ? `Password is ${analysis.length} characters long (good)`
                    : `Password is too short (${analysis.length} characters)`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {getResultIcon(
                analysis.hasUppercase && 
                analysis.hasLowercase && 
                analysis.hasNumbers
              )}
              <div>
                <h4 className="text-sm font-medium">Character Variety</h4>
                <p className="text-xs text-gray-400">
                  {analysis.hasUppercase && analysis.hasLowercase && analysis.hasNumbers
                    ? 'Contains uppercase, lowercase, and numbers'
                    : 'Missing some character types'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {analysis.hasSymbols ? getResultIcon(true) : getWarningIcon()}
              <div>
                <h4 className="text-sm font-medium">Special Characters</h4>
                <p className="text-xs text-gray-400">
                  {analysis.hasSymbols
                    ? 'Contains special characters like !@#$%'
                    : 'Missing special characters like !@#$%'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {getResultIcon(!analysis.hasCommonPatterns)}
              <div>
                <h4 className="text-sm font-medium">Common Patterns</h4>
                <p className="text-xs text-gray-400">
                  {analysis.hasCommonPatterns
                    ? 'Contains common patterns or sequences'
                    : 'No common patterns detected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {getResultIcon(!analysis.breached)}
              <div>
                <h4 className="text-sm font-medium">Data Breach Check</h4>
                <p className={`text-xs ${analysis.breached ? 'text-danger' : 'text-gray-400'}`}>
                  {analysis.breached
                    ? 'This password appeared in data breaches'
                    : 'Not found in known data breaches'}
                </p>
              </div>
            </div>
          </div>
          
          {analysis.suggestions.length > 0 && (
            <div className="bg-purple-primary/10 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 text-purple-primary mr-2" />
                Improvement Suggestions
              </h4>
              <ul className="text-xs space-y-2 text-gray-300">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      
      <Button
        className="w-full bg-purple-primary hover:bg-purple-accent text-white py-3 rounded-full font-medium transition-fade glow-effect mt-2"
        onClick={handleAnalyzePassword}
        disabled={analyzing}
        type="button"
        size="lg"
      >
        <CheckCircle className="h-5 w-5 mr-2" />
        {analyzing ? 'Analyzing...' : (analysis ? 'Check Another Password' : 'Check Password Strength')}
      </Button>
    </div>
  );
}
