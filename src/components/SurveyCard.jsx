import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './ui/Badge';

const SurveyCard = ({ survey, userAnalysis = {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Kiểm tra xem người dùng đã hoàn thành khảo sát này chưa
  const hasCompleted = userAnalysis[survey.id] !== undefined;
  
  // Lấy mức độ rủi ro nếu có
  const riskLevel = hasCompleted ? userAnalysis[survey.id]?.riskLevel : null;
  
  // Định dạng ngày gửi khảo sát gần nhất nếu có
  const lastSubmissionDate = hasCompleted 
    ? new Date(userAnalysis[survey.id]?.submittedAt).toLocaleDateString('vi-VN') 
    : null;

  // Lấy màu dựa trên mức độ rủi ro
  const getRiskLevelColor = () => {
    if (!riskLevel) return 'gray';
    
    switch(riskLevel.toUpperCase()) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Xử lý nhấp vào thẻ để chuyển đến khảo sát
  const handleCardClick = () => {
    navigate(`/surveys/${survey.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Tiêu đề thẻ với loại khảo sát */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <h3 className="font-medium">{survey.surveyType?.name || "Khảo sát"}</h3>
        
        {/* Hiển thị trạng thái nếu người dùng đã hoàn thành khảo sát */}
        {hasCompleted && (
          <Badge color={getRiskLevelColor()}>
            {riskLevel === 'HIGH' ? 'Nguy cơ cao' : 
             riskLevel === 'MEDIUM' ? 'Nguy cơ trung bình' : 
             riskLevel === 'LOW' ? 'Nguy cơ thấp' : 'Đã hoàn thành'}
          </Badge>
        )}
      </div>

      {/* Nội dung thẻ */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">{survey.title}</h2>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {survey.description || "Bài khảo sát đánh giá mức độ nguy cơ"}
        </p>
        
        <div className="mt-auto space-y-2">
          {/* Thông tin khảo sát */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{survey.questions?.length || 0} câu hỏi</span>
            <span>Thời gian: ~{survey.estimatedMinutes || 5} phút</span>
          </div>
          
          {/* Thông tin nộp bài trước đây */}
          {hasCompleted && (
            <div className="text-xs text-gray-500">
              <span>Lần khảo sát gần nhất: {lastSubmissionDate}</span>
            </div>
          )}
          
          {/* Nút làm khảo sát */}
          <div 
            className="mt-3 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Link 
              to={`/surveys/${survey.id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md w-full transition-colors"
            >
              {hasCompleted ? 'Làm lại khảo sát' : 'Làm khảo sát'}
            </Link>
          </div>
          
          {/* Gợi ý yêu cầu hồ sơ */}
          {user && (
            <div className="text-xs text-gray-500 mt-2">
              <span>
                Bạn cần có hồ sơ người dùng để nộp khảo sát. 
                <Link 
                  to="/profile" 
                  className="text-blue-600 hover:underline ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Cập nhật hồ sơ
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;