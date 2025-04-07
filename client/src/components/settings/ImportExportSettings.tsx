import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/dataContext';
import { 
  Upload, 
  Download, 
  FileUp, 
  FileDown, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';

export default function ImportExportSettings() {
  const { toast } = useToast();
  const { vaultItems } = useData();
  
  const [importSettings, setImportSettings] = useState({
    file: null as File | null,
    format: 'csv',
    password: '',
    showPassword: false,
  });
  
  const [exportSettings, setExportSettings] = useState({
    format: 'json',
    encrypted: true,
    password: '',
    showPassword: false,
  });
  
  const [backupSettings, setBackupSettings] = useState({
    frequency: 'weekly',
    encrypted: true,
    password: '',
    showPassword: false,
  });
  
  const handleImportSettingChange = (key: string, value: any) => {
    setImportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleExportSettingChange = (key: string, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleBackupSettingChange = (key: string, value: any) => {
    setBackupSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImportSettingChange('file', e.target.files[0]);
    }
  };
  
  const handleImport = () => {
    if (!importSettings.file) {
      toast({
        title: "File required",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }
    
    if (importSettings.encrypted && !importSettings.password) {
      toast({
        title: "Password required",
        description: "Please enter the password to decrypt the import file",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate import
    toast({
      title: "Import successful",
      description: `Imported ${Math.floor(Math.random() * 10) + 5} credentials from ${importSettings.file.name}`,
    });
    
    // Reset form
    setImportSettings({
      file: null,
      format: 'csv',
      password: '',
      showPassword: false,
    });
  };
  
  const handleExport = () => {
    if (exportSettings.encrypted && !exportSettings.password) {
      toast({
        title: "Password required",
        description: "Please enter a password to encrypt the export file",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate export
    toast({
      title: "Export successful",
      description: `Exported ${vaultItems.length} credentials to ${exportSettings.format.toUpperCase()} format`,
    });
    
    // Create dummy download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('This is a simulated download'));
    element.setAttribute('download', `secure_pass_export.${exportSettings.format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleCreateBackup = () => {
    if (backupSettings.encrypted && !backupSettings.password) {
      toast({
        title: "Password required",
        description: "Please enter a password to encrypt the backup",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate backup
    toast({
      title: "Backup created",
      description: "Your vault has been successfully backed up",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Import</h3>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Upload className="h-5 w-5 text-purple-primary mr-2" />
            <h4 className="font-medium">Import Credentials</h4>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Import credentials from other password managers or CSV files.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="import-format">Import Format</Label>
              <Select
                value={importSettings.format}
                onValueChange={(value) => handleImportSettingChange('format', value)}
              >
                <SelectTrigger id="import-format" className="bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="lastpass">LastPass</SelectItem>
                  <SelectItem value="dashlane">Dashlane</SelectItem>
                  <SelectItem value="1password">1Password</SelectItem>
                  <SelectItem value="bitwarden">Bitwarden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="import-file">Select File</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="bg-purple-dark/50 border border-purple-primary/30 text-white hover:bg-purple-primary/20"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Browse
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.json,.xml"
                  onChange={handleFileChange}
                />
                <span className="text-sm text-gray-300">
                  {importSettings.file ? importSettings.file.name : 'No file selected'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="import-password">Decrypt Password (if encrypted)</Label>
              <div className="relative">
                <Input
                  id="import-password"
                  type={importSettings.showPassword ? 'text' : 'password'}
                  value={importSettings.password}
                  onChange={(e) => handleImportSettingChange('password', e.target.value)}
                  className="bg-purple-dark/50 border border-purple-primary/30 pr-10"
                  placeholder="Enter password if the file is encrypted"
                />
                <button
                  type="button"
                  onClick={() => handleImportSettingChange('showPassword', !importSettings.showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {importSettings.showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-300 text-sm flex items-start">
              <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Warning: Importing will add new credentials but won't overwrite existing ones with the same name.
                Make sure the import file comes from a trusted source.
              </span>
            </div>
            
            <Button
              className="bg-purple-primary hover:bg-purple-accent text-white"
              onClick={handleImport}
              disabled={!importSettings.file}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Credentials
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Export</h3>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Download className="h-5 w-5 text-purple-primary mr-2" />
            <h4 className="font-medium">Export Credentials</h4>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Export your credentials to a file for backup or transfer.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportSettings.format}
                onValueChange={(value) => handleExportSettingChange('format', value)}
              >
                <SelectTrigger id="export-format" className="bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="encrypted">Encrypted Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="encrypt-export"
                checked={exportSettings.encrypted}
                onChange={(e) => handleExportSettingChange('encrypted', e.target.checked)}
                className="accent-purple-primary h-4 w-4"
              />
              <Label htmlFor="encrypt-export" className="text-sm cursor-pointer">
                Encrypt export with password
              </Label>
            </div>
            
            {exportSettings.encrypted && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="export-password">Encryption Password</Label>
                <div className="relative">
                  <Input
                    id="export-password"
                    type={exportSettings.showPassword ? 'text' : 'password'}
                    value={exportSettings.password}
                    onChange={(e) => handleExportSettingChange('password', e.target.value)}
                    className="bg-purple-dark/50 border border-purple-primary/30 pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => handleExportSettingChange('showPassword', !exportSettings.showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {exportSettings.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-300 text-sm flex items-start">
              <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Warning: Exported files may contain sensitive information. 
                We strongly recommend encrypting your export with a strong password and storing it securely.
              </span>
            </div>
            
            <Button
              className="bg-purple-primary hover:bg-purple-accent text-white"
              onClick={handleExport}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export {vaultItems.length} Credentials
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Backup and Restore</h3>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Lock className="h-5 w-5 text-purple-primary mr-2" />
            <h4 className="font-medium">Vault Backup</h4>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Create and manage secure backups of your password vault.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="backup-frequency">Automatic Backup Frequency</Label>
              <Select
                value={backupSettings.frequency}
                onValueChange={(value) => handleBackupSettingChange('frequency', value)}
              >
                <SelectTrigger id="backup-frequency" className="bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never (Manual Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="encrypt-backup"
                checked={backupSettings.encrypted}
                onChange={(e) => handleBackupSettingChange('encrypted', e.target.checked)}
                className="accent-purple-primary h-4 w-4"
              />
              <Label htmlFor="encrypt-backup" className="text-sm cursor-pointer">
                Encrypt backup with password
              </Label>
            </div>
            
            {backupSettings.encrypted && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="backup-password">Backup Password</Label>
                <div className="relative">
                  <Input
                    id="backup-password"
                    type={backupSettings.showPassword ? 'text' : 'password'}
                    value={backupSettings.password}
                    onChange={(e) => handleBackupSettingChange('password', e.target.value)}
                    className="bg-purple-dark/50 border border-purple-primary/30 pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => handleBackupSettingChange('showPassword', !backupSettings.showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {backupSettings.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                className="bg-purple-primary hover:bg-purple-accent text-white"
                onClick={handleCreateBackup}
              >
                Create Backup Now
              </Button>
              
              <Button
                variant="outline"
                className="border-purple-primary text-purple-primary hover:bg-purple-primary/10"
                onClick={() => {
                  // Simulate file picker
                  toast({
                    title: "Restore from backup",
                    description: "Please select a backup file to restore",
                  });
                }}
              >
                Restore from Backup
              </Button>
            </div>
            
            <div className="bg-purple-primary/10 p-3 rounded-lg text-gray-300 text-sm">
              <h5 className="font-medium mb-1">Recent Backups</h5>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>backup_2023-10-15.enc</span>
                  <span>2023-10-15</span>
                </li>
                <li className="flex justify-between">
                  <span>backup_2023-10-08.enc</span>
                  <span>2023-10-08</span>
                </li>
                <li className="flex justify-between">
                  <span>backup_2023-10-01.enc</span>
                  <span>2023-10-01</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          className="bg-purple-primary hover:bg-purple-accent text-white"
          onClick={() => {
            toast({
              title: "Settings saved",
              description: "Your import/export preferences have been updated",
            });
          }}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
