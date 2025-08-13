import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { getAvatarUrl } from '../utils/avatarUtils.js';

const Navbar = ({ onOpenSubmitModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Get current user from Redux
  let userName = user?.name || 'Guest';
  let userAvatar = user?.avatar || null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSubmitComplaint = () => {
    if ((location.pathname === '/dashboard' || location.pathname === '/complaints') && onOpenSubmitModal) {
      // On dashboard or my complaints page, open modal
      onOpenSubmitModal();
    } else {
      // On other pages, navigate to submission page
      navigate('/complaints/new');
    }
  };

  // Scroll behavior for navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Determine which navigation options to show based on current page
  const showSubmitComplaint = location.pathname !== '/complaints/new';
  const showMyComplaints = location.pathname !== '/complaints';
  const showProfile = location.pathname !== '/profile';
  const showHome = location.pathname !== '/dashboard';

  return (
    <>
      <nav className={`bg-[#18382c] shadow px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-20 border-b border-[#214a3c] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg sm:text-xl font-bold text-[#8ecdb7]">CampusVoice</span>
        </div>
        {/* Hamburger for mobile */}
        <div className="sm:hidden flex items-center">
          <button
            className="text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Desktop menu */}
        <div className="hidden sm:flex gap-4 md:gap-6 items-center">
          {showHome && (
            <Link to="/dashboard" className="text-white text-sm font-medium leading-normal hover:text-[#8ecdb7] transition-colors">
              Home
            </Link>
          )}
          {showSubmitComplaint && (
            <button
              onClick={handleSubmitComplaint}
              className="text-white text-sm font-medium leading-normal hover:text-[#8ecdb7] transition-colors"
            >
              Submit Complaint
            </button>
          )}
          {showMyComplaints && (
            <Link to="/complaints" className="text-white text-sm font-medium leading-normal hover:text-[#8ecdb7] transition-colors">
              My Complaints
            </Link>
          )}
          {showProfile && (
            <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#019863] hover:bg-[#017a4f] transition-colors overflow-hidden">
              {userAvatar ? (
                <img 
                  src={getAvatarUrl(userAvatar)}
                  alt="avatar" 
                  className="w-8 h-8 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-white text-sm font-bold" style={{ display: userAvatar ? 'none' : 'flex' }}>
                {userName.charAt(0)}
              </span>
            </Link>
          )}
          <button 
            onClick={handleLogout} 
            className="px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold transition"
          >
            Logout
          </button>
        </div>
      </nav>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 bg-[#18382c] border-b border-[#214a3c] z-20 flex flex-col gap-2 py-3 px-4 animate-fade-in-down">
          {showHome && (
            <Link to="/dashboard" className="text-white text-base font-medium py-2 px-2 rounded hover:bg-[#214a3c]" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          )}
          {showSubmitComplaint && (
            <button
              onClick={() => { handleSubmitComplaint(); setMenuOpen(false); }}
              className="text-white text-base font-medium py-2 px-2 rounded hover:bg-[#214a3c] text-left"
            >
              Submit Complaint
            </button>
          )}
          {showMyComplaints && (
            <Link to="/complaints" className="text-white text-base font-medium py-2 px-2 rounded hover:bg-[#214a3c]" onClick={() => setMenuOpen(false)}>
              My Complaints
            </Link>
          )}
          {showProfile && (
            <Link to="/profile" className="flex items-center gap-2 py-2 px-2 rounded hover:bg-[#214a3c]" onClick={() => setMenuOpen(false)}>
              {userAvatar ? (
                <img 
                  src={getAvatarUrl(userAvatar)}
                  alt="avatar" 
                  className="w-7 h-7 object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-white text-base font-bold">Profile</span>
            </Link>
          )}
          <button 
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="w-full text-left px-3 py-2 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold transition"
          >
            Logout
          </button>
        </div>
      )}
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar; 
