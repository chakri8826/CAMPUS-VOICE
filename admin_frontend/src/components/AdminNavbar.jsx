import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const userName = user?.name || 'Admin';

  // Logout function
  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-[#18382c] shadow px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-20 border-b border-[#214a3c]"> {/* Responsive padding */}
        <div className="flex items-center gap-3">
          <span className="text-lg sm:text-xl font-bold text-[#8ecdb7]">CampusVoice Admin</span> {/* Responsive text size */}
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-center"> {/* Hidden on mobile, flex on medium+ */}
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium leading-normal transition-colors ${
              location.pathname === '/dashboard' 
                ? 'text-white' 
                : 'text-[#8ecdb7] hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin" 
            className={`text-sm font-medium leading-normal transition-colors ${
              location.pathname === '/admin' 
                ? 'text-white' 
                : 'text-[#8ecdb7] hover:text-white'
            }`}
          >
            Admin Panel
          </Link>
          <div className="flex items-center gap-2 sm:gap-3"> {/* Responsive gap */}
            <span className="text-[#8ecdb7] text-xs sm:text-sm">Welcome, {userName}</span> {/* Responsive text size */}
          </div>
          <button 
            onClick={handleLogout} 
            className="px-2 sm:px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold transition text-xs sm:text-sm" /* Responsive padding and text size */
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[#18382c] border-b border-[#214a3c] z-20 flex flex-col gap-2 py-3 px-4">
          <Link 
            to="/dashboard" 
            className={`px-3 py-2 text-base font-medium transition-colors rounded ${
              location.pathname === '/dashboard' 
                ? 'text-white bg-[#214a3c]' 
                : 'text-[#8ecdb7] hover:text-white hover:bg-[#214a3c]'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin" 
            className={`px-3 py-2 text-base font-medium transition-colors rounded ${
              location.pathname === '/admin' 
                ? 'text-white bg-[#214a3c]' 
                : 'text-[#8ecdb7] hover:text-white hover:bg-[#214a3c]'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Admin Panel
          </Link>
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#214a3c] mt-2">
            <span className="text-[#8ecdb7] text-sm">Welcome, {userName}</span>
            <button 
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
} 