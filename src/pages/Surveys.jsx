import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSurveys, getUserResponsesAndAnalysis } from '../services/surveyService';

function Surveys() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [userAnalysis, setUserAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy danh sách khảo sát
        try {
          const surveysResponse = await getAllSurveys();
          setSurveys(surveysResponse.data || []);
          
          // Tách biệt việc lấy user analysis để không ảnh hưởng đến hiển thị danh sách khảo sát
          if (user && user.userId) { // Sử dụng userId thay vì id
            try {
              console.log("Fetching user responses for userId:", user.userId);
              const analysisResponse = await getUserResponsesAndAnalysis();
              setUserAnalysis(analysisResponse.data);
            } catch (analysisError) {
              console.log("Không có dữ liệu khảo sát trước đây hoặc lỗi khi tải:", analysisError);
            }
          }
        } catch (error) {
          setError("Không thể tải danh sách khảo sát. Vui lòng thử lại sau.");
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in overall survey loading:', err);
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [user]);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Khảo sát</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {userAnalysis && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Kết quả phân tích của bạn</h2>
            <p className="text-blue-700">
              <span className="font-medium">Mức độ nghiện: </span>
              {userAnalysis.addictionLevel}
            </p>
            <p className="mt-2 text-sm text-blue-600">
              Dựa trên {userAnalysis.responses?.length || 0} phản hồi khảo sát gần đây nhất của bạn
            </p>
            <Link 
              to={`/survey-results`}
              className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem chi tiết kết quả
              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
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