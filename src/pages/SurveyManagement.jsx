import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import SurveyTypeManagement from './SurveyTypeManagement';
import SurveyListManagement from './SurveyListManagement';
import SurveyQuestionManagement from './SurveyQuestionManagement';
import SurveyOptionManagement from './SurveyOptionManagement';

function SurveyManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');

  if (!isAuthenticated || !user?.permissions?.includes('MANAGE_SURVEYS')) {
    navigate('/access-denied');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý khảo sát</h1>
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'types' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Loại khảo sát
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'surveys' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Khảo sát
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Câu hỏi
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'options' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Tùy chọn câu hỏi
          </button>
        </div>

        {activeTab === 'types' && <SurveyTypeManagement />}
        {activeTab === 'surveys' && <SurveyListManagement />}
        {activeTab === 'questions' && <SurveyQuestionManagement />}
        {activeTab === 'options' && <SurveyOptionManagement />}
      </motion.div>
    </div>
  );
}

export default SurveyManagement;