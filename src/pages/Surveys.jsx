import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSurveys } from '../services/surveyService';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiClipboard, FiAward, FiActivity } from 'react-icons/fi';
import { FaRegSmileBeam } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 rounded-3xl shadow-xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <FaRegSmileBeam className="text-white text-5xl drop-shadow-lg" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Khảo sát sức khỏe & nguy cơ</h1>
              <p className="text-blue-100 text-lg">Khám phá mức độ nguy cơ và nhận tư vấn cá nhân hóa!</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-5 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-blue-50 transition-colors text-lg ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Feature Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
            <FiClipboard className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold text-lg mb-1">Đa dạng khảo sát</h3>
            <p className="text-gray-500 text-sm">Nhiều chủ đề, phù hợp mọi đối tượng.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
            <FiActivity className="text-green-500 text-3xl mb-2" />
            <h3 className="font-semibold text-lg mb-1">Phân tích nguy cơ</h3>
            <p className="text-gray-500 text-sm">Đánh giá mức độ nguy cơ, tư vấn cá nhân hóa.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
            <FiAward className="text-yellow-500 text-3xl mb-2" />
            <h3 className="font-semibold text-lg mb-1">Nhận phần thưởng</h3>
            <p className="text-gray-500 text-sm">Hoàn thành khảo sát để nhận quà tặng hấp dẫn.</p>
          </div>
        </div>

        {/* Survey List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {surveys.length > 0 ? (
            surveys.map((survey, idx) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-2xl shadow-xl p-7 flex flex-col justify-between hover:scale-105 transition-transform border-t-4 border-blue-400 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FiClipboard className="text-blue-400 text-2xl group-hover:text-blue-600 transition" />
                    <h2 className="text-xl font-bold text-gray-800">{survey.title}</h2>
                  </div>
                  <p className="text-gray-600 mt-1 line-clamp-2 min-h-[40px]">{survey.description}</p>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {new Date(survey.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <Link
                    to={`/surveys/${survey.id}`}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-500 transition-colors"
                  >
                    Làm khảo sát
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 bg-gray-50 rounded-2xl p-10 text-center shadow">
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
      </motion.div>
    </div>
  );
}

export default Surveys;