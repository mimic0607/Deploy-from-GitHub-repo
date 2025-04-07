import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Vault, 
  Plus, 
  Copy, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaFacebook, FaAmazon, FaUniversity } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/dataContext';
import { formatDateRelative, calculatePasswordStrengthColor, calculatePasswordStrengthLabel, copyToClipboard } from '@/lib/utils';
import AddCredentialModal from './AddCredentialModal';
import type { VaultItem } from '@/types';

export default function PasswordVault() {
  const { toast } = useToast();
  const { vaultItems, isLoadingVaultItems, deleteVaultItem } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const itemsPerPage = 4;
  const categories = ['All Categories', 'Banking', 'Social', 'Work', 'Entertainment'];
  
  // Apply filters when dependencies change
  useEffect(() => {
    if (!vaultItems) return;
    
    let filtered = [...vaultItems];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.username.toLowerCase().includes(term) ||
        (item.url && item.url.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
    // Reset to first page when filters change
    setPage(1);
  }, [vaultItems, searchTerm, selectedCategory]);
  
  const currentItems = filteredItems.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await deleteVaultItem(id);
        toast({
          title: "Credential deleted",
          description: "The credential has been removed from your vault",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete credential. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleEdit = (item: VaultItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };
  
  const handleCopyPassword = async (id: number, password: string) => {
    if (await copyToClipboard(password)) {
      setCopiedId(id);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard",
        duration: 2000
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy password to clipboard",
        variant: "destructive"
      });
    }
  };
  
  const getIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('google')) return <FaGoogle className="text-2xl" />;
    if (lowercaseName.includes('facebook')) return <FaFacebook className="text-2xl" />;
    if (lowercaseName.includes('amazon')) return <FaAmazon className="text-2xl" />;
    if (lowercaseName.includes('bank') || lowercaseName.includes('chase')) return <FaUniversity className="text-2xl" />;
    
    // First letter of the name as a fallback
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <>
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Vault className="h-6 w-6 text-purple-primary mr-2" />
            Password Vault
          </h2>
          <Button
            className="bg-purple-primary text-white px-4 py-2 rounded-full flex items-center glow-effect hover:bg-purple-accent transition-fade"
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Add New</span>
          </Button>
        </div>
        
        {/* Vault Search & Filters */}
        <div className="flex flex-col md:flex-row mb-6 gap-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search vault..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-purple-primary transition-fade" 
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex space-x-4">
            <select 
              className="bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-primary transition-fade"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoadingVaultItems && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your vault...</p>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoadingVaultItems && filteredItems.length === 0 && (
          <div className="text-center py-10">
            <Vault className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Your vault is empty</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'All Categories'
                ? "No credentials match your search filters."
                : "Add your first password to get started."}
            </p>
            {searchTerm || selectedCategory !== 'All Categories' ? (
              <Button 
                variant="outline"
                className="border-purple-primary text-purple-primary hover:bg-purple-primary/10"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                className="bg-purple-primary text-white hover:bg-purple-accent"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
              >
                Add Password
              </Button>
            )}
          </div>
        )}
        
        {/* Password Items */}
        {!isLoadingVaultItems && filteredItems.length > 0 && (
          <div className="space-y-4">
            {currentItems.map(item => (
              <div key={item.id} className="glass-card rounded-xl p-4 hover:bg-purple-primary/10 transition-fade glow-effect cursor-pointer">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-purple-dark flex items-center justify-center text-purple-primary border border-purple-primary/30">
                    {getIcon(item.name)}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-purple-primary/20 transition-fade" 
                      title="Copy Password"
                      onClick={() => handleCopyPassword(item.id, item.password)}
                    >
                      {copiedId === item.id ? 
                        <Check className="h-4 w-4" /> : 
                        <Copy className="h-4 w-4" />
                      }
                    </button>
                    <button 
                      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-purple-primary/20 transition-fade" 
                      title="Edit"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-danger p-2 rounded-full hover:bg-purple-primary/20 transition-fade" 
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {item.category && (
                      <span className="text-xs bg-purple-primary/20 text-purple-primary px-2 py-1 rounded-full mr-2">
                        {item.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Last used: {item.lastUsed ? formatDateRelative(item.lastUsed) : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs flex items-center ${calculatePasswordStrengthColor(item.password.length > 12 ? 8 : 5)} mr-2`}>
                      <span className={`mr-1 h-2 w-2 rounded-full ${calculatePasswordStrengthColor(item.password.length > 12 ? 8 : 5)} bg-current`}></span>
                      {calculatePasswordStrengthLabel(item.password.length > 12 ? 8 : 5)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {filteredItems.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              Showing {Math.min(filteredItems.length, itemsPerPage)} of {filteredItems.length} items
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 rounded-md bg-purple-dark/50 border border-purple-primary/30 hover:bg-purple-primary/20 transition-fade"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? "default" : "outline"}
                    size="sm"
                    className={pageNumber === page 
                      ? "px-3 py-1 rounded-md bg-purple-primary text-white hover:bg-purple-accent transition-fade"
                      : "px-3 py-1 rounded-md bg-purple-dark/50 border border-purple-primary/30 hover:bg-purple-primary/20 transition-fade"
                    }
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 rounded-md bg-purple-dark/50 border border-purple-primary/30 hover:bg-purple-primary/20 transition-fade"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editItem={editingItem}
      />
    </>
  );
}
