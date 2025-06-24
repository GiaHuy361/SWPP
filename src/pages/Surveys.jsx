import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSurveys } from '../services/surveyService';
import { toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';

function Surveys() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching surveys for user:', user?.userId);
      const surveysResponse = await getAllSurveys();
      console.log('Surveys response:', JSON.stringify(surveysResponse.data, null, 2));
      setSurveys(surveysResponse.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể tải danh sách khảo sát.';
      console.error('Fetch surveys error:', error);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/surveys' } });
      return;
    }
    if (!user?.permissions?.includes('VIEW_SURVEYS')) {
      navigate('/access-denied');
      return;
    }
    fetchSurveys();
  }, [isAuthenticated, user, navigate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSurveys();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Khảo sát</h1>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-lg mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Khám phá mức độ nguy cơ của bạn</h2>
          <p className="text-blue-700 mb-4">
            Tham gia khảo sát ngay hôm nay để nhận đánh giá chuyên sâu về mức độ nguy cơ và được đề xuất các khóa học phù hợp, giúp bạn nâng cao kỹ năng và đạt được mục tiêu cá nhân một cách hiệu quả.
          </p>
        
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
                <h2 className="text-xl font-semibold text-gray-800">{survey.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-2">{survey.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(survey.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <Link
                    to={`/surveys/${survey.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Làm khảo sát
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-gray-50 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Không có khảo sát</h3>
              <p className="mt-2 text-gray-600">
                Hiện tại không có khảo sát nào được đăng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Surveys;