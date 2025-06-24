import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile, createNewProfile, getSurveyHistory } from '../services/profileService';
import Profile from '../models/Profile';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(new Profile({
    userId: user?.userId,
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    gender: ''
  }));
  const [profileDataExists, setProfileDataExists] = useState(false);
  const [surveyHistory, setSurveyHistory] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    if (!user?.userId) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      toast.error('Không tìm thấy thông tin người dùng.');
      navigate('/login');
      return;
    }
    console.log('Current user:', user);
    fetchProfileData(user.userId, user);
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location.state?.surveyCompleted) {
      fetchProfileData(user.userId, user);
    }
  }, [location.state, user.userId]);

  const fetchProfileData = async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile for userId:', userId);
      const profile = await getUserProfile(userId, userData);
      console.log('Profile response:', JSON.stringify(profile, null, 2));
      const mappedProfile = new Profile(profile.toJSON());
      if (!mappedProfile.fullName && userData.fullName) mappedProfile.fullName = userData.fullName;
      if (!mappedProfile.email && userData.email) mappedProfile.email = userData.email;
      if (!mappedProfile.username && userData.username) mappedProfile.username = userData.username;
      mappedProfile.gender = mapGenderReverse(profile.gender || '');
      console.log('Mapped gender:', mappedProfile.gender);
      setProfileData(mappedProfile);
      setProfileDataExists(!!profile.profileId);
      if (profile.profileId && user.permissions.includes('VIEW_SURVEYS')) {
        try {
          const history = await getSurveyHistory(userId);
          console.log('Survey history:', JSON.stringify(history, null, 2));
          setSurveyHistory(history);
          if (history.length > 0) {
            mappedProfile.lastSurveyDate = history[0].lastSurveyDate;
            mappedProfile.lastSurveyScore = history[0].lastSurveyScore;
            mappedProfile.lastSurveyRiskLevel = history[0].lastSurveyRiskLevel;
            setProfileData(mappedProfile);
          }
        } catch (historyError) {
          console.error('Error fetching survey history:', historyError);
          toast.error('Không thể lấy lịch sử khảo sát.');
        }
      }
    } catch (error) {
      const errorMsg = error.response?.status === 404
        ? 'Hồ sơ chưa tồn tại.'
        : error.response?.data?.message || `Không thể tải thông tin hồ sơ: ${error.message}`;
      console.error('Fetch profile error:', {
        status: error.response?.status,
        message: errorMsg,
        response: error.response?.data
      });
      setError(errorMsg);
      const fallbackProfile = new Profile({
        userId: userId,
        fullName: userData.fullName || '',
        email: userData.email || '',
        username: userData.username || '',
        gender: ''
      });
      setProfileData(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    setProfileData((prevState) => {
      const updatedProfile = new Profile(prevState.toJSON());
      updatedProfile[name] = value;
      return updatedProfile;
    });
    setIsDirty(true);
    setError(null);
  };

  const submitProfile = async (submitData) => {
    try {
      setSaving(true);
      setError(null);
      console.log('Submitting profile data:', JSON.stringify(submitData, null, 2));
      submitData.gender = mapGender(submitData.gender || '');
      console.log('Mapped gender for submit:', submitData.gender);
      let updatedProfile;
      if (profileDataExists) {
        updatedProfile = await updateProfile(submitData);
        console.log('Update profile response:', JSON.stringify(updatedProfile, null, 2));
        toast.success('Cập nhật hồ sơ thành công!');
      } else {
        updatedProfile = await createNewProfile(submitData);
        console.log('Create profile response:', JSON.stringify(updatedProfile, null, 2));
        toast.success('Tạo hồ sơ thành công!');
      }
      const mappedProfile = new Profile(updatedProfile.toJSON());
      mappedProfile.gender = mapGenderReverse(updatedProfile.gender || '');
      console.log('Mapped gender after save:', mappedProfile.gender);
      setProfileData(mappedProfile);
      setProfileDataExists(true);
      setIsDirty(false);
      // Gọi fetchProfileData để lấy dữ liệu mới từ database
      await fetchProfileData(user.userId, user);
      return mappedProfile;
    } catch (error) {
      const errorMsg = error.response?.status === 404
        ? 'Hồ sơ không tồn tại hoặc API không khả dụng.'
        : error.response?.data?.message || `Lưu hồ sơ thất bại: ${error.message}`;
      console.error('Submit profile error:', {
        status: error.response?.status,
        message: errorMsg,
        response: error.response?.data
      });
      setError(errorMsg);
      toast.error(errorMsg);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    if (!profileData.fullName || !profileData.email) {
      setError('Họ và tên và email là bắt buộc.');
      toast.error('Họ và tên và email là bắt buộc.');
      return;
    }
    await submitProfile(profileData.toJSON());
  };

  const mapGender = (gender) => {
    console.log('Mapping gender to backend:', gender);
    switch (gender) {
      case 'Nam': return 'MALE';
      case 'Nữ': return 'FEMALE';
      case 'Khác': return 'OTHER';
      default: return '';
    }
  };

  const mapGenderReverse = (gender) => {
    console.log('Mapping gender from backend:', gender);
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return '';
    }
  };

  const getSurveyRecommendation = (riskLevel) => {
    if (!riskLevel) return 'Không có dữ liệu để đưa ra khuyến nghị.';
    const level = riskLevel.toLowerCase();
    if (level.includes('high')) return 'Bạn đang ở mức nguy cơ cao. Hãy đặt lịch tư vấn với chuyên gia ngay để được hỗ trợ kịp thời.';
    if (level.includes('moderate')) return 'Bạn đang ở mức nguy cơ trung bình. Hãy theo dõi thói quen của mình và cân nhắc tư vấn nếu cần.';
    if (level.includes('low')) return 'Bạn đang ở mức nguy cơ thấp. Hãy tiếp tục duy trì thói quen lành mạnh.';
    return 'Không có dữ liệu để đưa ra khuyến nghị.';
  };

  const hasSurvey = surveyHistory.length > 0 || profileData.lastSurveyRiskLevel;
  const surveyStatus = hasSurvey ? {
    taken: true,
    message: getSurveyRecommendation(profileData.lastSurveyRiskLevel),
    buttonText: 'Thực hiện khảo sát lại',
    date: profileData.lastSurveyDate ? new Date(profileData.lastSurveyDate).toLocaleDateString('vi-VN') : 'N/A',
    score: profileData.lastSurveyScore || 'N/A',
    riskLevel: profileData.lastSurveyRiskLevel || 'N/A',
    riskClass: profileData.lastSurveyRiskLevel?.toLowerCase().includes('high') ? 'text-red-700' :
               profileData.lastSurveyRiskLevel?.toLowerCase().includes('moderate') ? 'text-yellow-700' :
               profileData.lastSurveyRiskLevel?.toLowerCase().includes('low') ? 'text-green-700' : 'text-blue-700'
  } : {
    taken: false,
    message: 'Chưa có đánh giá mức độ nguy cơ. Hãy thực hiện khảo sát để đánh giá.',
    buttonText: 'Thực hiện khảo sát ngay',
    date: 'N/A',
    score: 'N/A',
    riskLevel: 'N/A',
    riskClass: 'text-blue-700'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen -mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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

      {user.permissions.includes('VIEW_SURVEYS') && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Đánh Giá Về Ma Túy
          </h2>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className={`text-blue-700 mb-4 ${surveyStatus.riskClass}`}>
              {surveyStatus.message}
            </p>
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
            <div className="flex justify-between">
              <Link
                to="/surveys"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  fetchProfileData(user.userId, user);
                }}
              >
                {surveyStatus.buttonText}
              </Link>
              {surveyHistory.length > 0 && (
                <Link
                  to={`/survey-results/${surveyHistory[0].responseId}`}
                  className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Xem lịch sử khảo sát
                </Link>
              )}
            </div>
            {surveyStatus.riskLevel?.toLowerCase().includes('high') && user.permissions.includes('BOOK_APPOINTMENTS') && (
              <Link
                to="/book-appointment"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mt-4"
              >
                Đặt lịch tư vấn với chuyên gia
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">
                Họ và Tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
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
                value={profileData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
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
                value={profileData.dateOfBirth}
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
                value={profileData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors ${
                (saving || !isDirty) ? 'opacity-70 cursor-not-allowed' : ''
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