import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getUserActivity,
  getPerformanceData
} from '../services/profileAPI';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user, token } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load profile data when user or token changes
  useEffect(() => {
    if (user && token) {
      fetchProfileData();
    } else {
      setProfileData(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user, token]);

  // Fetch profile data
  const fetchProfileData = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfile(token, user.uid);
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch activity data
  const fetchActivityData = async (limit = 10) => {
    if (!user || !token) return [];

    setActivityLoading(false);
    setActivityError(null);

    try {
      const response = await getUserActivity(token, user.uid, limit);
      
      const activitiesArray = response.activities || [];
      
      const formattedActivities = activitiesArray.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        timestamp: activity.formattedTimestamp || 'Unknown time',
        type: activity.activityType,
        metadata: activity.metadata || {}
      }));
      
      setActivityData(formattedActivities);
      return formattedActivities;
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setActivityError(err.message || 'Failed to load activity data');
      
      return [];
    } finally {
      setActivityLoading(false);
    }
  };

  
  // Update profile
  const updateUserProfile = async (profileUpdateData) => {
    if (!user || !token) return null;

    setIsUpdating(true);
    setError(null);

    try {
      const updatedProfile = await updateProfile(token, user.uid, profileUpdateData);
      setProfileData(prev => ({
        ...prev,
        ...updatedProfile.employee
      }));
      
      // Refresh activity data after profile update
      fetchActivityData();
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Upload profile picture
  const uploadUserProfilePicture = async (imageFile) => {
    if (!user || !token) return null;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await uploadProfilePicture(token, user.uid, imageFile);
      
      // Update the profile data with the new image URL
      setProfileData(prev => ({
        ...prev,
        profilePicture: response.profilePicture
      }));
      
      // Refresh activity data after profile picture update
      fetchActivityData();
      
      return response;
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Get full name helper
  const getFullName = () => {
    if (!profileData) return '';
    return `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
  };

  // Get avatar initials helper
  const getInitials = () => {
    if (!profileData) return '?';
    
    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const value = {
    profileData,
    isLoading,
    error,
    isUpdating,
    activityData,
    activityLoading,
    activityError,
    performanceData,
    refreshProfile: fetchProfileData,
    updateUserProfile,
    uploadUserProfilePicture,
    fetchActivityData,
    // fetchPerformanceData,
    getFullName,
    getInitials
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};