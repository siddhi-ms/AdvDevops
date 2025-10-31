import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, FileText, Image, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Avatar from './Avatar';
import { validateAvatarFile, fileToBase64 } from '../../utils/avatarUtils';

export default function EditProfile({ isOpen, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data when modal opens or profile data changes
  useEffect(() => {
    if (isOpen && profileData) {
      const initialData = {
        name: profileData.name || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || ''
      };
      setFormData(initialData);
      setImagePreview(profileData.avatar || '');
      setErrors({});
      setSuccessMessage('');
      setHasChanges(false);
    }
  }, [isOpen, profileData]);

  // Check for changes
  useEffect(() => {
    if (profileData) {
      const hasNameChange = formData.name !== (profileData.name || '');
      const hasBioChange = formData.bio !== (profileData.bio || '');
      const hasAvatarChange = formData.avatar !== (profileData.avatar || '');
      setHasChanges(hasNameChange || hasBioChange || hasAvatarChange);
    }
  }, [formData, profileData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        avatar: validation.errors[0]
      }));
      return;
    }

    setUploadingImage(true);
    setErrors(prev => ({ ...prev, avatar: '' }));

    try {
      // Convert to base64 for preview and storage
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      setFormData(prev => ({
        ...prev,
        avatar: base64
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      setErrors(prev => ({
        ...prev,
        avatar: 'Failed to process image. Please try again.'
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle avatar click to open file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Bio validation
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      setSuccessMessage('No changes to save');
      setTimeout(() => setSuccessMessage(''), 2000);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      console.log('Submitting profile update:', formData);
      await onSave(formData);
      
      setSuccessMessage('Profile updated successfully!');
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ 
        submit: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: profileData?.name || '',
      bio: profileData?.bio || '',
      avatar: profileData?.avatar || ''
    });
    setImagePreview(profileData?.avatar || '');
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] mx-auto transform transition-all duration-500 scale-100 animate-slideUp overflow-hidden flex flex-col">
        {/* Decorative Header Background */}
  <div className="relative bg-gradient-to-r from-sky-600 via-purple-600 to-cyan-600 rounded-t-3xl p-6">
          <div className="absolute inset-0 bg-black/10 rounded-t-3xl"></div>
          
          {/* Header Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-white/80 text-sm">Update your information</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Success Message */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slideDown">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative">
                <Avatar
                  src={imagePreview}
                  name={formData.name}
                  size="2xl"
                  onClick={handleAvatarClick}
                  showUploadIcon={!uploadingImage}
                  className="cursor-pointer hover:scale-105 transition-all duration-300 border-4 border-white shadow-xl"
                />
                
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-purple-600 text-white rounded-xl hover:from-sky-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <Camera size={18} />
                {imagePreview && imagePreview !== 'default' ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              {imagePreview && imagePreview !== 'default' && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 font-medium border border-gray-200"
                >
                  <X size={18} />
                  Remove
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {errors.avatar && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-600">{errors.avatar}</p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
              Upload a photo or we'll create a beautiful avatar with your initials. 
              <br />
              <span className="font-medium">Supported: JPEG, PNG, WebP • Max: 5MB</span>
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <User size={16} className="text-sky-600" />
                Full Name *
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 font-medium placeholder:text-gray-400 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
              {formData.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
              )}
            </div>
            {errors.name && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={14} />
                <p className="text-sm">{errors.name}</p>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">This is how others will see your name</span>
              <span className={`font-medium ${formData.name.length > 45 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.name.length}/50
              </span>
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-sky-600" />
                Bio
              </span>
            </label>
            <div className="relative">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none font-medium placeholder:text-gray-400 ${
                  errors.bio ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Tell others about yourself, your interests, and what you're passionate about teaching or learning..."
                disabled={loading}
              />
            </div>
            {errors.bio && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={14} />
                <p className="text-sm">{errors.bio}</p>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Share your experience, teaching style, or learning goals</span>
              <span className={`font-medium ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.bio.length}/500
              </span>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:cursor-not-allowed ${
                hasChanges && !loading
                  ? 'bg-gradient-to-r from-sky-600 to-purple-600 text-white hover:from-sky-700 hover:to-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || !hasChanges}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Change Indicator */}
          {hasChanges && !loading && (
            <div className="text-center">
              <p className="text-sm text-sky-600 font-medium">You have unsaved changes</p>
            </div>
          )}
        </form>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}