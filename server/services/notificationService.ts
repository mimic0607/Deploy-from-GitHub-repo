import { storage } from '../storage';
import { isPasswordExpiring, isPasswordExpired } from '../utils/passwordUtils';
import type { User, VaultItem } from '@shared/schema';

/**
 * Service for sending notifications about expiring passwords
 */
export class NotificationService {
  /**
   * Sends notifications about expiring passwords to a user
   * @param user User to notify
   * @param daysWarning Number of days before expiry to start warning (default: 7)
   * @param sendEmail Whether to send an email notification (default: false)
   * @returns Object containing the notification results
   */
  static async notifyExpiringPasswords(
    user: User, 
    daysWarning: number = 7,
    sendEmail: boolean = false
  ): Promise<{ expiringCount: number, expiredCount: number, emailSent: boolean, notificationSent: boolean }> {
    try {
      // Get the user's vault items
      const vaultItems = await storage.getVaultItems(user.id);
      
      // Find expiring and expired passwords
      const expiringItems = vaultItems.filter(item => 
        isPasswordExpiring(item.expiryDate, daysWarning) && !isPasswordExpired(item.expiryDate)
      );
      
      const expiredItems = vaultItems.filter(item => 
        isPasswordExpired(item.expiryDate)
      );
      
      // If requested, send email notifications
      let emailSent = false;
      if (sendEmail && user.email && (expiringItems.length > 0 || expiredItems.length > 0)) {
        const emailContent = this.createEmailContent(user, expiringItems, expiredItems, daysWarning);
        emailSent = await this.sendEmail(user.email, emailContent);
      }
      
      // Send real-time notification via WebSockets
      let notificationSent = false;
      if (global.broadcastNotification && (expiringItems.length > 0 || expiredItems.length > 0)) {
        // Create a notification for WebSocket
        const notification = {
          title: `Password Security Alert`,
          message: expiringItems.length > 0 
            ? `You have ${expiringItems.length} password(s) expiring soon.`
            : `You have ${expiredItems.length} expired password(s).`,
          severity: expiredItems.length > 0 ? 'error' : 'warning',
          data: {
            expiringCount: expiringItems.length,
            expiredCount: expiredItems.length,
            items: [
              ...expiredItems.map(item => ({ ...item, status: 'expired' })),
              ...expiringItems.map(item => ({ ...item, status: 'expiring' }))
            ].slice(0, 5) // Send first 5 items only to avoid large payloads
          }
        };
        
        // Send to specific user
        global.broadcastNotification(notification, user.id);
        notificationSent = true;
      }
      
      return {
        expiringCount: expiringItems.length,
        expiredCount: expiredItems.length,
        emailSent,
        notificationSent
      };
    } catch (error) {
      console.error('Error in notifyExpiringPasswords:', error);
      throw error;
    }
  }
  
  /**
   * Creates the email content for password expiry notifications
   * @private
   */
  private static createEmailContent(
    user: User,
    expiringItems: VaultItem[],
    expiredItems: VaultItem[],
    daysWarning: number
  ): { subject: string, body: string } {
    const subject = `Password Security Alert: ${expiredItems.length > 0 ? 'Expired' : 'Expiring'} Passwords`;
    
    let body = `Hello ${user.username},\n\n`;
    
    if (expiredItems.length > 0) {
      body += `You have ${expiredItems.length} expired password${expiredItems.length === 1 ? '' : 's'}:\n\n`;
      
      expiredItems.forEach(item => {
        // Handle case where expiryDate might be null or a Date object or a string
        const expiryDateStr = item.expiryDate ? 
          (typeof item.expiryDate === 'string' ? item.expiryDate : item.expiryDate.toString()) : 'Unknown';
          
        body += `- ${item.name} (${item.url || 'No URL'}) - Expired: ${expiryDateStr}\n`;
      });
      
      body += '\n';
    }
    
    if (expiringItems.length > 0) {
      body += `You have ${expiringItems.length} password${expiringItems.length === 1 ? '' : 's'} expiring in the next ${daysWarning} days:\n\n`;
      
      expiringItems.forEach(item => {
        // Handle case where expiryDate might be null or a Date object or a string
        const expiryDateStr = item.expiryDate ? 
          (typeof item.expiryDate === 'string' ? item.expiryDate : item.expiryDate.toString()) : '';
          
        const expiryDate = new Date(expiryDateStr);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        body += `- ${item.name} (${item.url || 'No URL'}) - Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}\n`;
      });
      
      body += '\n';
    }
    
    body += 'Please update these passwords as soon as possible to maintain account security.\n\n';
    body += 'Thank you,\nSecure Password Utility Suite';
    
    return { subject, body };
  }
  
  /**
   * Sends an email notification
   * @private
   */
  private static async sendEmail(
    email: string, 
    content: { subject: string, body: string }
  ): Promise<boolean> {
    try {
      // Check if we have necessary email service credentials
      if (process.env.SENDGRID_API_KEY) {
        // Using SendGrid for email
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: email,
          from: 'notifications@securepasswordutility.com', // Use a verified sender
          subject: content.subject,
          text: content.body,
        };
        
        await sgMail.send(msg);
        return true;
      } else if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
        // Alternative: Using Slack for notifications
        const { WebClient } = require('@slack/web-api');
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        
        await slack.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID,
          text: `${content.subject}\n\n${content.body}`,
        });
        return true;
      } else {
        // No email service configured - log for in-app notification only
        console.log(`Would send email to ${email}: ${content.subject}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }
}