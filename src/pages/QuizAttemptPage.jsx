import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CourseLayout from './courses/CourseLayout';
import { getQuizQuestions, submitQuiz, getQuestionAnswers } from '../services/courseService';
import axios from '../utils/axios';

export default function QuizAttemptPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false); // Mặc định chưa bắt đầu quiz
  const [questionAnswers, setQuestionAnswers] = useState({});

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.durationMinutes && quizStarted) {
      const now = new Date().getTime();
      if (!startTime) {
        setStartTime(now); // Initialize start time if not set yet
      }
      setTimeLeft(quiz.durationMinutes * 60);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, quizStarted]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Lấy thông tin quiz từ API
      console.log(`Đang lấy thông tin quiz cho khóa học ${courseId}, quiz ${quizId}`);
      const quizResponse = await axios.get(`/courses/${courseId}/quizzes`);
      console.log('API Response - Quiz list:', quizResponse);
      
      const quizzes = quizResponse.data || [];
      console.log('Tất cả quizzes:', quizzes);
      
      if (!quizzes || quizzes.length === 0) {
        console.error('Không tìm thấy quiz nào cho khóa học này');
        toast.error('Không tìm thấy quiz nào cho khóa học này');
        navigate(`/courses/${courseId}`);
        return;
      }
      
      // Tìm quiz hiện tại theo quizId
      console.log(`Tìm quiz với ID ${quizId} trong danh sách ${quizzes.length} quizzes`);
      const parsedQuizId = parseInt(quizId, 10);
      let currentQuiz = quizzes.find(q => q.id === parsedQuizId);
      
      if (!currentQuiz) {
        console.warn(`Không tìm thấy quiz với ID ${quizId}, dùng quiz đầu tiên thay thế`);
        currentQuiz = quizzes[0];
      }
      
      console.log('Quiz đã tìm thấy:', currentQuiz);
      setQuiz(currentQuiz);
      
      // Lấy danh sách câu hỏi
      console.log(`Đang lấy câu hỏi cho quiz ${currentQuiz.id}`);
      
      try {
        // Gọi trực tiếp API để xem response đầy đủ
        const questionsResponse = await axios.get(`/quizzes/${currentQuiz.id}/questions`);
        console.log('API Response - Questions:', questionsResponse);
        
        let questionsList = questionsResponse.data || [];
        console.log('Số câu hỏi đã tìm thấy:', questionsList.length);
        console.log('Danh sách câu hỏi:', questionsList);
        
        if (questionsList.length === 0) {
          console.warn('Quiz này chưa có câu hỏi nào');
          toast.warning('Quiz này chưa có câu hỏi nào');
        }
        
        // Xáo trộn câu hỏi nếu cần
        if (currentQuiz.shuffleQuestions) {
          questionsList = [...questionsList].sort(() => Math.random() - 0.5);
        }
        
        setQuestions(questionsList);
        
        // Khởi tạo object answers trống
        const initialAnswers = {};
        questionsList.forEach(q => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
        
        // Lấy đáp án cho mỗi câu hỏi
        console.log('Đang lấy đáp án cho các câu hỏi...');
        const answersData = {};
        
        for (const question of questionsList) {
          try {
            console.log(`Đang lấy đáp án cho câu hỏi ${question.id}`);
            // Gọi trực tiếp API để debug
            const answerResponse = await axios.get(`/questions/${question.id}/answers`);
            console.log(`API Response - Answers for question ${question.id}:`, answerResponse);
            
            const answersList = answerResponse.data || [];
            console.log(`Câu hỏi ${question.id} có ${answersList.length} đáp án:`, answersList);
            
            // Xáo trộn đáp án nếu cần
            if (currentQuiz.shuffleAnswers) {
              answersData[question.id] = [...answersList].sort(() => Math.random() - 0.5);
            } else {
              answersData[question.id] = answersList;
            }
          } catch (error) {
            console.error(`Lỗi khi tải đáp án cho câu hỏi ${question.id}:`, error);
            console.error('Chi tiết lỗi:', error.response?.data || error.message);
            answersData[question.id] = [];
          }
        }
        
        console.log('Hoàn thành việc lấy đáp án:', Object.keys(answersData).length);
        console.log('Dữ liệu đáp án:', answersData);
        setQuestionAnswers(answersData);
      } catch (questionError) {
        console.error('Lỗi khi lấy câu hỏi:', questionError);
        console.error('Chi tiết lỗi:', questionError.response?.data || questionError.message);
        toast.error('Không thể tải câu hỏi: ' + (questionError.response?.data?.message || questionError.message));
      }
    } catch (error) {
      console.error('Lỗi khi tải quiz:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      toast.error('Không thể tải bài quiz: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId
    });
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    // Set start time when the quiz actually starts
    setStartTime(new Date().getTime());
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Calculate quiz duration in seconds
      const durationTaken = startTime ? Math.floor((new Date().getTime() - startTime) / 1000) : 0;
      console.log(`Quiz duration: ${durationTaken} seconds (${Math.floor(durationTaken/60)} min ${durationTaken%60} sec)`);
      
      // Lọc bỏ các câu trả lời null
      const answersData = Object.entries(answers)
        .filter(([_, answerId]) => answerId !== null)
        .map(([questionId, answerId]) => ({
          questionId: parseInt(questionId),
          selectedAnswerId: parseInt(answerId) // Using selectedAnswerId instead of answerId as per backend requirements
        }));
      
      if (answersData.length === 0) {
        toast.warning('Bạn chưa chọn câu trả lời nào');
        setSubmitting(false);
        return;
      }
      
      // Format payload according to CourseQuizSubmissionDTO on backend
      const payload = {
        quizId: parseInt(quizId),
        durationTaken: durationTaken, // Adding required durationTaken field
        answers: answersData // Make sure answers format matches backend expectations
      };
      
      console.log('Nộp bài với dữ liệu:', payload);
      
      // Use the service function from courseService.js
      const response = await submitQuiz(quizId, payload);
      console.log('Kết quả nộp bài:', response.data);
      
      // Show quiz result if available
      if (response.data?.percentageScore !== undefined) {
        const isPassed = response.data.passed || response.data.percentageScore >= (quiz?.passingPercentage || 70);
        toast.success(
          `Điểm số: ${response.data.percentageScore}% - ${isPassed ? 'Đạt' : 'Chưa đạt'} 
          (${response.data.correctAnswers}/${response.data.totalQuestions} câu đúng)`
        );
      } else {
        toast.success('Nộp bài thành công!');
      }
      
      // Navigate back to course page after a short delay
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi nộp bài quiz:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      
      // Show detailed validation errors if available
      if (error.response?.data?.fieldErrors) {
        const validationErrors = error.response.data.fieldErrors;
        console.error('Validation errors:', validationErrors);
        
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        
        toast.error(`Lỗi dữ liệu: \n${errorMessages}`);
      } else {
        toast.error('Có lỗi khi nộp bài: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (loading) {
    return (
      <CourseLayout>
        <div className="p-5 text-center">
          <p className="text-lg">Đang tải bài quiz...</p>
        </div>
      </CourseLayout>
    );
  }

  // Hiển thị màn hình chào mừng trước khi bắt đầu quiz
  if (!quizStarted) {
    return (
      <CourseLayout>
        <div className="p-5">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Quiz: {quiz?.title || 'Kiểm tra kiến thức'}</h1>
            
            <div className="border-t border-b py-4 my-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Thời gian làm bài:</span>
                <span>{quiz?.durationMinutes || 0} phút</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Số câu hỏi:</span>
                <span>{questions.length} câu</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Điểm đạt:</span>
                <span>{quiz?.passingPercentage || 70}%</span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="mb-6 text-gray-600">Khi bạn sẵn sàng, nhấn "Bắt đầu làm quiz" để bắt đầu. Thời gian sẽ được tính khi bạn bắt đầu làm bài.</p>
              <button 
                onClick={handleStartQuiz} 
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition flex items-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bắt đầu làm quiz
              </button>
            </div>
            
            <div className="mt-8 pt-4 border-t text-sm text-gray-500">
              <p>Lưu ý:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Bài quiz sẽ tự động nộp khi hết thời gian</li>
                <li>Bạn chỉ được chọn một đáp án cho mỗi câu hỏi</li>
                <li>Không được phép quay lại trang trước hoặc làm mới trang khi đang làm bài</li>
                <li>Phải hoàn thành quiz để có thể nhận chứng chỉ khóa học</li>
              </ul>
            </div>
          </div>
        </div>
      </CourseLayout>
    );
  }

  return (
    <CourseLayout>
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz: {quiz?.title || 'Kiểm tra kiến thức'}</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">Thời gian còn lại:</span> {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-700">Hướng dẫn làm bài:</p>
              <ul className="list-disc ml-6 mt-1 text-sm text-yellow-600">
                <li>Chọn một đáp án cho mỗi câu hỏi</li>
                <li>Bấm "Nộp bài" khi hoàn thành</li>
                <li>Bài làm sẽ tự động nộp khi hết thời gian</li>
                <li>Điểm đạt: {quiz?.passingPercentage || 70}%</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
                </div>
                
                <div className="ml-11 mt-4 space-y-3">
                  {/* Sử dụng đáp án đã tải từ API */}
                  {questionAnswers[question.id]?.length > 0 ? (
                    questionAnswers[question.id].map(answer => (
                      <div key={answer.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`answer_${answer.id}`}
                          name={`question_${question.id}`}
                          value={answer.id}
                          checked={answers[question.id] === answer.id}
                          onChange={() => handleAnswerChange(question.id, answer.id)}
                          className="mr-3"
                        />
                        <label htmlFor={`answer_${answer.id}`} className="cursor-pointer">
                          {answer.answerText}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-red-500">Không tìm thấy đáp án cho câu hỏi này</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
              <p className="font-semibold">Quiz này chưa có câu hỏi</p>
              <p className="text-sm mt-2">Vui lòng liên hệ quản trị viên để thêm câu hỏi cho quiz này.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-70 flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang nộp bài...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Nộp bài
              </>
            )}
          </button>
        </div>
      </div>
    </CourseLayout>
  );
}
