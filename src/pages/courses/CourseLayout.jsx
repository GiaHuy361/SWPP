import React from 'react';

// Layout with sidebar for modules/lessons
export default function CourseLayout({ modules, currentModuleId, currentLessonId, onSelectLesson, children, completedLessons = [], quizStatusMap = {} }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r shadow-lg p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Nội dung khóa học</h2>
        <nav className="flex-1 overflow-y-auto">
          {modules?.map((module) => (
            <div key={module.id} className="mb-4">
              <div className={`font-semibold text-base mb-2 ${module.id === currentModuleId ? 'text-blue-600' : 'text-gray-700'}`}>{module.title}</div>
              <ul className="pl-3 border-l ml-1">
                {module.lessons?.map((lesson, idx) => (
                  <li key={lesson.id} className="flex items-center gap-2">
                    <button
                      className={`block w-full text-left py-1 px-2 rounded hover:bg-blue-50 transition font-medium ${lesson.id === currentLessonId ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                      onClick={() => onSelectLesson(module.id, lesson.id)}
                    >
                      {lesson.title}
                    </button>
                    {completedLessons.includes(lesson.id) && (
                      <span className="text-green-500 text-lg" title="Đã hoàn thành">✔</span>
                    )}
                    {/* Hiển thị icon quiz nếu là lesson cuối cùng của module và module có quiz */}
                    {idx === module.lessons.length - 1 && quizStatusMap[module.id] && (
                      <span
                        className="ml-1"
                        title="Có quiz cho module này"
                        style={{ fontSize: '1.1em' }}
                      >
                        📝
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
        {/* ĐÃ ẨN NÚT NHẬN CHỨNG CHỈ */}
      </main>
    </div>
  );
}
