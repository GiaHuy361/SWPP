import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSurveyResponseById, getSurveyResult, getUserResponsesAndAnalysis } from '../services/surveyService';

function SurveyResults() {
  const { id } = useParams(); // If id is provided, show specific result
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [response, setResponse] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnalysis, setUserAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) {
        navigate('/login', { state: { from: id ? `/survey-results/${id}` : '/survey-results' } });
        return;
      }

      try {
        setLoading(true);
        
        // Nếu URL có chứa demo- thì dùng mock data
        if (id && id.startsWith('demo-')) {
          setResult({
            totalScore: 35,
            maxScore: 100,
            riskLevel: "Moderate Risk"
          });
          
          setResponse({
            id: id,
            submittedAt: new Date().toISOString(),
            totalScore: 35,
            riskLevel: "Moderate Risk"
          });
          
          setLoading(false);
          return;
        }
        
        if (id) {
          // Fetch specific response and result
          const responseData = await getSurveyResponseById(id);
          setResponse(responseData.data);
          
          const resultData = await getSurveyResult(id);
          setResult(resultData.data);
        } else {
          // Fetch user's analysis
          const analysisData = await getUserResponsesAndAnalysis();
          setUserAnalysis(analysisData.data);
          
          // If user has responses, fetch the latest one
          if (analysisData.data.responses && analysisData.data.responses.length > 0) {
            const latestResponseId = analysisData.data.responses[0];
            const responseData = await getSurveyResponseById(latestResponseId);
            setResponse(responseData.data);
            
            const resultData = await getSurveyResult(latestResponseId);
            setResult(resultData.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey results:', err);
        setError('Không thể tải kết quả khảo sát. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, user, navigate]);

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return 'gray';
    
    const level = riskLevel.toLowerCase();
    if (level.includes('low')) return 'green';
    if (level.includes('moderate')) return 'yellow';
    if (level.includes('high')) return 'red';
    return 'blue';
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

  // If no data found
  if (!result && !userAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có kết quả</h3>
          <p className="mt-2 text-gray-600">
            Bạn chưa hoàn thành khảo sát nào.
          </p>
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

  const riskColor = getRiskLevelColor(result?.riskLevel || userAnalysis?.addictionLevel);
  const riskLevel = result?.riskLevel || userAnalysis?.addictionLevel;
  const score = result?.totalScore || 0;
  const maxScore = result?.maxScore || 100;
  const scorePercentage = (score / maxScore) * 100;

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/surveys"
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Quay lại danh sách khảo sát
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kết quả khảo sát</h1>
          {response && (
            <p className="text-gray-600">
              Hoàn thành vào: {new Date(response.submittedAt).toLocaleString('vi-VN')}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <span className="font-medium">{riskLevel}</span>
                <p className="text-sm mt-1">
                  {riskLevel?.toLowerCase().includes('high') ? (
                    'Khuyến nghị: Bạn nên tham khảo ý kiến của chuyên gia tư vấn.'
                  ) : riskLevel?.toLowerCase().includes('moderate') ? (
                    'Khuyến nghị: Bạn nên chú ý đến thói quen của mình.'
                  ) : (
                    'Khuyến nghị: Tiếp tục duy trì thói quen tốt.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/book-appointment"
              className="block w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Đặt lịch tư vấn với chuyên gia
            </Link>
            <Link
              to="/surveys"
              className="block w-full bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-md text-center hover:bg-gray-200 transition-colors mt-4"
            >
              Làm khảo sát khác
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyResults;