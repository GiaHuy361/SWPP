import axios from '../utils/axios';
import Profile from '../models/Profile';

/**
 * ProfileService Class - Xử lý tất cả các thao tác liên quan đến Profile
 * Tuân theo mô hình Service trong kiến trúc phân lớp
 */
class ProfileService {
  constructor() {
    this.API_PROFILES = '/profiles';
  }
  
  /**
   * Lấy thông tin profile người dùng
   * @param {string|number} userId - ID của người dùng
   * @returns {Promise<Profile>} Promise trả về đối tượng Profile
   */
  async getUserProfile(userId) {
    console.log("Đang lấy thông tin profile cho userId:", userId);
    try {
      const response = await axios.get(`${this.API_PROFILES}/${userId}`);
      return new Profile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // Nếu không tìm thấy profile (404), trả về profile trống để hiển thị form
      if (error.response && error.response.status === 404) {
        console.log("Profile not found, will create a new one");
        return this.createUserProfileObject(userId);
      }
      
      throw error;
    }
  }

  /**
   * Tạo đối tượng Profile cho người dùng mới
   * @param {string|number} userId - ID của người dùng
   * @returns {Profile} Đối tượng Profile được tạo mới
   */
  createUserProfileObject(userId) {
    // Lấy thông tin người dùng từ localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    
    return new Profile({
      profileId: null,
      userId: userId,
      username: userData.username || '',
      fullName: userData.fullName || '',
      email: userData.email || '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'Nam' // Giá trị mặc định
    });
  }

  /**
   * Tạo profile mới
   * @param {Profile} profileData - Dữ liệu profile cần tạo
   * @returns {Promise<Profile>} Promise trả về profile đã tạo
   */
  async createNewProfile(profileData) {
    console.log("Tạo profile mới cho userId:", profileData.userId);
    
    // Chuyển đổi thành dạng JSON nếu là đối tượng Profile
    const data = profileData instanceof Profile ? profileData.toJSON() : profileData;
    
    try {
      // Thử tạo mới profile với POST request
      const response = await axios.post(`${this.API_PROFILES}`, data);
      return new Profile(response.data);
    } catch (error) {
      // Nếu lỗi là do trùng khóa chính, thử sử dụng phương thức PUT để cập nhật
      if (error.response && 
          (error.response.status === 400 || error.response.status === 409) && 
          error.response.data && 
          (error.response.data.message?.includes('Duplicate') || 
           error.response.data.message?.includes('already exists'))) {
        
        console.log("Profile đã tồn tại, thử cập nhật");
        return await this.updateProfile(data);
      }
      
      console.error("Lỗi khi tạo hồ sơ mới:", error);
      throw error;
    }
  }

  /**
   * Cập nhật profile
   * @param {Profile} profileData - Dữ liệu profile cần cập nhật
   * @returns {Promise<Profile>} Promise trả về profile đã cập nhật
   */
  async updateProfile(profileData) {
    console.log("Cập nhật profile cho userId:", profileData.userId);
    
    // Chuyển đổi thành dạng JSON nếu là đối tượng Profile
    const data = profileData instanceof Profile ? profileData.toJSON() : profileData;
    
    try {
      // Gửi yêu cầu PUT để cập nhật profile, không bao gồm ID trong URL
      const response = await axios.put(`${this.API_PROFILES}`, data);
      return new Profile(response.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      
      // Thử phương thức khác nếu PUT không được hỗ trợ
      if (error.response && error.response.status === 405) {
        console.log("Phương thức PUT không được hỗ trợ, thử dùng POST với flag update");
        
        // Thêm flag update=true để backend biết đây là cập nhật
        const response = await axios.post(`${this.API_PROFILES}?update=true`, data);
        return new Profile(response.data);
      }
      
      throw error;
    }
  }

  /**
   * Xóa profile
   * @param {string|number} userId - ID của người dùng
   * @returns {Promise<boolean>} Promise trả về true nếu xóa thành công
   */
  async deleteProfile(userId) {
    try {
      await axios.delete(`${this.API_PROFILES}/${userId}`);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa hồ sơ:", error);
      throw error;
    }
  }

  /**
   * Tải lên avatar
   * @param {string|number} userId - ID của người dùng
   * @param {File} file - File ảnh avatar
   * @returns {Promise<string>} Promise trả về URL của avatar
   */
  async uploadAvatar(userId, file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${this.API_PROFILES}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.avatarUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên avatar:", error);
      throw error;
    }
  }
  
  /**
   * Lấy lịch sử khảo sát của người dùng
   * @param {string|number} userId - ID của người dùng
   * @returns {Promise<Array>} Promise trả về mảng lịch sử khảo sát
   */
  async getSurveyHistory(userId) {
    try {
      const response = await axios.get(`${this.API_PROFILES}/${userId}/surveys`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử khảo sát:", error);
      return [];
    }
  }
}

// Tạo và export instance của service để sử dụng trong toàn ứng dụng
const profileService = new ProfileService();

// Export các phương thức riêng lẻ để dễ sử dụng
export const getUserProfile = profileService.getUserProfile.bind(profileService);
export const createUserProfileObject = profileService.createUserProfileObject.bind(profileService);
export const createNewProfile = profileService.createNewProfile.bind(profileService);
export const updateProfile = profileService.updateProfile.bind(profileService);
export const deleteProfile = profileService.deleteProfile.bind(profileService);
export const uploadAvatar = profileService.uploadAvatar.bind(profileService);
export const getSurveyHistory = profileService.getSurveyHistory.bind(profileService);

// Export toàn bộ service cho các trường hợp cần sử dụng đầy đủ
export default profileService;