// Utility functions for generating and handling user avatars

export function generateLetterAvatar(firstName: string, lastName: string, size: number = 80): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  // Color palette for avatars
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055', '#00B894'
  ];
  
  // Generate consistent color based on name
  const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Calculate font size based on avatar size
  const fontSize = Math.round(size * 0.35);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial, sans-serif" 
            font-size="${fontSize}" font-weight="bold" fill="white" 
            text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function isValidImageType(file: File): boolean {
  return file.type.startsWith('image/');
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return { valid: false, error: 'Please select a valid image file' };
  }
  
  if (!isValidImageSize(file)) {
    return { valid: false, error: 'Image size should be less than 5MB' };
  }
  
  return { valid: true };
}
