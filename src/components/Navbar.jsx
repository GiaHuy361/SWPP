<nav className="flex space-x-4">
  <Link
    to="/"
    className={`${
      location.pathname === "/"
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    } px-3 py-2 text-sm font-medium`}
  >
    Trang chủ
  </Link>

  <Link
    to="/consultants"
    className={`${
      location.pathname === "/consultants"
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    } px-3 py-2 text-sm font-medium`}
  >
    Tìm chuyên gia
  </Link>

  <Link
    to="/surveys"
    className={`${
      location.pathname === "/surveys"
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    } px-3 py-2 text-sm font-medium`}
  >
    Khảo sát
  </Link>

  <Link
    to="/about"
    className={`${
      location.pathname === "/about"
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    } px-3 py-2 text-sm font-medium`}
  >
    Giới thiệu
  </Link>
</nav>