
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSurveyResponseById, getSurveyResult, getUserResponsesAndAnalysis, submitSurveyAndGetRecommendations } from '../services/surveyService';
import { getUserProfile } from '../services/profileService';
import { getAllCourses } from '../services/courseService';
import { toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';
import { FaRegSmile, FaRegMeh, FaRegFrown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from '../utils/axios';

// Helper for animated circular progress bar
function AnimatedCircularProgress({ percentage, color, icon, riskLabel }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = circumference - (percentage / 100) * circumference;
  const gradientId = `gradient-${color}`;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="mb-2">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {color === 'green' && (
              <>
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </>
            )}
            {color === 'yellow' && (
              <>
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e42" />
              </>
            )}
            {color === 'red' && (
              <>
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </>
            )}
            {color === 'gray' && (
              <>
                <stop offset="0%" stopColor="#d1d5db" />
                <stop offset="100%" stopColor="#6b7280" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          stroke="#e5e7eb"
          fill="none"
          strokeWidth={stroke}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
        />
        <motion.circle
          stroke={`url(#${gradientId})`}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        <g>
          <foreignObject x={radius - 24} y={radius - 24} width="48" height="48">
            <div className="flex items-center justify-center w-12 h-12">
              {icon}
            </div>
          </foreignObject>
        </g>
      </svg>
      <span className={`font-bold text-lg text-${color}-600`}>{riskLabel}</span>
    </div>
  );
}

function SurveyResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [response, setResponse] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnalysis, setUserAnalysis] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Hàm xử lý đăng ký khóa học
  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/enrollments/courses/${courseId}`);
      toast.success('Đăng ký khóa học thành công!');
      setRecommendedCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, isEnrolled: true } : course
        )
      );
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại.';
      if (errorMsg.includes('already enrolled') || errorMsg.includes('đã đăng ký')) {
        toast.info('Bạn đã đăng ký khóa học này rồi!');
        setRecommendedCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId ? { ...course, isEnrolled: true } : course
          )
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  // Hàm sửa riskLevel dựa trên totalScore
  const fixRiskLevel = (totalScore) => {
    if (totalScore <= 10) return 'Low Risk';
    if (totalScore <= 20) return 'Moderate Risk';
    return 'High Risk';
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      let responseData, resultData, coursesData;

      if (id) {
        responseData = await getSurveyResponseById(id);
        console.log('Response data:', JSON.stringify(responseData.data, null, 2));
        setResponse(responseData.data);

        try {
          resultData = await getSurveyResult(id);
          console.log('Result data:', JSON.stringify(resultData.data, null, 2));

          // Sửa riskLevel nếu không hợp lệ
          const fixedRiskLevel = fixRiskLevel(resultData.data.totalScore || 0);
          if (resultData.data.riskLevel !== fixedRiskLevel) {
            console.log(`Fixing riskLevel from ${resultData.data.riskLevel} to ${fixedRiskLevel} for totalScore=${resultData.data.totalScore}`);
            resultData.data.riskLevel = fixedRiskLevel;
          }
          setResult(resultData.data);

          // Gọi API submit-and-recommend để lấy khóa học đề xuất
          try {
            if (!responseData.data || !responseData.data.surveyId) {
              throw new Error('Dữ liệu phản hồi khảo sát không hợp lệ hoặc thiếu surveyId');
            }
            const surveyResponseDTO = {
              surveyId: responseData.data.surveyId,
              userId: user.userId,
              submittedAt: new Date().toISOString(),
              totalScore: resultData.data.totalScore || 0,
              riskLevel: fixedRiskLevel,
              answers: responseData.data.answers?.map(answer => ({
                questionId: answer.questionId,
                optionId: answer.optionId,
                optionIds: answer.optionIds,
                textAnswer: answer.textAnswer
              })) || []
            };
            console.log('Submitting survey response for recommendations:', JSON.stringify(surveyResponseDTO, null, 2));
            coursesData = await submitSurveyAndGetRecommendations(surveyResponseDTO);
            console.log('Recommended courses:', JSON.stringify(coursesData.data, null, 2));

            // Kiểm tra trạng thái đăng ký
            const enrolledCourses = await axios.get('/enrollments/user').then(res => res.data?.map(e => e.courseId) || []);

            let coursesWithEnrollment = (coursesData.data.courses || []).map(course => ({
              ...course,
              isEnrolled: enrolledCourses.includes(course.id)
            }));

            // Dự phòng: Nếu API trả về rỗng hoặc sai (quá nhiều khóa học), lọc thủ công
            if (coursesWithEnrollment.length === 0 || coursesWithEnrollment.length > 1) {
              const allCoursesRes = await getAllCourses();
              const allCourses = allCoursesRes.data || [];
              const riskLevel = fixedRiskLevel.toLowerCase();
              const courseLevel = riskLevel.includes('high') || riskLevel.includes('cao') ? 'Advanced' :
                                 riskLevel.includes('moderate') || riskLevel.includes('trung bình') ? 'Intermediate' : 'Beginner';
              coursesWithEnrollment = allCourses.filter(course =>
                course.recommendedMinScore <= resultData.data.totalScore &&
                course.recommendedMaxScore >= resultData.data.totalScore &&
                course.level === courseLevel
              ).map(course => ({
                ...course,
                isEnrolled: enrolledCourses.includes(course.id)
              }));
              if (coursesWithEnrollment.length === 0) {
                toast.warn(`Không tìm thấy khóa học phù hợp cho điểm ${resultData.data.totalScore} và mức rủi ro ${fixedRiskLevel}. Vui lòng kiểm tra ngưỡng điểm.`);
              } else {
                toast.info(`Đã lọc thủ công ${coursesWithEnrollment.length} khóa học phù hợp`);
              }
            }
            setRecommendedCourses(coursesWithEnrollment);
          } catch (coursesError) {
            console.error('Courses error:', coursesError);
            toast.warn('Không thể tải danh sách khóa học đề xuất từ API, thử lọc thủ công...');
            // Dự phòng: Lấy tất cả khóa học và lọc thủ công
            const allCoursesRes = await getAllCourses();
            const allCourses = allCoursesRes.data || [];
            const enrolledCourses = await axios.get('/enrollments/user').then(res => res.data?.map(e => e.courseId) || []);
            const riskLevel = fixedRiskLevel.toLowerCase();
            const courseLevel = riskLevel.includes('high') || riskLevel.includes('cao') ? 'Advanced' :
                               riskLevel.includes('moderate') || riskLevel.includes('trung bình') ? 'Intermediate' : 'Beginner';
            const filteredCourses = allCourses.filter(course =>
              course.recommendedMinScore <= resultData.data.totalScore &&
              course.recommendedMaxScore >= resultData.data.totalScore &&
              course.level === courseLevel
            ).map(course => ({
              ...course,
              isEnrolled: enrolledCourses.includes(course.id)
            }));
            setRecommendedCourses(filteredCourses);
            if (filteredCourses.length === 0) {
              toast.warn(`Không tìm thấy khóa học phù hợp cho điểm ${resultData.data.totalScore} và mức rủi ro ${fixedRiskLevel}. Vui lòng kiểm tra ngưỡng điểm.`);
            } else {
              toast.info(`Đã lọc thủ công ${filteredCourses.length} khóa học phù hợp`);
            }
          }
        } catch (resultError) {
          console.log('Result error:', resultError);
          if (resultError.response?.status === 404) {
            setResult({
              totalScore: responseData.data.totalScore || 0,
              riskLevel: fixRiskLevel(responseData.data.totalScore || 0),
              maxScore: responseData.data.survey?.surveyType?.maxScore || 100
            });
            // Dự phòng: Lấy tất cả khóa học và lọc thủ công
            const allCoursesRes = await getAllCourses();
            const allCourses = allCoursesRes.data || [];
            const enrolledCourses = await axios.get('/enrollments/user').then(res => res.data?.map(e => e.courseId) || []);
            const riskLevel = fixRiskLevel(responseData.data.totalScore || 0).toLowerCase();
            const courseLevel = riskLevel.includes('high') || riskLevel.includes('cao') ? 'Advanced' :
                               riskLevel.includes('moderate') || riskLevel.includes('trung bình') ? 'Intermediate' : 'Beginner';
            const filteredCourses = allCourses.filter(course =>
              course.recommendedMinScore <= (responseData.data.totalScore || 0) &&
              course.recommendedMaxScore >= (responseData.data.totalScore || 0) &&
              course.level === courseLevel
            ).map(course => ({
              ...course,
              isEnrolled: enrolledCourses.includes(course.id)
            }));
            setRecommendedCourses(filteredCourses);
            toast.warn('Không thể tính điểm khảo sát do dữ liệu không đầy đủ. Đã lọc thủ công khóa học.');
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
                    riskLevel: fixRiskLevel(responseData?.data?.totalScore || 0),
                    maxScore: responseData?.data?.survey?.surveyType?.maxScore || 100
                  }
                };
              }
              throw err;
            })
          ]);
          console.log('Latest response data:', JSON.stringify(responseData.data, null, 2));
          console.log('Latest result data:', JSON.stringify(resultData.data, null, 2));

          // Sửa riskLevel nếu không hợp lệ
          const fixedRiskLevel = fixRiskLevel(resultData.data.totalScore || 0);
          if (resultData.data.riskLevel !== fixedRiskLevel) {
            console.log(`Fixing riskLevel from ${resultData.data.riskLevel} to ${fixedRiskLevel} for totalScore=${resultData.data.totalScore}`);
            resultData.data.riskLevel = fixedRiskLevel;
          }
          setResponse(responseData.data);
          setResult(resultData.data);

          // Gọi API submit-and-recommend cho phản hồi mới nhất
          try {
            if (!responseData.data || !responseData.data.surveyId) {
              throw new Error('Dữ liệu phản hồi khảo sát không hợp lệ hoặc thiếu surveyId');
            }
            const surveyResponseDTO = {
              surveyId: responseData.data.surveyId,
              userId: user.userId,
              submittedAt: new Date().toISOString(),
              totalScore: resultData.data.totalScore || 0,
              riskLevel: fixedRiskLevel,
              answers: responseData.data.answers?.map(answer => ({
                questionId: answer.questionId,
                optionId: answer.optionId,
                optionIds: answer.optionIds,
                textAnswer: answer.textAnswer
              })) || []
            };
            console.log('Submitting survey response for recommendations:', JSON.stringify(surveyResponseDTO, null, 2));
            coursesData = await submitSurveyAndGetRecommendations(surveyResponseDTO);
            console.log('Recommended courses:', JSON.stringify(coursesData.data, null, 2));

            // Kiểm tra trạng thái đăng ký
            const enrolledCourses = await axios.get('/enrollments/user').then(res => res.data?.map(e => e.courseId) || []);
            let coursesWithEnrollment = (coursesData.data.courses || []).map(course => ({
              ...course,
              isEnrolled: enrolledCourses.includes(course.id)
            }));

            // Dự phòng: Nếu API trả về rỗng hoặc sai, lọc thủ công
            if (coursesWithEnrollment.length === 0 || coursesWithEnrollment.length > 1) {
              const allCoursesRes = await getAllCourses();
              const allCourses = allCoursesRes.data || [];
              const riskLevel = fixedRiskLevel.toLowerCase();
              const courseLevel = riskLevel.includes('high') || riskLevel.includes('cao') ? 'Advanced' :
                                 riskLevel.includes('moderate') || riskLevel.includes('trung bình') ? 'Intermediate' : 'Beginner';
              coursesWithEnrollment = allCourses.filter(course =>
                course.recommendedMinScore <= resultData.data.totalScore &&
                course.recommendedMaxScore >= resultData.data.totalScore &&
                course.level === courseLevel
              ).map(course => ({
                ...course,
                isEnrolled: enrolledCourses.includes(course.id)
              }));
              if (coursesWithEnrollment.length === 0) {
                toast.warn(`Không tìm thấy khóa học phù hợp cho điểm ${resultData.data.totalScore} và mức rủi ro ${fixedRiskLevel}. Vui lòng kiểm tra ngưỡng điểm.`);
              } else {
                toast.info(`Đã lọc thủ công ${coursesWithEnrollment.length} khóa học phù hợp`);
              }
            }
            setRecommendedCourses(coursesWithEnrollment);
          } catch (coursesError) {
            console.error('Courses error:', coursesError);
            toast.warn('Không thể tải danh sách khóa học đề xuất từ API, thử lọc thủ công...');
            // Dự phòng: Lấy tất cả khóa học và lọc thủ công
            const allCoursesRes = await getAllCourses();
            const allCourses = allCoursesRes.data || [];
            const enrolledCourses = await axios.get('/enrollments/user').then(res => res.data?.map(e => e.courseId) || []);
            const riskLevel = fixedRiskLevel.toLowerCase();
            const courseLevel = riskLevel.includes('high') || riskLevel.includes('cao') ? 'Advanced' :
                               riskLevel.includes('moderate') || riskLevel.includes('trung bình') ? 'Intermediate' : 'Beginner';
            const filteredCourses = allCourses.filter(course =>
              course.recommendedMinScore <= resultData.data.totalScore &&
              course.recommendedMaxScore >= resultData.data.totalScore &&
              course.level === courseLevel
            ).map(course => ({
              ...course,
              isEnrolled: enrolledCourses.includes(course.id)
            }));
            setRecommendedCourses(filteredCourses);
            if (filteredCourses.length === 0) {
              toast.warn(`Không tìm thấy khóa học phù hợp cho điểm ${resultData.data.totalScore} và mức rủi ro ${fixedRiskLevel}. Vui lòng kiểm tra ngưỡng điểm.`);
            } else {
              toast.info(`Đã lọc thủ công ${filteredCourses.length} khóa học phù hợp`);
            }
          }
        } else {
          setResult({ totalScore: 0, riskLevel: 'Chưa có kết quả', maxScore: 100 });
          setRecommendedCourses([]);
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
    if (level.includes('low') || level.includes('thấp')) return 'green';
    if (level.includes('moderate') || level.includes('trung bình')) return 'yellow';
    if (level.includes('high') || level.includes('cao')) return 'red';
    return 'gray';
  };

  const getRiskIcon = (riskLevel) => {
    if (!riskLevel) return <FaRegMeh className="text-gray-400 w-10 h-10" />;
    const level = riskLevel.toLowerCase();
    if (level.includes('low') || level.includes('thấp')) return <FaRegSmile className="text-green-500 w-10 h-10" />;
    if (level.includes('moderate') || level.includes('trung bình')) return <FaRegMeh className="text-yellow-500 w-10 h-10" />;
    if (level.includes('high') || level.includes('cao')) return <FaRegFrown className="text-red-500 w-10 h-10" />;
    return <FaRegMeh className="text-gray-400 w-10 h-10" />;
  };

  const getRiskRecommendation = (riskLevel) => {
    if (!riskLevel) return 'Không có dữ liệu để đưa ra khuyến nghị.';
    const level = riskLevel.toLowerCase();
    if (level.includes('high') || level.includes('cao')) return 'Bạn đang ở mức nguy cơ cao. Hãy đặt lịch tư vấn với chuyên gia ngay để được hỗ trợ kịp thời.';
    if (level.includes('moderate') || level.includes('trung bình')) return 'Bạn đang ở mức nguy cơ trung bình. Hãy theo dõi thói quen của mình và cân nhắc tư vấn nếu cần.';
    if (level.includes('low') || level.includes('thấp')) return 'Bạn đang ở mức nguy cơ thấp. Hãy tiếp tục duy trì thói quen lành mạnh.';
    return 'Không có dữ liệu để đưa ra khuyến nghị.';
  };

  // Animate progress bar
  useEffect(() => {
    const score = result?.totalScore || response?.totalScore || 0;
    const maxScore = result?.maxScore || response?.surveyType?.maxScore || 100;
    const scorePercentage = maxScore ? (score / maxScore) * 100 : 0;
    if (!loading && scorePercentage) {
      setProgress(0);
      const target = Math.min(scorePercentage, 100);
      let current = 0;
      const step = () => {
        current += 2;
        if (current > target) current = target;
        setProgress(current);
        if (current < target) {
          setTimeout(step, 10);
        }
      };
      step();
    }
  }, [loading, result, response]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-red-50 text-red-700 p-6 rounded-xl shadow-lg">
          <p>{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!result && !userAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Chưa có kết quả</h3>
          <p className="text-gray-500 mt-2">Bạn chưa hoàn thành khảo sát nào.</p>
          <div className="mt-6">
            <Link
              to="/surveys"
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Xem danh sách khảo sát
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const riskColor = getRiskLevelColor(result?.riskLevel || userAnalysis?.riskLevel);
  const riskLevel = result?.riskLevel || userAnalysis?.riskLevel;
  const score = result?.totalScore || response?.totalScore || 0;
  const maxScore = result?.maxScore || response?.surveyType?.maxScore || 100;
  const scorePercentage = maxScore ? (score / maxScore) * 100 : 0;
  const isHighRisk = riskLevel?.toLowerCase().includes('high') || riskLevel?.toLowerCase().includes('cao');

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 p-10 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/surveys"
            className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
            </svg>
            Quay lại danh sách khảo sát
          </Link>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <AnimatedCircularProgress
            percentage={scorePercentage}
            color={riskColor}
            icon={getRiskIcon(riskLevel)}
            riskLabel={riskLevel || 'Chưa xác định'}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Kết quả khảo sát</h1>
            {response && (
              <p className="text-gray-500 mb-2">
                Hoàn thành vào: {response.submittedAt ? new Date(response.submittedAt).toLocaleString('vi-VN') : 'Chưa xác định thời gian'}
              </p>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-gray-700">Điểm số:</span>
              <span className="font-bold text-xl text-blue-700">{score}/{maxScore}</span>
            </div>
            <div className={`rounded-xl px-4 py-3 flex items-center gap-3 bg-${riskColor}-100 border-l-4 border-${riskColor}-400 mb-4`}>
              {getRiskIcon(riskLevel)}
              <div>
                <span className={`font-semibold text-${riskColor}-700`}>{riskLevel || 'Chưa xác định'}</span>
                <p className="text-sm mt-1 text-gray-600">{getRiskRecommendation(riskLevel)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              {isHighRisk && user?.permissions?.includes('BOOK_APPOINTMENTS') && (
                <Link
                  to="/book-appointment"
                  className="block w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl text-center shadow hover:scale-105 transition-transform"
                >
                  Đặt lịch tư vấn với chuyên gia
                </Link>
              )}
              <Link
                to="/surveys"
                className="block w-full bg-blue-50 text-blue-700 font-semibold py-3 px-4 rounded-xl text-center shadow hover:bg-blue-100 transition"
              >
                Làm khảo sát khác
              </Link>
              <Link
                to="/profile"
                className="block w-full bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl text-center shadow hover:bg-gray-100 transition"
              >
                Xem hồ sơ của bạn
              </Link>
            </div>
          </div>
        </div>

        {/* Section khóa học đề xuất */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Khóa học đề xuất cho bạn</h2>
          {recommendedCourses.length === 0 ? (
            <div className="text-gray-500 text-center p-6 bg-white rounded-xl shadow">
              Không tìm thấy khóa học phù hợp dựa trên kết quả khảo sát (Điểm: {score}, Mức rủi ro: {riskLevel || 'Chưa xác định'}). Vui lòng kiểm tra ngưỡng điểm hoặc làm lại khảo sát.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xl font-semibold text-blue-700 mb-2">{course.title || 'Chưa có tên khóa học'}</div>
                    <div className="text-gray-600 mb-2">{course.description || 'Chưa có mô tả'}</div>
                    <div className="text-sm text-gray-400 mb-2">Độ khó: <span className="font-medium text-blue-600">{course.level || 'Không xác định'}</span></div>
                    <div className="text-sm text-gray-400 mb-2">Đối tượng: {course.ageGroup || 'Không xác định'}</div>
                    <div className="text-sm text-gray-400">Điểm phù hợp: {typeof course.recommendedMinScore === 'number' && typeof course.recommendedMaxScore === 'number' ? `${course.recommendedMinScore} - ${course.recommendedMaxScore}` : '-'}</div>
                    {course.isEnrolled && (
                      <div className="text-sm text-green-600 mt-2">✓ Đã đăng ký</div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    {course.isEnrolled ? (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Vào khóa học
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        onClick={() => handleEnroll(course.id)}
                      >
                        Đăng ký
                      </button>
                    )}
                    <Link to={`/courses/${course.id}`} className="px-4 py-2 bg-gray-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Xem nội dung</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SurveyResults;
