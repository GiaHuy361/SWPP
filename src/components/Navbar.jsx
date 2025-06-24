import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

function Navbar({ menuItems }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="relative">
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      <ul
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-50 shadow-md md:shadow-none`}
      >
        {menuItems.map((item, index) => (
          <li key={index} className="my-2 md:my-0">
            {item.onClick ? (
              <button
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="text-gray-700 hover:text-blue-600 transition-colors text-lg md:text-base font-medium w-full text-left"
              >
                {item.label}
              </button>
            ) : (
              <Link
                to={item.path}
                className="text-gray-700 hover:text-blue-600 transition-colors text-lg md:text-base font-medium block"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;