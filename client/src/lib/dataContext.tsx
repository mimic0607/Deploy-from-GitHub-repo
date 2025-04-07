import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import type {
  User,
  VaultItem,
  PasswordShare,
  CryptoDocument,
  NewVaultItem,
  NewPasswordShare,
  PasswordHealthSummary
} from '@/types';
import { isWeakPassword, isPasswordExpired } from '@/lib/passwordUtils';

// Define the context interface
interface DataContextType {
  // User state
  currentUser: User | null;
  
  // Vault items
  vaultItems: VaultItem[];
  isLoadingVaultItems: boolean;
  addVaultItem: (item: NewVaultItem) => Promise<VaultItem>;
  updateVaultItem: (id: number, updates: Partial<VaultItem>) => Promise<VaultItem | undefined>;
  deleteVaultItem: (id: number) => Promise<boolean>;
  
  // Shared passwords
  sharedPasswords: PasswordShare[];
  isLoadingSharedPasswords: boolean;
  sharePassword: (share: NewPasswordShare) => Promise<PasswordShare>;
  
  // Crypto documents
  cryptoDocuments: CryptoDocument[];
  isLoadingCryptoDocuments: boolean;
  
  // Password health
  passwordHealth: PasswordHealthSummary;
  calculatePasswordHealth: () => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Context provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock current user - in a real app, this would come from authentication
  const [currentUser] = useState<User>({
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    twoFactorEnabled: false
  });
  
  // Vault items query
  const { 
    data: vaultItems = [], 
    isLoading: isLoadingVaultItems 
  } = useQuery({
    queryKey: ['/api/vault'],
    refetchOnWindowFocus: true
  });
  
  // Shared passwords query
  const { 
    data: sharedPasswords = [], 
    isLoading: isLoadingSharedPasswords 
  } = useQuery({
    queryKey: ['/api/shared-passwords'],
    refetchOnWindowFocus: true
  });
  
  // Crypto documents query
  const { 
    data: cryptoDocuments = [], 
    isLoading: isLoadingCryptoDocuments 
  } = useQuery({
    queryKey: ['/api/crypto-documents'],
    refetchOnWindowFocus: true
  });
  
  // Add vault item mutation
  const addVaultItemMutation = useMutation({
    mutationFn: async (item: NewVaultItem) => {
      const response = await apiRequest('POST', '/api/vault', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
    }
  });
  
  // Update vault item mutation
  const updateVaultItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<VaultItem> }) => {
      const response = await apiRequest('PUT', `/api/vault/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
    }
  });
  
  // Delete vault item mutation
  const deleteVaultItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/vault/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
    }
  });
  
  // Share password mutation
  const sharePasswordMutation = useMutation({
    mutationFn: async (share: NewPasswordShare) => {
      const response = await apiRequest('POST', '/api/share-password', share);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-passwords'] });
    }
  });
  
  // Password health calculation
  const [passwordHealth, setPasswordHealth] = useState<PasswordHealthSummary>({
    overallScore: 0,
    strongCount: 0,
    mediumCount: 0,
    weakCount: 0,
    totalCount: 0,
    breachedCount: 0,
    expiringCount: 0,
    reusedCount: 0,
    recentlyChanged: []
  });
  
  const calculatePasswordHealth = () => {
    if (!vaultItems.length) return;
    
    let strongCount = 0;
    let mediumCount = 0;
    let weakCount = 0;
    let breachedCount = 0;
    let expiringCount = 0;
    
    // Check for reused passwords
    const passwordCounts = new Map<string, number>();
    vaultItems.forEach(item => {
      const count = passwordCounts.get(item.password) || 0;
      passwordCounts.set(item.password, count + 1);
    });
    
    const reusedCount = Array.from(passwordCounts.values()).filter(count => count > 1).length;
    
    // Count by strength and other metrics
    vaultItems.forEach(item => {
      if (isWeakPassword(item.password)) {
        weakCount++;
      } else if (item.password.length >= 12 && 
                 /[A-Z]/.test(item.password) && 
                 /[a-z]/.test(item.password) && 
                 /[0-9]/.test(item.password) && 
                 /[^A-Za-z0-9]/.test(item.password)) {
        strongCount++;
      } else {
        mediumCount++;
      }
      
      if (isPasswordExpired(item.expiryDate)) {
        expiringCount++;
      }
    });
    
    // Calculate overall score (0-100)
    const totalCount = vaultItems.length;
    const overallScore = totalCount ? Math.round(
      ((strongCount * 100) + (mediumCount * 50)) / totalCount
    ) : 0;
    
    // Get recently changed passwords (last 3)
    const recentlyChanged = [...vaultItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    
    setPasswordHealth({
      overallScore,
      strongCount,
      mediumCount,
      weakCount,
      totalCount,
      breachedCount,
      expiringCount,
      reusedCount,
      recentlyChanged
    });
  };
  
  // Calculate password health when vault items change
  useEffect(() => {
    calculatePasswordHealth();
  }, [vaultItems]);
  
  // Wrap the mutation functions to match our API
  const addVaultItem = async (item: NewVaultItem): Promise<VaultItem> => {
    return await addVaultItemMutation.mutateAsync(item);
  };
  
  const updateVaultItem = async (id: number, updates: Partial<VaultItem>): Promise<VaultItem | undefined> => {
    return await updateVaultItemMutation.mutateAsync({ id, updates });
  };
  
  const deleteVaultItem = async (id: number): Promise<boolean> => {
    return await deleteVaultItemMutation.mutateAsync(id);
  };
  
  const sharePassword = async (share: NewPasswordShare): Promise<PasswordShare> => {
    return await sharePasswordMutation.mutateAsync(share);
  };
  
  // Provide the context value
  const contextValue: DataContextType = {
    currentUser,
    vaultItems,
    isLoadingVaultItems,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
    sharedPasswords,
    isLoadingSharedPasswords,
    sharePassword,
    cryptoDocuments,
    isLoadingCryptoDocuments,
    passwordHealth,
    calculatePasswordHealth
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
