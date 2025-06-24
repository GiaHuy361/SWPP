import apiClient from '../utils/axios';
import Profile from '../models/Profile';

class ProfileService {
  constructor() {
    this.API_PROFILES = '/profiles';
  }

  async getUserProfile(userId, userData = {}) {
    try {
      const response = await apiClient.get(`${this.API_PROFILES}/${userId}`, { withCredentials: true });
      console.log('getUserProfile response:', response.data);
      return new Profile(response.data);
    } catch (error) {
      console.error('getUserProfile error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      if (error.response?.status === 404) {
        console.log('Profile not found for userId:', userId);
        return new Profile({ userId });
      }
      throw error;
    }
  }

  createUserProfileObject(userId, userData = {}) {
    return new Profile({
      profileId: null,
      userId: userId,
      username: userData.username || '',
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: '',
      dateOfBirth: '',
      gender: userData.gender || ''
    });
  }

  async createNewProfile(profileData) {
    const data = profileData instanceof Profile ? profileData.toJSON() : profileData;
    try {
      const gender = mapGender(data.gender);
      const body = {
        dateOfBirth: data.dateOfBirth || '',
        fullName: data.fullName || '',
        email: data.email || '',
        username: data.username || '',
        gender: gender // Luôn gửi gender
      };
      console.log('createNewProfile request body:', JSON.stringify(body, null, 2));
      const response = await apiClient.post(`${this.API_PROFILES}/${data.userId}`, body, { withCredentials: true });
      console.log('createNewProfile response:', response.data);
      return new Profile(response.data);
    } catch (error) {
      console.error('createNewProfile error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      throw error;
    }
  }

  async updateProfile(profileData) {
    const data = profileData instanceof Profile ? profileData.toJSON() : profileData;
    try {
      const gender = mapGender(data.gender);
      const body = {
        username: data.username || '',
        email: data.email || '',
        fullName: data.fullName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: gender // Luôn gửi gender
      };
      console.log('updateProfile request body:', JSON.stringify(body, null, 2));
      const response = await apiClient.put(`${this.API_PROFILES}/${data.userId}`, body, { withCredentials: true });
      console.log('updateProfile response:', response.data);
      return new Profile(response.data);
    } catch (error) {
      console.error('updateProfile error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      throw error;
    }
  }

  async deleteProfile(userId) {
    try {
      await apiClient.delete(`${this.API_PROFILES}/${userId}`, { withCredentials: true });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(userId, file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiClient.post(`${this.API_PROFILES}/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      return response.data.avatarUrl;
    } catch (error) {
      throw error;
    }
  }

  async getSurveyHistory(userId) {
    try {
      const response = await apiClient.get('/api/surveys/responses/user', { withCredentials: true });
      console.log('getSurveyHistory response:', response.data);
      const latestResponse = response.data.responses?.length > 0 ? response.data.responses[0] : null;
      if (latestResponse) {
        const result = await apiClient.get(`/api/surveys/responses/result/${latestResponse}`, { withCredentials: true });
        console.log('Survey result:', result.data);
        return [{
          lastSurveyDate: new Date().toISOString(),
          lastSurveyScore: result.data.totalScore,
          lastSurveyRiskLevel: result.data.riskLevel
        }];
      }
      return [];
    } catch (error) {
      console.error('getSurveyHistory error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      return [];
    }
  }
}

const mapGender = (gender) => {
  console.log('Mapping gender in profileService:', gender);
  switch (gender) {
    case 'Nam': return 'MALE';
    case 'Nữ': return 'FEMALE';
    case 'Khác': return 'OTHER';
    default: return 'MALE';
  }
};

const profileService = new ProfileService();

export const getUserProfile = profileService.getUserProfile.bind(profileService);
export const createUserProfileObject = profileService.createUserProfileObject.bind(profileService);
export const createNewProfile = profileService.createNewProfile.bind(profileService);
export const updateProfile = profileService.updateProfile.bind(profileService);
export const deleteProfile = profileService.deleteProfile.bind(profileService);
export const uploadAvatar = profileService.uploadAvatar.bind(profileService);
export const getSurveyHistory = profileService.getSurveyHistory.bind(profileService);

export default profileService;