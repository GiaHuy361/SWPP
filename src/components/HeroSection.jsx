import React from "react";

const HeroSection = () => {
  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 pb-16">
        {/* Logo lớn bên trái */}
        <div className="flex-1 flex justify-center md:justify-start mb-8 md:mb-0">
          <img
            src="/hero.png"
            alt="Đội Phòng Chống Ma Túy"
            className="w-[420px] h-[420px] max-w-[48vw] object-contain drop-shadow-2xl rounded-xl"
          />
        </div>
        {/* Nội dung bên phải */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            Chào mừng đến với <br /> 
            <span className="text-blue-600">Nền tảng của chúng tôi</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
            Khám phá những tính năng tuyệt vời và dịch vụ sẽ thay đổi trải nghiệm của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="/login" className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                Bắt đầu ngay
              </span>
            </a>
            <a
              href="/courses/enroll"
              className="px-6 py-3 text-base font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 text-center shadow-sm hover:shadow-md"
            >
              Khóa học
            </a>
          </div>
        </div>
      </div>
      {/* Wave effect dưới cùng */}
      <div className="absolute bottom-0 w-full">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
        >
          <defs>
            <path
              id="wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              href="#wave"
              x="48"
              y="0"
              fill="#3B82F6"
              fillOpacity="0.15"
            />
            <use
              href="#wave"
              x="48"
              y="3"
              fill="#3B82F6"
              fillOpacity="0.25"
            />
            <use
              href="#wave"
              x="48"
              y="5"
              fill="#3B82F6"
              fillOpacity="0.35"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;