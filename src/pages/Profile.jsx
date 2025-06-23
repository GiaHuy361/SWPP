import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile,
  updateProfile,
  createNewProfile,
  uploadAvatar,
  getSurveyHistory
} from '../services/profileService';
import Profile from '../models/Profile';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(new Profile());
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileDataExists, setProfileDataExists] = useState(false);
  const [surveyHistory, setSurveyHistory] = useState([]);
  
  useEffect(() => {
    // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.userId) {
      fetchProfileData(user.userId);
    }
  }, [isAuthenticated, user, navigate]);

  const fetchProfileData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy thông tin profile
      const profile = await getUserProfile(userId);
      
      if (profile) {
        setProfileData(profile);
        setProfileDataExists(!!profile.profileId); // Kiểm tra xem đã có profile trong DB chưa
        
        // Nếu có avatar, thiết lập preview
        if (profile.avatar) {
          setAvatarPreview(profile.avatar);
        }
        
        // Lấy lịch sử khảo sát nếu profile đã tồn tại
        if (profile.profileId) {
          try {
            const history = await getSurveyHistory(userId);
            setSurveyHistory(history || []);
          } catch (historyError) {
            console.error("Không thể lấy lịch sử khảo sát:", historyError);
          }
        }
      }
      
      console.log("Profile data received:", profile);
    } catch (error) {
      console.error("Lỗi khi tải thông tin hồ sơ:", error);
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
      
      // Tạo profile mới nếu không tìm thấy
      if (error.response && error.response.status === 404) {
        const newProfile = new Profile({
          userId: userId,
          username: user?.username || '',
          fullName: user?.fullName || '',
          email: user?.email || ''
        });
        
        setProfileData(newProfile);
        setProfileDataExists(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => {
      const updatedProfile = new Profile({...prevState.toJSON()});
      updatedProfile[name] = value;
      return updatedProfile;
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      let updatedProfile;
      
      // Xử lý lưu profile - tạo mới hoặc cập nhật
      try {
        if (profileDataExists) {
          console.log("Updating existing profile");
          updatedProfile = await updateProfile(profileData);
          toast.success("Thông tin hồ sơ đã được cập nhật thành công!");
        } else {
          console.log("Creating new profile");
          updatedProfile = await createNewProfile(profileData);
          toast.success("Đã tạo hồ sơ thành công!");
          setProfileDataExists(true);
        }
      } catch (saveError) {
        // Kiểm tra lỗi và thử phương thức khác nếu cần
        console.error("Lỗi khi lưu profile, thử phương thức khác:", saveError);
        
        // Nếu lỗi trùng key hoặc xung đột, thử cập nhật thay vì tạo mới
        if (saveError.response?.status === 400 || saveError.response?.status === 409) {
          updatedProfile = await updateProfile(profileData);
          toast.success("Đã cập nhật hồ sơ thành công!");
          setProfileDataExists(true);
        } else {
          throw saveError;
        }
      }
      
      // Xử lý upload avatar
      if (avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(profileData.userId, avatarFile);
          updatedProfile.avatar = avatarUrl;
          setAvatarPreview(avatarUrl);
          toast.success("Avatar đã được cập nhật thành công!");
        } catch (avatarError) {
          console.error("Lỗi khi tải lên avatar:", avatarError);
          toast.error("Không thể tải lên avatar. Vui lòng thử lại.");
        }
      }
      
      setProfileData(updatedProfile);
      
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      let errorMessage = "Đã xảy ra lỗi khi lưu hồ sơ.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        } else if (error.response.status === 403) {
          errorMessage = "Bạn không có quyền thực hiện hành động này.";
        } else if (error.response.status === 404) {
          errorMessage = "Không tìm thấy hồ sơ để cập nhật.";
        } else if (error.response.status === 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
        }
        
        // Thêm thông tin chi tiết từ API nếu có
        if (error.response.data && error.response.data.message) {
          errorMessage += " Chi tiết: " + error.response.data.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Lấy thông tin trạng thái khảo sát từ profile
  const surveyStatus = profileData.getSurveyStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen -mt-16">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Thông Tin Cá Nhân
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Phần Thông Tin Khảo Sát */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Đánh Giá Về Ma Túy
        </h2>
        
        {!surveyStatus.taken ? (
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-blue-700 mb-4">
              {surveyStatus.message}
            </p>
            <Link
              to="/surveys"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {surveyStatus.buttonText}
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ngày làm khảo sát gần nhất</p>
                <p className="font-semibold">{surveyStatus.date}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Điểm số</p>
                <p className="font-semibold">{surveyStatus.score}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Mức độ nguy cơ</p>
                <p className={`font-semibold ${surveyStatus.riskClass}`}>{surveyStatus.riskLevel}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className={`text-sm ${surveyStatus.riskClass}`}>
                {surveyStatus.message}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Link
                to="/surveys"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {surveyStatus.buttonText}
              </Link>
              
              {surveyHistory.length > 0 && (
                <Link
                  to="/survey-results"
                  className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Xem lịch sử khảo sát
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Nhấp vào biểu tượng để cập nhật ảnh đại diện
            </p>
          </div>

          {/* Personal Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">
                Họ và Tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="phoneNumber">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profileData.phoneNumber || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="dateOfBirth">
                Ngày Sinh
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={profileData.dateOfBirth || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="gender">
                Giới Tính
              </label>
              <select
                id="gender"
                name="gender"
                value={profileData.gender || 'Nam'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                Địa Chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileData.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="bio">
              Giới Thiệu Bản Thân
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={profileData.bio || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Viết một vài điều về bản thân bạn..."
            ></textarea>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Đang Lưu...' : 'Lưu Thông Tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;