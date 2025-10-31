import React from 'react';
import { getInitials, getInitialsColor, getAvatarUrl } from '../../utils/avatarUtils';

// Avatar component with enhanced functionality
export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  onClick,
  showUploadIcon = false 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white relative overflow-hidden transition-all duration-200 ${className}`;

  // Resolve a safe image source. `src` can be a string, an avatar object, or a user object.
  let imageSrc = null;

  if (typeof src === 'string') {
    // Only treat non-empty trimmed strings that aren't the explicit 'default'
    const trimmed = src.trim ? src.trim() : src;
    if (trimmed && trimmed !== 'default') imageSrc = trimmed;
  } else if (typeof src === 'object' && src) {
    // If callers passed a full user object, let getAvatarUrl handle it.
    // If they passed an avatar object, wrap it as `{ avatar: src }` so getAvatarUrl can process it.
    const possibleUser = src.avatar ? src : { avatar: src };
    try {
      imageSrc = getAvatarUrl(possibleUser);
    } catch (err) {
      imageSrc = null;
    }
  }

  // If we have a usable image URL, show the image
  if (imageSrc) {
    return (
      <div className={`${baseClasses} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`} onClick={onClick}>
        <img
          src={imageSrc}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show initials instead
            e.target.style.display = 'none';
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback initials (hidden by default) */}
        <div 
          className="absolute inset-0 flex items-center justify-center font-semibold text-white"
          style={{ 
            backgroundColor: getInitialsColor(name || 'User'),
            display: 'none'
          }}
        >
          {getInitials(name || 'User')}
        </div>
        {showUploadIcon && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Show initials with colored background
  return (
    <div 
      className={`${baseClasses} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{ backgroundColor: getInitialsColor(name || 'User') }}
      onClick={onClick}
    >
      {getInitials(name || 'User')}
      {showUploadIcon && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
    </div>
  );
}