import { storage } from './storage';

// Function to add test data to the database
async function setupTestData() {
  console.log('Setting up test data...');
  
  // Create a test user if needed
  let testUser = await storage.getUserByEmail('test@example.com');
  if (!testUser) {
    testUser = await storage.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'secure_password', // In a real app, this would be properly hashed
      masterPassword: 'master_secure_password',
    });
    console.log('Created test user:', testUser);
  }
  
  // Get current vault items
  const vaultItems = await storage.getVaultItems(testUser.id);
  
  // Only add test passwords if there are no expiring passwords in the vault
  const hasExpiringPasswords = vaultItems.some(item => {
    if (!item.expiryDate) return false;
    
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays >= -14; // Includes passwords expired within the last 2 weeks
  });
  
  if (!hasExpiringPasswords) {
    // Create test passwords with different expiry dates
    
    // Password expiring in 2 days
    await storage.createVaultItem({
      userId: testUser.id,
      name: 'Bank Account',
      url: 'https://mybank.example.com',
      username: 'banking_user',
      password: 'encrypted_password_1',
      category: 'Finance',
      notes: 'Primary checking account',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    });
    
    // Password that expired yesterday
    await storage.createVaultItem({
      userId: testUser.id,
      name: 'Old Email',
      url: 'https://mail.example.com',
      username: 'old_email_user',
      password: 'encrypted_password_2',
      category: 'Email',
      notes: 'Secondary email account',
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });
    
    // Password expiring in 5 days
    await storage.createVaultItem({
      userId: testUser.id,
      name: 'Work VPN',
      url: 'https://vpn.company.example.com',
      username: 'vpn_user',
      password: 'encrypted_password_3',
      category: 'Work',
      notes: 'Company VPN access',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });
    
    console.log('Created test password entries with expiration dates');
  } else {
    console.log('Expiring passwords already exist, skipping creation');
  }
}

// Export the setup function
export { setupTestData };