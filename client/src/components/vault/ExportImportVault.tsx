import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { exportVaultData, importVaultData, verifyExportedData, ExportedVaultData } from "@/lib/decentralization";
import { Loader2, Download, Upload, Shield, Lock } from 'lucide-react';
import { VaultItem } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function ExportImportVault() {
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Fetch current vault items for export
  const { data: vaultItems, isLoading: isLoadingVault } = useQuery<VaultItem[]>({
    queryKey: ['/api/vault'],
  });
  
  // Handle vault import
  const importMutation = useMutation({
    mutationFn: async (items: VaultItem[]) => {
      // We need to import each item individually since our API doesn't support bulk import
      const results = [];
      for (const item of items) {
        // Remove ID to avoid conflicts
        const { id, ...itemData } = item;
        const response = await apiRequest('POST', '/api/vault', itemData);
        results.push(await response.json());
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
      toast({
        title: "Import successful",
        description: "Your vault items have been imported",
      });
      setImportPassword('');
      setImportFile(null);
      setIsImporting(false);
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
      setIsImporting(false);
    }
  });
  
  // Export vault data to a file
  const handleExport = () => {
    if (!exportPassword || exportPassword.length < 8) {
      toast({
        title: "Export failed",
        description: "Please enter a secure password (at least 8 characters)",
        variant: "destructive",
      });
      return;
    }
    
    if (!vaultItems || vaultItems.length === 0) {
      toast({
        title: "No data to export",
        description: "Your vault is empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Export the vault data with client-side encryption
      const exportData = exportVaultData(vaultItems, exportPassword);
      
      // Convert to JSON string and create blob
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `password-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      setExportPassword('');
      setIsExporting(false);
      
      toast({
        title: "Export successful",
        description: "Your vault data has been exported",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };
  
  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  // Import vault data from a file
  const handleImport = () => {
    if (!importPassword) {
      toast({
        title: "Import failed",
        description: "Please enter the password used for export",
        variant: "destructive",
      });
      return;
    }
    
    if (!importFile) {
      toast({
        title: "Import failed",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        // Parse the JSON data
        const importData = JSON.parse(event.target.result) as ExportedVaultData;
        
        // Verify the data format
        if (!verifyExportedData(importData)) {
          throw new Error('Invalid export file format');
        }
        
        // Decrypt and import the vault data
        const decryptedData = importVaultData<VaultItem[]>(importData, importPassword);
        
        // Update the vault with imported items
        importMutation.mutate(decryptedData);
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "An error occurred during import",
          variant: "destructive",
        });
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Could not read the file",
        variant: "destructive",
      });
      setIsImporting(false);
    };
    
    reader.readAsText(importFile);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Vault Import/Export
        </CardTitle>
        <CardDescription>
          Securely export and import your password vault with end-to-end encryption
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Vault</TabsTrigger>
            <TabsTrigger value="import">Import Vault</TabsTrigger>
          </TabsList>
          
          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exportPassword">Encryption Password</Label>
              <Input
                id="exportPassword"
                type="password"
                placeholder="Enter a secure password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This password will be used to encrypt your vault data. You'll need it to import the data later.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isLoadingVault ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading vault...
                  </span>
                ) : (
                  <span>Items to export: {vaultItems?.length || 0}</span>
                )}
              </div>
              
              <Button
                onClick={handleExport}
                disabled={isExporting || isLoadingVault || !vaultItems?.length}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </TabsContent>
          
          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">Select Backup File</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="importPassword">Decryption Password</Label>
              <Input
                id="importPassword"
                type="password"
                placeholder="Enter the export password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the password you used when exporting the vault.
              </p>
            </div>
            
            <Button
              onClick={handleImport}
              disabled={isImporting || !importFile || !importPassword}
              className="w-full flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? "Importing..." : "Import Vault"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          End-to-end encrypted. Your data never leaves your device unencrypted.
        </div>
      </CardFooter>
    </Card>
  );
}