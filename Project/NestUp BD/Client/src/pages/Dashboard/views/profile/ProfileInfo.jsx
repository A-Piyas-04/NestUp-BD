import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import '../../Dashboard.css';
import './ProfileInfo.css';

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nidNumber: '',
    dateOfBirth: '',
    gender: 'male',
    occupation: 'student',
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        nidNumber: user.profile?.nidNumber || '',
        dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
        gender: user.profile?.gender || 'male',
        occupation: user.profile?.occupation || 'student',
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
      // In a real app, you would upload this file to a server
      // For now, we'll just store it in state as a URL
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
      // Prepare data for server
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
        
        // Clear success message after 3 seconds
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

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Profile Information</h2>
        <p>Update your personal details and preferences</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture-container">
            {profileData.profilePicture ? (
              <img 
                src={profileData.profilePicture} 
                alt="Profile" 
                className="profile-picture" 
              />
            ) : (
              <div className="profile-picture-placeholder">
                {profileData.fullName.charAt(0)}
              </div>
            )}
            {isEditing && (
              <div className="profile-picture-upload">
                <label htmlFor="profile-picture" className="upload-label">
                  Change Picture
                </label>
                <input 
                  type="file" 
                  id="profile-picture" 
                  accept="image/*" 
                  onChange={handleProfilePicture}
                  className="file-input"
                />
              </div>
            )}
          </div>
          <div className="profile-title">
            <h3>{profileData.fullName}</h3>
            <p>{profileData.occupation === 'student' ? `Student at ${profileData.institution}` : profileData.occupation}</p>
          </div>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={profileData.fullName} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={profileData.email} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={profileData.phone} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nidNumber">NID Number</label>
                <input 
                  type="text" 
                  id="nidNumber" 
                  name="nidNumber" 
                  value={profileData.nidNumber} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input 
                  type="date" 
                  id="dateOfBirth" 
                  name="dateOfBirth" 
                  value={profileData.dateOfBirth} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select 
                  id="gender" 
                  name="gender" 
                  value={profileData.gender} 
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Occupation Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="occupation">Occupation</label>
                <select 
                  id="occupation" 
                  name="occupation" 
                  value={profileData.occupation} 
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="business">Business</option>
                  <option value="government">Government Employee</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {profileData.occupation === 'student' && (
                <div className="form-group">
                  <label htmlFor="institution">Institution</label>
                  <input 
                    type="text" 
                    id="institution" 
                    name="institution" 
                    value={profileData.institution} 
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>

            {profileData.occupation === 'student' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input 
                    type="text" 
                    id="department" 
                    name="department" 
                    value={profileData.department} 
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input 
                    type="text" 
                    id="studentId" 
                    name="studentId" 
                    value={profileData.studentId} 
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h4>Address Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.division">Division</label>
                <select 
                  id="address.division" 
                  name="address.division" 
                  value={profileData.address.division} 
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="address.district">District</label>
                <input 
                  type="text" 
                  id="address.district" 
                  name="address.district" 
                  value={profileData.address.district} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.area">Area</label>
                <input 
                  type="text" 
                  id="address.area" 
                  name="address.area" 
                  value={profileData.address.area} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.postalCode">Postal Code</label>
                <input 
                  type="text" 
                  id="address.postalCode" 
                  name="address.postalCode" 
                  value={profileData.address.postalCode} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address.fullAddress">Full Address</label>
                <textarea 
                  id="address.fullAddress" 
                  name="address.fullAddress" 
                  value={profileData.address.fullAddress} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact.name">Contact Name</label>
                <input 
                  type="text" 
                  id="emergencyContact.name" 
                  name="emergencyContact.name" 
                  value={profileData.emergencyContact.name} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact.relation">Relation</label>
                <input 
                  type="text" 
                  id="emergencyContact.relation" 
                  name="emergencyContact.relation" 
                  value={profileData.emergencyContact.relation} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact.phone">Contact Phone</label>
                <input 
                  type="tel" 
                  id="emergencyContact.phone" 
                  name="emergencyContact.phone" 
                  value={profileData.emergencyContact.phone} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Preferences</h4>
            <div className="form-row checkbox-row">
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="preferences.receiveNotifications" 
                  name="preferences.receiveNotifications" 
                  checked={profileData.preferences.receiveNotifications} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <label htmlFor="preferences.receiveNotifications">Receive Notifications</label>
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="preferences.newsletterSubscription" 
                  name="preferences.newsletterSubscription" 
                  checked={profileData.preferences.newsletterSubscription} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <label htmlFor="preferences.newsletterSubscription">Subscribe to Newsletter</label>
              </div>
            </div>
            <div className="form-row checkbox-row">
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="preferences.twoFactorAuth" 
                  name="preferences.twoFactorAuth" 
                  checked={profileData.preferences.twoFactorAuth} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <label htmlFor="preferences.twoFactorAuth">Enable Two-Factor Authentication</label>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferences.language">Preferred Language</label>
                <select 
                  id="preferences.language" 
                  name="preferences.language" 
                  value={profileData.preferences.language} 
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="english">English</option>
                  <option value="bangla">Bangla</option>
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;