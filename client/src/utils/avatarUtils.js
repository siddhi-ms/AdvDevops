/**
 * Avatar utilities for consistent avatar handling across the application
 */

// Avatar type constants
export const AVATAR_TYPES = {
  DEFAULT: 'default',
  UPLOAD: 'upload',
  URL: 'url',
  BASE64: 'base64'
};

/**
 * Get the display URL for an avatar
 * @param {Object} user - User object from API
 * @returns {string|null} - Avatar URL or null for default
 */
export const getAvatarUrl = (user) => {
  if (!user) return null;
  
  // If user has avatarUrl property (from processed backend response)
  if (user.avatarUrl) {
    return user.avatarUrl;
  }
  
  // If user has legacy avatar field (string)
  if (typeof user.avatar === 'string') {
    if (user.avatar === 'default' || user.avatar === '') {
      return null;
    }
    return user.avatar;
  }
  
  // If user has new avatar object structure
  if (typeof user.avatar === 'object' && user.avatar) {
    switch (user.avatar.type) {
      case AVATAR_TYPES.UPLOAD:
        return user.avatar.filename ? `/uploads/avatars/${user.avatar.filename}` : null;
      case AVATAR_TYPES.URL:
        return user.avatar.url || null;
      case AVATAR_TYPES.BASE64:
        return user.avatar.url || null;
      case AVATAR_TYPES.DEFAULT:
      default:
        return null;
    }
  }
  
  return null;
};

/**
 * Get avatar type for a user
 * @param {Object} user - User object from API
 * @returns {string} - Avatar type
 */
export const getAvatarType = (user) => {
  if (!user) return AVATAR_TYPES.DEFAULT;
  
  if (user.avatarType) {
    return user.avatarType;
  }
  
  if (typeof user.avatar === 'string') {
    if (user.avatar === 'default' || user.avatar === '') {
      return AVATAR_TYPES.DEFAULT;
    }
    if (user.avatar.startsWith('data:image/')) {
      return AVATAR_TYPES.BASE64;
    }
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return AVATAR_TYPES.URL;
    }
    return AVATAR_TYPES.UPLOAD;
  }
  
  if (typeof user.avatar === 'object' && user.avatar) {
    return user.avatar.type || AVATAR_TYPES.DEFAULT;
  }
  
  return AVATAR_TYPES.DEFAULT;
};

/**
 * Check if user has a custom avatar (not default)
 * @param {Object} user - User object from API
 * @returns {boolean} - True if user has custom avatar
 */
export const hasCustomAvatar = (user) => {
  const avatarUrl = getAvatarUrl(user);
  const avatarType = getAvatarType(user);
  return avatarUrl && avatarType !== AVATAR_TYPES.DEFAULT;
};

/**
 * Generate placeholder avatar URL using UI Avatars service
 * @param {string} name - User's name
 * @param {number} size - Avatar size in pixels
 * @param {string} background - Background color (random, or hex without #)
 * @returns {string} - Placeholder avatar URL
 */
export const generatePlaceholderAvatar = (name, size = 48, background = 'random') => {
  const userName = name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=${size}&background=${background}&color=fff&font-size=0.6&bold=true&initials=${initials}`;
};

/**
 * Get color for initials based on name
 * @param {string} name - User's name
 * @returns {string} - Hex color
 */
export const getInitialsColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A6F', '#C44569', '#F8B500', '#6C5CE7',
    '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055', '#00B894'
  ];
  
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return colors[hash % colors.length];
};

/**
 * Get initials from name
 * @param {string} name - User's name
 * @returns {string} - User initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Validate image file for avatar upload
 * @param {File} file - File object
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validateAvatarFile = (file) => {
  const errors = [];
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    errors.push('Please select a valid image file (JPEG, PNG, or WebP)');
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('Image size must be less than 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Get avatar display props for rendering
 * @param {Object} user - User object
 * @param {number} size - Size in pixels
 * @returns {Object} - Props for avatar component
 */
export const getAvatarDisplayProps = (user, size = 48) => {
  const userName = user?.name || 'User';
  const avatarUrl = getAvatarUrl(user);
  const avatarType = getAvatarType(user);
  const hasCustom = hasCustomAvatar(user);
  
  return {
    userName,
    avatarUrl,
    avatarType,
    hasCustom,
    placeholderUrl: generatePlaceholderAvatar(userName, size),
    initials: getInitials(userName),
    initialsColor: getInitialsColor(userName),
    fallbackProps: {
  className: "w-12 h-12 bg-gradient-to-br from-sky-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform border-2 border-gray-200 flex-shrink-0",
      style: { backgroundColor: getInitialsColor(userName) },
      children: getInitials(userName)
    }
  };
};