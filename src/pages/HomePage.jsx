import React from "react";
import { Link } from "react-router-dom"; // Thêm dòng này
import { motion } from "framer-motion";
import { FiCheck, FiStar, FiUsers, FiBook, FiAward } from "react-icons/fi";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import TestimonialSection from "../components/TestimonialSection";

const HomePage = () => {
  const features = [
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Thân Thiện Người Dùng",
      description: "Giao diện trực quan được thiết kế cho trải nghiệm người dùng tốt nhất",
    },
    {
      icon: <FiStar className="w-6 h-6" />,
      title: "Chất Lượng Cao",
      description: "Tính năng cao cấp và chức năng dành cho mọi người dùng",
    },
    {
      icon: <FiBook className="w-6 h-6" />,
      title: "Dễ Dàng Học Tập",
      description: "Tài liệu và hướng dẫn toàn diện",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Hỗ Trợ Tốt Nhất",
      description: "Đội ngũ hỗ trợ tận tâm 24/7 luôn sẵn sàng phục vụ bạn",
    },
  ];

  const stats = [
    { number: "10K+", label: "Người Dùng Hoạt Động" },
    { number: "50M+", label: "Lượt Tải" },
    { number: "99.9%", label: "Độ Hài Lòng" },
    { number: "24/7", label: "Hỗ Trợ" },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Lưới Tính Năng */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính Năng Tuyệt Vời
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các tính năng mạnh mẽ giúp nền tảng của chúng tôi nổi bật
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần Thống Kê */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần Cách Thức Hoạt Động */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cách Thức Hoạt Động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Các bước đơn giản để bắt đầu sử dụng nền tảng của chúng tôi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tạo Tài Khoản",
                description: "Đăng ký miễn phí và thiết lập hồ sơ của bạn",
              },
              {
                step: "02",
                title: "Khám Phá Tính Năng",
                description: "Duyệt qua bộ tính năng đa dạng của chúng tôi",
              },
              {
                step: "03",
                title: "Đạt Kết Quả",
                description: "Đạt được mục tiêu với nền tảng của chúng tôi",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative p-6 bg-white rounded-xl shadow-lg"
              >
                <div className="text-5xl font-bold text-blue-100 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần Kêu Gọi Hành Động */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sẵn Sàng Để Bắt Đầu?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn người dùng hài lòng và bắt đầu hành trình của bạn ngay hôm nay
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Bắt Đầu Miễn Phí
              </Link>
              <Link to="/contact" className="px-8 py-3 text-lg font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                Liên Hệ Bán Hàng
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Đánh giá mức độ nghiện game */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Đánh giá mức độ nghiện game
              </h2>
              <p className="text-lg text-gray-600">
                Hoàn thành bài khảo sát ngắn để đánh giá mức độ nghiện game của bạn và nhận kết quả kèm lời khuyên từ chuyên gia.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0 md:mr-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Tại sao nên làm bài khảo sát?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Đánh giá mức độ nghiện game dựa trên tiêu chuẩn quốc tế
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Nhận kết quả và lời khuyên ngay lập tức
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Kết nối với chuyên gia tư vấn nếu cần thiết
                  </li>
                </ul>
              </div>

              <div className="md:w-1/3 flex justify-center">
                <Link
                  to="/surveys"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    ></path>
                  </svg>
                  Làm khảo sát ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nút trở về đầu trang */}
      <div className="fixed bottom-8 right-8">
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Trở về đầu trang"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
