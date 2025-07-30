import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onOpenSubmitModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get current user from localStorage
  let userName = 'Guest';
  let userAvatar = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      userName = user.name;
      userAvatar = user.avatar;
    }
  } catch {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        // Scrolling down and past 50px - hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
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
  const showProfile = location.pathname !== '/profile'; // Hide profile on profile page
  const showHome = location.pathname !== '/dashboard';

  return (
    <>
      <nav className={`bg-[#18382c] shadow px-8 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-20 border-b border-[#214a3c] transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#8ecdb7]">CampusVoice</span>
        </div>
        <div className="flex gap-6 items-center">
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
                  src={`http://localhost:5000/${userAvatar.replace(/\\/g, '/')}`}
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
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar; 