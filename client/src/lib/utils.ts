import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRelative(date: string | Date): string {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getDomainFromUrl(url?: string): string {
  if (!url) return '';
  
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
    return domain.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

export function calculatePasswordStrengthColor(score: number): string {
  if (score >= 8) return 'text-success';
  if (score >= 5) return 'text-warning';
  return 'text-danger';
}

export function calculatePasswordStrengthLabel(score: number): string {
  if (score >= 8) return 'Strong';
  if (score >= 5) return 'Medium';
  return 'Weak';
}

export function calculatePasswordStrengthEmoji(score: number): string {
  if (score >= 8) return '🔒';
  if (score >= 5) return '🔓';
  return '⚠️';
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        resolve(false);
      }
    }
  });
}

export function getRandomColor(): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getIconForCategory(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'social': return 'users';
    case 'banking': return 'landmark';
    case 'shopping': return 'shopping-cart';
    case 'work': return 'briefcase';
    case 'entertainment': return 'tv';
    case 'email': return 'mail';
    case 'education': return 'book';
    case 'health': return 'heart';
    case 'travel': return 'plane';
    default: return 'key';
  }
}

export function getIconForService(service: string): string {
  const lowercaseService = service.toLowerCase();
  
  if (lowercaseService.includes('google')) return 'google';
  if (lowercaseService.includes('facebook')) return 'facebook';
  if (lowercaseService.includes('twitter')) return 'twitter';
  if (lowercaseService.includes('amazon')) return 'amazon';
  if (lowercaseService.includes('netflix')) return 'tv';
  if (lowercaseService.includes('bank') || lowercaseService.includes('chase')) return 'landmark';
  if (lowercaseService.includes('apple')) return 'apple';
  if (lowercaseService.includes('microsoft')) return 'windows';
  if (lowercaseService.includes('github')) return 'github';
  if (lowercaseService.includes('linkedin')) return 'linkedin';
  
  return 'key';
}
