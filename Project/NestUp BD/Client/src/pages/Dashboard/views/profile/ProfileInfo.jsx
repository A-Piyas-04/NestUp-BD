import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Shield, 
  Bell, 
  Globe, 
  Camera,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import './ProfileInfo.css';

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nidNumber: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    institution: '',
    department: '',
    studentId: '',
    address: {
      division: '',
      district: '',
      area: '',
      fullAddress: '',
      postalCode: ''
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    preferences: {
      receiveNotifications: true,
      newsletterSubscription: false,
      twoFactorAuth: false,
      language: 'english'
    },
    profilePicture: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        nidNumber: user.profile?.nidNumber || '',
        dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
        gender: user.profile?.gender || '',
        occupation: user.profile?.occupation || '',
        institution: user.profile?.institution || '',
        department: user.profile?.department || '',
        studentId: user.profile?.studentId || '',
        address: {
          division: user.profile?.address?.division || '',
          district: user.profile?.address?.district || '',
          area: user.profile?.address?.area || '',
          fullAddress: user.profile?.address?.fullAddress || '',
          postalCode: user.profile?.address?.postalCode || ''
        },
        emergencyContact: {
          name: user.profile?.emergencyContact?.name || '',
          relation: user.profile?.emergencyContact?.relation || '',
          phone: user.profile?.emergencyContact?.phone || ''
        },
        preferences: {
          receiveNotifications: user.profile?.preferences?.receiveNotifications ?? true,
          newsletterSubscription: user.profile?.preferences?.newsletterSubscription ?? false,
          twoFactorAuth: user.profile?.preferences?.twoFactorAuth ?? false,
          language: user.profile?.preferences?.language || 'english'
        },
        profilePicture: user.profile?.profilePicture || null
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHasUnsavedChanges(true);
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHasUnsavedChanges(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updateData = {
        name: profileData.fullName,
        profile: {
          phone: profileData.phone,
          nidNumber: profileData.nidNumber,
          dateOfBirth: profileData.dateOfBirth,
          gender: profileData.gender,
          occupation: profileData.occupation,
          institution: profileData.institution,
          department: profileData.department,
          studentId: profileData.studentId,
          address: profileData.address,
          emergencyContact: profileData.emergencyContact,
          preferences: profileData.preferences,
          profilePicture: profileData.profilePicture
        }
      };

      const success = await updateUser(updateData, true);
      
      if (success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setEditingSection(null);
        setHasUnsavedChanges(false);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setIsEditing(false);
        setEditingSection(null);
        setHasUnsavedChanges(false);
        // Reset data to original state
        if (user) {
          setProfileData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.profile?.phone || '',
            nidNumber: user.profile?.nidNumber || '',
            dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
            gender: user.profile?.gender || '',
            occupation: user.profile?.occupation || '',
            institution: user.profile?.institution || '',
            department: user.profile?.department || '',
            studentId: user.profile?.studentId || '',
            address: {
              division: user.profile?.address?.division || '',
              district: user.profile?.address?.district || '',
              area: user.profile?.address?.area || '',
              fullAddress: user.profile?.address?.fullAddress || '',
              postalCode: user.profile?.address?.postalCode || ''
            },
            emergencyContact: {
              name: user.profile?.emergencyContact?.name || '',
              relation: user.profile?.emergencyContact?.relation || '',
              phone: user.profile?.emergencyContact?.phone || ''
            },
            preferences: {
              receiveNotifications: user.profile?.preferences?.receiveNotifications ?? true,
              newsletterSubscription: user.profile?.preferences?.newsletterSubscription ?? false,
              twoFactorAuth: user.profile?.preferences?.twoFactorAuth ?? false,
              language: user.profile?.preferences?.language || 'english'
            },
            profilePicture: user.profile?.profilePicture || null
          });
        }
      }
    } else {
      setIsEditing(!isEditing);
      setEditingSection(null);
    }
  };

  const ProfileHeader = () => (
    <div className="profile-header-modern">
      <div className="profile-avatar-section">
        <div className="profile-avatar-container">
          {profileData.profilePicture ? (
            <img 
              src={profileData.profilePicture} 
              alt="Profile" 
              className="profile-avatar" 
            />
          ) : (
            <div className="profile-avatar-placeholder">
              <User size={48} />
            </div>
          )}
          {isEditing && (
            <label className="avatar-upload-overlay">
              <Camera size={20} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePicture}
                className="avatar-upload-input"
              />
            </label>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profileData.fullName || 'Your Name'}</h1>
          <p className="profile-role">
            {profileData.occupation === 'student' 
              ? `Student at ${profileData.institution || 'Institution'}` 
              : (profileData.occupation || 'No occupation specified')}
          </p>
          <div className="profile-contact">
            <span className="contact-item">
              <Mail size={16} />
              {profileData.email}
            </span>
            {profileData.phone && (
              <span className="contact-item">
                <Phone size={16} />
                {profileData.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="profile-actions">
        {hasUnsavedChanges && (
          <div className="unsaved-indicator">
            <AlertCircle size={16} />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );

  const FormField = ({ label, name, type = 'text', value, options, icon: Icon, required = false, disabled = false }) => (
    <div className="form-field">
      <label className="form-label">
        {Icon && <Icon size={16} />}
        {label}
        {required && <span className="required">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing || disabled}
          className="form-input"
          required={required}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing || disabled}
          className="form-input form-textarea"
          required={required}
          rows={3}
        />
      ) : type === 'checkbox' ? (
        <label className="checkbox-label">
          <input
            type="checkbox"
            name={name}
            checked={value}
            onChange={handleChange}
            disabled={!isEditing || disabled}
            className="checkbox-input"
          />
          <span className="checkbox-custom"></span>
          <span className="checkbox-text">{label}</span>
        </label>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing || disabled}
          className="form-input"
          required={required}
        />
      )}
    </div>
  );

  return (
    <div className="profile-container-modern">
      {/* Messages */}
      {successMessage && (
        <div className="message message-success">
          <Check size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="message message-error">
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="profile-top-actions">
        {isEditing ? (
          <>
            <button 
              className="btn-action btn-save"
              onClick={handleSubmit}
              disabled={isLoading || !hasUnsavedChanges}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button 
              className="btn-action btn-cancel"
              onClick={toggleEdit}
              disabled={isLoading}
            >
              <X size={18} />
              Cancel
            </button>
          </>
        ) : (
          <button 
            className="btn-action btn-edit"
            onClick={toggleEdit}
            disabled={isLoading}
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header */}
      <ProfileHeader />

      {/* Profile Sections */}
      <div className="profile-sections">
        {/* Personal Information */}
        <div className="profile-section">
          <div className="section-header">
            <div className="section-title">
              <User size={20} />
              <h3>Personal Information</h3>
            </div>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <FormField
                label="Full Name"
                name="fullName"
                value={profileData.fullName}
                icon={User}
                required
              />
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                icon={Mail}
                disabled
              />
              <FormField
                label="Phone Number"
                name="phone"
                type="tel"
                value={profileData.phone}
                icon={Phone}
              />
              <FormField
                label="NID Number"
                name="nidNumber"
                value={profileData.nidNumber}
              />
              <FormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                icon={Calendar}
              />
              <FormField
                label="Gender"
                name="gender"
                type="select"
                value={profileData.gender}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">
          <div className="section-header">
            <div className="section-title">
              <Briefcase size={20} />
              <h3>Professional Information</h3>
            </div>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <FormField
                label="Occupation"
                name="occupation"
                type="select"
                value={profileData.occupation}
                icon={Briefcase}
                options={[
                  { value: '', label: 'Select Occupation' },
                  { value: 'student', label: 'Student' },
                  { value: 'professional', label: 'Professional' },
                  { value: 'business', label: 'Business Owner' },
                  { value: 'freelancer', label: 'Freelancer' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              {profileData.occupation === 'student' && (
                <>
                  <FormField
                    label="Institution"
                    name="institution"
                    value={profileData.institution}
                  />
                  <FormField
                    label="Department"
                    name="department"
                    value={profileData.department}
                  />
                  <FormField
                    label="Student ID"
                    name="studentId"
                    value={profileData.studentId}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="profile-section">
          <div className="section-header">
            <div className="section-title">
              <MapPin size={20} />
              <h3>Address Information</h3>
            </div>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <FormField
                label="Division"
                name="address.division"
                value={profileData.address.division}
                icon={MapPin}
              />
              <FormField
                label="District"
                name="address.district"
                value={profileData.address.district}
              />
              <FormField
                label="Area"
                name="address.area"
                value={profileData.address.area}
              />
              <FormField
                label="Postal Code"
                name="address.postalCode"
                value={profileData.address.postalCode}
              />
            </div>
            <FormField
              label="Full Address"
              name="address.fullAddress"
              type="textarea"
              value={profileData.address.fullAddress}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="profile-section">
          <div className="section-header">
            <div className="section-title">
              <Shield size={20} />
              <h3>Emergency Contact</h3>
            </div>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <FormField
                label="Contact Name"
                name="emergencyContact.name"
                value={profileData.emergencyContact.name}
                icon={User}
              />
              <FormField
                label="Relationship"
                name="emergencyContact.relation"
                value={profileData.emergencyContact.relation}
              />
              <FormField
                label="Phone Number"
                name="emergencyContact.phone"
                type="tel"
                value={profileData.emergencyContact.phone}
                icon={Phone}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-section">
          <div className="section-header">
            <div className="section-title">
              <Bell size={20} />
              <h3>Preferences</h3>
            </div>
          </div>
          <div className="section-content">
            <div className="preferences-grid">
              <div className="preference-item">
                <FormField
                  label="Receive Notifications"
                  name="preferences.receiveNotifications"
                  type="checkbox"
                  value={profileData.preferences.receiveNotifications}
                />
              </div>
              <div className="preference-item">
                <FormField
                  label="Newsletter Subscription"
                  name="preferences.newsletterSubscription"
                  type="checkbox"
                  value={profileData.preferences.newsletterSubscription}
                />
              </div>
              <div className="preference-item">
                <FormField
                  label="Two-Factor Authentication"
                  name="preferences.twoFactorAuth"
                  type="checkbox"
                  value={profileData.preferences.twoFactorAuth}
                />
              </div>
              <div className="preference-item">
                <FormField
                  label="Preferred Language"
                  name="preferences.language"
                  type="select"
                  value={profileData.preferences.language}
                  icon={Globe}
                  options={[
                    { value: 'english', label: 'English' },
                    { value: 'bangla', label: 'Bangla' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;