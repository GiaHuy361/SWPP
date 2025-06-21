import React from "react";

const features = [
  { icon: "👤", title: "Quản lý người dùng", desc: "Thêm, sửa, xóa người dùng nhanh chóng" },
  { icon: "🛡️", title: "Phân quyền linh hoạt", desc: "Gán vai trò và quyền dễ dàng" },
  { icon: "📊", title: "Thống kê", desc: "Xem nhanh trạng thái và hoạt động người dùng" },
  { icon: "🔒", title: "Bảo mật", desc: "Xác thực an toàn bằng session hoặc Google" },
];

function FeatureSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, idx) => (
          <div key={idx} className="border border-[#e3eaf3] rounded-2xl shadow-md p-6 text-center bg-[#f5faff]">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg text-[#1976d2]">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;