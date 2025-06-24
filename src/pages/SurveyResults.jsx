import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSurveyResponseById, getSurveyResult, getUserResponsesAndAnalysis } from '../services/surveyService';
import { getUserProfile } from '../services/profileService';
import { toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';

function SurveyResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [response, setResponse] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnalysis, setUserAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      let responseData, resultData;

      if (id) {
        responseData = await getSurveyResponseById(id);
        console.log('Response data:', JSON.stringify(responseData.data, null, 2));
        setResponse(responseData.data);

        try {
          resultData = await getSurveyResult(id);
          console.log('Result data:', JSON.stringify(resultData.data, null, 2));
          setResult(resultData.data);
        } catch (resultError) {
          console.log('Result error:', resultError);
          if (resultError.response?.status === 404) {
            setResult({
              totalScore: responseData.data.totalScore || 0,
              riskLevel: responseData.data.riskLevel || 'Chưa tính điểm',
              maxScore: responseData.data.survey?.surveyType?.maxScore || 100
            });
            toast.warn('Không thể tính điểm khảo sát do dữ liệu không đầy đủ. Vui lòng thử lại.');
          } else {
            throw resultError;
          }
        }
      } else {
        const analysisData = await getUserResponsesAndAnalysis();
        setUserAnalysis(analysisData.data);
        console.log('Analysis data:', JSON.stringify(analysisData.data, null, 2));
        if (analysisData.data?.responses?.length > 0) {
          const latestResponseId = analysisData.data.responses[0];
          [responseData, resultData] = await Promise.all([
            getSurveyResponseById(latestResponseId),
            getSurveyResult(latestResponseId).catch(err => {
              console.log('Result error for latest response:', err);
              if (err.response?.status === 404) {
                return {
                  data: {
                    totalScore: responseData?.data?.totalScore || 0,
                    riskLevel: responseData?.data?.riskLevel || 'Chưa tính điểm',
                    maxScore: responseData?.data?.survey?.surveyType?.maxScore || 100
                  }
                };
              }
              throw err;
            })
          ]);
          console.log('Latest response data:', JSON.stringify(responseData.data, null, 2));
          console.log('Latest result data:', JSON.stringify(resultData.data, null, 2));
          setResponse(responseData.data);
          setResult(resultData.data);
        } else {
          setResult({ totalScore: 0, riskLevel: 'Chưa có kết quả', maxScore: 100 });
        }
      }

      if (user?.userId) {
        try {
          await getUserProfile(user.userId);
        } catch (profileError) {
          console.error('Profile sync error:', profileError);
          toast.warn('Không thể đồng bộ kết quả khảo sát với hồ sơ.');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải kết quả khảo sát.';
      console.error('Fetch results error:', err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: id ? `/survey-results/${id}` : '/survey-results' } });
      return;
    }
    if (!user?.permissions?.includes('VIEW_SURVEYS')) {
      navigate('/access-denied');
      return;
    }
    fetchResults();
    if (location.state?.refresh) {
      window.history.replaceState({}, document.title);
    }
  }, [id, isAuthenticated, user, navigate, location.state]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchResults();
  };

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return 'gray';
    const level = riskLevel.toLowerCase();
    if (level.includes('low')) return 'green';
    if (level.includes('moderate')) return 'yellow';
    if (level.includes('high')) return 'red';
    return 'gray';
  };

  const getRiskRecommendation = (riskLevel) => {
    if (!riskLevel) return 'Không có dữ liệu để đưa ra khuyến nghị.';
    const level = riskLevel.toLowerCase();
    if (level.includes('high')) return 'Bạn đang ở mức nguy cơ cao. Hãy đặt lịch tư vấn với chuyên gia ngay để được hỗ trợ kịp thời.';
    if (level.includes('moderate')) return 'Bạn đang ở mức nguy cơ trung bình. Hãy theo dõi thói quen của mình và cân nhắc tư vấn nếu cần.';
    if (level.includes('low')) return 'Bạn đang ở mức nguy cơ thấp. Hãy tiếp tục duy trì thói quen lành mạnh.';
    return 'Không có dữ liệu để đưa ra khuyến nghị.';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!result && !userAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có kết quả</h3>
          <p className="text-gray-600 mt-2">Bạn chưa hoàn thành khảo sát nào.</p>
          <div className="mt-6">
            <Link
              to="/surveys"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Xem danh sách khảo sát
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const riskColor = getRiskLevelColor(result?.riskLevel || userAnalysis?.riskLevel);
  const riskLevel = result?.riskLevel || userAnalysis?.riskLevel;
  const score = result?.totalScore || response?.totalScore || 0;
  const maxScore = result?.maxScore || response?.survey?.surveyType?.maxScore || 100;
  const scorePercentage = maxScore ? (score / maxScore) * 100 : 0;
  const isHighRisk = riskLevel?.toLowerCase().includes('high');

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/surveys"
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
            </svg>
            Quay lại danh sách khảo sát
          </Link>
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

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kết quả khảo sát</h1>
          {response && (
            <p className="text-gray-600">
              Hoàn thành vào: {response.submittedAt ? new Date(response.submittedAt).toLocaleString('vi-VN') : 'Chưa xác định thời gian'}
            </p>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Điểm số của bạn</h2>
              <span className="font-bold text-xl">{score}/{maxScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full bg-${riskColor}-500`}
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Mức độ rủi ro</h2>
            <div className={`bg-${riskColor}-100 border border-${riskColor}-200 text-${riskColor}-700 px-4 py-3 rounded-md flex items-center`}>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <span className="font-medium">{riskLevel || 'Chưa xác định'}</span>
                <p className="text-sm mt-1">{getRiskRecommendation(riskLevel)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {isHighRisk && user?.permissions?.includes('BOOK_APPOINTMENTS') && (
              <Link
                to="/book-appointment"
                className="block w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
              >
                Đặt lịch tư vấn với chuyên gia
              </Link>
            )}
            <Link
              to="/surveys"
              className="block w-full bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-md text-center hover:bg-gray-200 transition-colors mt-4"
            >
              Làm khảo sát khác
            </Link>
            <Link
              to="/profile"
              className="block w-full bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-md text-center hover:bg-gray-200 transition-colors mt-4"
            >
              Xem hồ sơ của bạn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyResults;