import React, { useEffect, useState } from 'react';
import CourseLayout from './CourseLayout';
import { getModulesByCourseId, getLessonsByModuleId } from '../../services/courseService';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseProgress } from '../../services/progressService';
import axios from '../../utils/axios';

export default function CoursePage(props) {
  // Lấy courseId từ URL nếu chưa truyền props
  const params = useParams();
  const courseId = props.courseId || params.courseId;
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [courseQuiz, setCourseQuiz] = useState(null); // course-level quiz
  const [quizStatus, setQuizStatus] = useState(null); // { passed, lastResult }

  // Fetch modules & lessons for course
  useEffect(() => {
    async function fetchModulesAndLessons() {
      setLoading(true);
      try {
        const res = await getModulesByCourseId(courseId);
        const modulesRaw = res.data || [];
        // Lấy lesson cho từng module
        const modulesWithLessons = await Promise.all(
          modulesRaw.map(async (mod) => {
            const lessonsRes = await getLessonsByModuleId(mod.id);
            return { ...mod, lessons: lessonsRes.data || [] };
          })
        );
        setModules(modulesWithLessons);
        // Chọn module và lesson đầu tiên mặc định nếu có
        if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
          setCurrentModuleId(modulesWithLessons[0].id);
          setCurrentLessonId(modulesWithLessons[0].lessons[0].id);
        }
      } catch (err) {
        setModules([]);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchModulesAndLessons();
  }, [courseId]);

  // Fetch lesson content when currentLessonId changes
  useEffect(() => {
    // Lấy lesson từ modules đã load sẵn
    if (currentModuleId && currentLessonId) {
      const module = modules.find((m) => m.id === currentModuleId);
      const lesson = module?.lessons?.find((l) => l.id === currentLessonId);
      setLessonContent(lesson || null);
    } else {
      setLessonContent(null);
    }
  }, [currentModuleId, currentLessonId, modules]);

  // Fetch progress
  useEffect(() => {
    async function fetchProgress() {
      if (!courseId) return;
      try {
        const res = await getCourseProgress(courseId);
        const completed = res.data?.map((p) => p.lessonId) || [];
        setCompletedLessons(completed);
      } catch {
        setCompletedLessons([]);
      }
    }
    fetchProgress();
  }, [courseId]);

  // Tính % progress
  useEffect(() => {
    const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    setProgressPercent(progressPercent);
    
    console.log(`CoursePage progress: ${completedLessons.length}/${totalLessons} = ${progressPercent}%`);
  }, [modules, completedLessons]);

  // Fetch course-level quiz and status
  useEffect(() => {
    async function fetchCourseQuizAndStatus() {
      if (!courseId) return;
      try {
        // Get course-level quiz
        const quizRes = await axios.get(`/courses/${courseId}/quizzes`);
        const quizList = quizRes.data || [];
        if (quizList.length > 0) {
          setCourseQuiz(quizList[0]);
          
          // Try multiple API endpoints to get quiz submission status
          console.log('🔍 Checking quiz submission status...');
          let submissionFound = false;
          
          // Try endpoint 1: /quizzes/{id}/my-latest-submission
          try {
            const resultRes = await axios.get(`/quizzes/${quizList[0].id}/my-latest-submission`);
            setQuizStatus({ passed: resultRes.data?.passed, lastResult: resultRes.data });
            console.log('✅ Quiz submission found via /my-latest-submission:', resultRes.data);
            submissionFound = true;
          } catch (error1) {
            console.log('❌ /my-latest-submission failed:', error1.response?.status);
            
            // Try endpoint 2: /quizzes/{id}/submissions (get all submissions for this user)
            try {
              const submissionsRes = await axios.get(`/quizzes/${quizList[0].id}/submissions`);
              const submissions = submissionsRes.data || [];
              if (submissions.length > 0) {
                // Get the latest submission (assuming they're sorted by date or have a timestamp)
                const latestSubmission = submissions[submissions.length - 1];
                setQuizStatus({ passed: latestSubmission?.passed, lastResult: latestSubmission });
                console.log('✅ Quiz submission found via /submissions:', latestSubmission);
                submissionFound = true;
              }
            } catch (error2) {
              console.log('❌ /submissions also failed:', error2.response?.status);
            }
          }
          
          // If no submission found, set default state
          if (!submissionFound) {
            setQuizStatus({ passed: false, lastResult: null });
            console.log('ℹ️ No quiz submission found (user hasnt taken quiz yet)');
          }
        } else {
          setCourseQuiz(null);
          setQuizStatus(null);
          console.log('ℹ️ No quiz found for this course');
        }
      } catch (error) {
        setCourseQuiz(null);
        setQuizStatus(null);
        console.error('❌ Error fetching course quiz:', error);
      }
    }
    fetchCourseQuizAndStatus();
  }, [courseId]);

  const handleSelectLesson = (moduleId, lessonId) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  };

  // Kiểm tra lesson hiện tại đã hoàn thành chưa
  const isCurrentLessonCompleted = currentLessonId && completedLessons.includes(currentLessonId);

  // Xử lý đánh dấu hoàn thành bài học
  const handleCompleteLesson = async () => {
    if (!currentLessonId) return;
    setCompleteLoading(true);
    try {
      await axios.post(`/progress/lessons/${currentLessonId}/complete`);
      setCompletedLessons((prev) => [...prev, currentLessonId]);
    } catch (err) {
      alert(err.response?.data?.message || 'Đánh dấu hoàn thành thất bại.');
    } finally {
      setCompleteLoading(false);
    }
  };

  // Xác định lesson cuối cùng của module hiện tại
  const lastModule = modules[modules.length - 1];
  const lastLessonId = lastModule?.lessons?.[lastModule.lessons.length - 1]?.id;
  const isLastLesson = currentLessonId && lastLessonId && currentLessonId === lastLessonId;
  
  // Quiz pass nếu backend trả passed=true hoặc điểm 100%
  const isQuizPassed = quizStatus?.passed === true || (quizStatus?.lastResult && quizStatus.lastResult.percentageScore === 100);
  
  // Kiểm tra đã làm quiz chưa
  const hasAttemptedQuiz = quizStatus?.lastResult !== null;

  // Logic kiểm tra hoàn thành khóa học - QUAN TRỌNG
  const allLessons = modules.flatMap(m => m.lessons || []);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = completedLessons.length;
  
  // Kiểm tra tất cả lessons đã hoàn thành
  const allLessonsCompleted = totalLessonsCount > 0 && 
                              completedLessonsCount > 0 && 
                              completedLessonsCount === totalLessonsCount &&
                              allLessons.every(lesson => completedLessons.includes(lesson.id));
  
  // Kiểm tra có quiz và đã pass quiz - FIX: Phải kiểm tra rõ ràng
  const hasQuizAndPassed = courseQuiz && isQuizPassed === true;
  
  // LOGIC CHỨNG CHỈ - NGHIÊM NGẶT: Chỉ khi cả 2 điều kiện đều TRUE
  const isCourseCompleted = totalLessonsCount > 0 && 
                            courseQuiz &&  // Phải có quiz
                            allLessonsCompleted === true &&  // Tất cả lessons hoàn thành
                            isQuizPassed === true;  // Quiz phải pass

  // Debug logging chi tiết
  console.log('=== Course Completion Analysis ===');
  console.log('Course ID:', courseId);
  console.log('Total lessons:', totalLessonsCount);
  console.log('Completed lessons:', completedLessonsCount);
  console.log('Completed lesson IDs:', completedLessons);
  console.log('All lesson IDs:', allLessons.map(l => l.id));
  console.log('Has quiz:', !!courseQuiz);
  console.log('Quiz data:', courseQuiz);
  console.log('Has attempted quiz:', hasAttemptedQuiz);
  console.log('Quiz passed (strict):', isQuizPassed);
  console.log('Quiz status:', quizStatus);
  console.log('All lessons completed (strict):', allLessonsCompleted);
  console.log('Has quiz and passed (strict):', hasQuizAndPassed);
  console.log('🎯 Course completed (can get certificate):', isCourseCompleted);
  console.log('==================================');

  // Xử lý chuyển sang trang chứng chỉ
  const handleGoToCertificate = () => {
    // Kiểm tra NGHIÊM NGẶT trước khi cho phép lấy chứng chỉ
    console.log('🔒 Certificate access check:');
    console.log('- Total lessons:', totalLessonsCount);
    console.log('- Completed lessons:', completedLessonsCount);
    console.log('- All lessons completed:', allLessonsCompleted);
    console.log('- Has quiz:', !!courseQuiz);
    console.log('- Quiz passed:', isQuizPassed);
    console.log('- Course completed:', isCourseCompleted);
    
    if (!isCourseCompleted) {
      alert('❌ Bạn cần hoàn thành tất cả bài học và pass quiz trước khi nhận chứng chỉ!');
      return;
    }
    
    if (!allLessonsCompleted) {
      alert(`❌ Bạn cần hoàn thành tất cả ${totalLessonsCount} bài học! (Hiện tại: ${completedLessonsCount}/${totalLessonsCount})`);
      return;
    }
    
    if (!courseQuiz) {
      alert('❌ Khóa học này chưa có quiz!');
      return;
    }
    
    if (!isQuizPassed) {
      alert('❌ Bạn cần làm và pass quiz khóa học trước khi nhận chứng chỉ!');
      return;
    }
    
    console.log('✅ All conditions met, navigating to certificate...');
    window.location.href = `/certificate/${courseId}`;
  };

  return (
    <CourseLayout
      modules={modules}
      currentModuleId={currentModuleId}
      currentLessonId={currentLessonId}
      onSelectLesson={handleSelectLesson}
      completedLessons={completedLessons}
      quizStatusMap={quizStatus ? { course: quizStatus } : {}}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-600">Tiến độ học tập:</span>
          <span className="font-semibold text-blue-700">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-400">Đang tải nội dung...</div>
      ) : lessonContent ? (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-4 text-blue-800 flex items-center gap-2">
            <span className="inline-block w-2 h-8 bg-blue-500 rounded mr-2"></span>
            {lessonContent.title}
          </h1>
          {lessonContent.videoUrl && (
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden shadow">
                <iframe
                  src={lessonContent.videoUrl.replace('watch?v=', 'embed/')}
                  title={lessonContent.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-none"
                ></iframe>
              </div>
            </div>
          )}
          <div className="prose max-w-none text-lg text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: lessonContent.content }} />
          {lessonContent.description && (
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <span className="font-semibold text-blue-700">Mô tả:</span> {lessonContent.description}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-sm text-gray-400">Vị trí trong module: {lessonContent.position}</span>
            <div className="flex gap-3 items-center">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCompleteLesson}
                disabled={isCurrentLessonCompleted || completeLoading}
              >
                {isCurrentLessonCompleted ? 'Đã hoàn thành' : completeLoading ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
              </button>
              {/* Nút quiz luôn hiện nếu có quiz cho khóa học */}
              {courseQuiz && (
                <button
                  className={`px-4 py-2 ${isQuizPassed ? 'bg-green-600' : 'bg-purple-600'} text-white rounded-lg font-semibold hover:${isQuizPassed ? 'bg-green-700' : 'bg-purple-700'} transition`}
                  onClick={() => navigate(`/courses/${courseId}/quizzes/${courseQuiz.id}`)}
                >
                  {isQuizPassed ? '✓ Quiz: Đã pass' : '📝 Làm quiz'}
                </button>
              )}
            </div>
          </div>
          {/* Hiển thị trạng thái quiz ở mọi bài học nếu có quiz */}
          {courseQuiz && (
            <div className={`mt-4 p-3 rounded border ${isQuizPassed ? 'border-green-400 bg-green-50 text-green-700' : hasAttemptedQuiz ? 'border-red-400 bg-red-50 text-red-700' : 'border-yellow-400 bg-yellow-50 text-yellow-700'}`}>
              <span className="font-bold">Trạng thái quiz khóa học:</span> 
              {!hasAttemptedQuiz ? ' Chưa làm quiz' : isQuizPassed ? ' Đã pass' : ' Chưa pass'}
              {quizStatus?.lastResult?.percentageScore !== undefined && (
                <span> | Điểm: <span className="font-bold">{quizStatus.lastResult.percentageScore}%</span></span>
              )}
            </div>
          )}
          
          {/* Hiển thị điều kiện để lấy chứng chỉ */}
          {courseQuiz && !isCourseCompleted && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">📋 Điều kiện để nhận chứng chỉ:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className={`flex items-center gap-2 ${allLessonsCompleted ? 'text-green-600' : 'text-blue-700'}`}>
                  <span className={`w-5 h-5 rounded-full ${allLessonsCompleted ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center text-white text-xs font-bold`}>
                    {allLessonsCompleted ? '✓' : '○'}
                  </span>
                  <span className="font-medium">Hoàn thành tất cả {totalLessonsCount} bài học</span>
                  <span className={`text-xs px-2 py-1 rounded ${allLessonsCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {completedLessonsCount}/{totalLessonsCount}
                  </span>
                </li>
                <li className={`flex items-center gap-2 ${isQuizPassed ? 'text-green-600' : 'text-blue-700'}`}>
                  <span className={`w-5 h-5 rounded-full ${isQuizPassed ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center text-white text-xs font-bold`}>
                    {isQuizPassed ? '✓' : '○'}
                  </span>
                  <span className="font-medium">Làm và pass quiz khóa học</span>
                  <span className={`text-xs px-2 py-1 rounded ${isQuizPassed ? 'bg-green-100 text-green-700' : hasAttemptedQuiz ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isQuizPassed ? 'Đã pass' : hasAttemptedQuiz ? 'Chưa pass' : 'Chưa làm'}
                  </span>
                </li>
              </ul>
            </div>
          )}
          
          {/* Nút nhận chứng chỉ khi hoàn thành khóa học - HIỆU ỨNG NHẢY LÊN */}
          {isCourseCompleted && (
            <div className="mt-8 flex flex-col items-center animate-bounce">
              <div className="text-green-700 font-bold text-2xl mb-2 text-center">
                🎉 CHÚC MỪNG! 🎉
              </div>
              <div className="text-green-600 font-semibold text-lg mb-4 text-center">
                Bạn đã hoàn thành tất cả {totalLessonsCount} bài học và pass quiz khóa học!
              </div>
              <button
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-lg font-bold text-lg shadow-2xl hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 animate-pulse"
                onClick={handleGoToCertificate}
              >
                🏆 NHẬN CHỨNG CHỈ NGAY 🏆
              </button>
              <div className="text-green-500 text-sm mt-2 animate-bounce">
                ⬆️ Click để nhận chứng chỉ của bạn! ⬆️
              </div>
            </div>
          )}
          {/* Quiz modal removed */}
        </div>
      ) : (
        <div className="text-gray-500">Chọn một bài học để bắt đầu.</div>
      )}
    </CourseLayout>
  );
}

/* Thêm spacing cho các module trên navbar */
/* Nếu bạn dùng Tailwind, chỉnh trong CourseLayout hoặc Navbar:
   Thêm className="flex gap-6" cho container chứa các module để các module cách nhau ra rõ ràng */
