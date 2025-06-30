import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function QuizModal({ courseId, quizId, onClose, onQuizCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answersMap, setAnswersMap] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Lấy quiz từ quizId hoặc courseId
  useEffect(() => {
    async function fetchQuiz() {
      try {
        let quizData = null;
        
        // Chỉ sử dụng courseId để lấy quiz (không dùng quizId vì backend không hỗ trợ)
        if (courseId) {
          const quizRes = await axios.get(`/courses/${courseId}/quizzes`);
          quizData = quizRes.data && quizRes.data.length > 0 ? quizRes.data[0] : null;
          console.log('Fetched quiz by course:', quizData);
        }
        
        setQuiz(quizData);
        if (quizData) {
          // Lấy câu hỏi
          const qRes = await axios.get(`/quizzes/${quizData.id}/questions`);
          setQuestions(qRes.data || []);
          console.log('Fetched questions:', qRes.data);
          
          // Lấy đáp án cho từng câu hỏi
          const ansMap = {};
          await Promise.all(
            (qRes.data || []).map(async (q) => {
              const aRes = await axios.get(`/questions/${q.id}/answers`);
              ansMap[q.id] = aRes.data || [];
            })
          );
          setAnswersMap(ansMap);
          console.log('Fetched answers:', ansMap);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setQuiz(null);
      }
    }
    fetchQuiz();
  }, [courseId, quizId]);

  // Xử lý chọn đáp án
  const handleSelect = (questionId, answerId) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  // Nộp bài
  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const payload = {
        durationTaken: 60, // hoặc tính thời gian thực tế
        answers: questions.map(q => ({
          questionId: q.id,
          selectedAnswerId: userAnswers[q.id]
        }))
      };
      const res = await axios.post(`/quizzes/${quiz.id}/submissions`, payload);
      setResult(res.data);
      console.log('✅ Quiz submitted successfully:', res.data);
      
      // Pass the submission result to parent component
      if (onQuizCompleted) onQuizCompleted(res.data);
    } catch (err) {
      console.error('❌ Quiz submission failed:', err);
      alert(err.response?.data?.message || 'Nộp bài thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) return <div className="p-6">Đang tải bài kiểm tra...</div>;

  if (result) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Kết quả bài kiểm tra</h2>
        <div>Điểm: <span className="font-bold">{result.percentageScore}%</span></div>
        <div>Trạng thái: <span className="font-bold">{result.passed ? 'Đạt' : 'Chưa đạt'}</span></div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Đóng</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{quiz.title || 'Bài kiểm tra'}</h2>
      {questions.map((q, idx) => (
        <div key={q.id} className="mb-4">
          <div className="font-semibold mb-2">{idx + 1}. {q.questionText}</div>
          <div className="flex flex-col gap-2">
            {(answersMap[q.id] || []).map(a => (
              <label key={a.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value={a.id}
                  checked={userAnswers[q.id] === a.id}
                  onChange={() => handleSelect(q.id, a.id)}
                  disabled={submitting}
                />
                {a.answerText}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded font-bold"
        onClick={handleSubmit}
        disabled={submitting || Object.keys(userAnswers).length !== questions.length}
      >
        {submitting ? 'Đang nộp...' : 'Nộp bài'}
      </button>
      <button className="ml-4 px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>Hủy</button>
    </div>
  );
}
