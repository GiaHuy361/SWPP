import React from 'react';
     import { useNavigate } from 'react-router-dom';

     function NotFoundPage() {
       const navigate = useNavigate();

       return (
         <div className="pt-24 min-h-screen flex items-center justify-center">
           <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg max-w-lg text-center">
             <svg className="h-16 w-16 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <h3 className="text-2xl font-medium text-yellow-800 mt-4">404 - Trang không tìm thấy</h3>
             <p className="mt-2 text-yellow-700">Trang bạn tìm kiếm không tồn tại. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.</p>
             <div className="mt-4">
               <button
                 onClick={() => navigate('/')}
                 className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
               >
                 Quay về trang chủ
               </button>
             </div>
           </div>
         </div>
       );
     }

     export default NotFoundPage;