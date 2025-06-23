import React from "react";

const HeroSection = () => {
  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 pb-16">
        {/* Logo lớn bên trái */}
        <div className="flex-1 flex justify-center md:justify-start mb-8 md:mb-0">
          <img
            src="/hero.png"
            alt="No Drugs Team Logo"
            className="w-[420px] h-[420px] max-w-[48vw] object-contain drop-shadow-2xl rounded-xl"
          />
        </div>
        {/* Nội dung bên phải */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start justify-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 leading-tight">
            Welcome to <br /> Our Platform
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-xl">
            Discover amazing features and services that will transform your
            experience
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <button className="px-8 py-3 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors duration-300">
              Get Started
            </button>
            <button className="px-8 py-3 text-lg font-semibold text-blue-700 border-2 border-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-300">
              Learn More
            </button>
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