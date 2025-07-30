import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user from localStorage
  let userName = 'Admin';
  let userAvatar = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      userName = user.name;
      userAvatar = user.avatar;
    }
  } catch {}

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-[#18382c] shadow px-8 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-20 border-b border-[#214a3c]">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-[#8ecdb7]">CampusVoice Admin</span>
      </div>
      <div className="flex gap-6 items-center">
        <Link 
          to="/dashboard" 
          className={`text-sm font-medium leading-normal transition-colors ${
            location.pathname === '/dashboard' 
              ? 'text-[#8ecdb7]' 
              : 'text-white hover:text-[#8ecdb7]'
          }`}
        >
          Dashboard
        </Link>
        <Link 
          to="/admin" 
          className={`text-sm font-medium leading-normal transition-colors ${
            location.pathname === '/admin' 
              ? 'text-[#8ecdb7]' 
              : 'text-white hover:text-[#8ecdb7]'
          }`}
        >
          Admin Panel
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[#8ecdb7] text-sm">Welcome, {userName}</span>
          {userAvatar ? (
            <div className="w-8 h-8 rounded-full bg-[#019863] flex items-center justify-center overflow-hidden">
              <img 
                src={`http://localhost:5000/${userAvatar.replace(/\\/g, '/')}`}
                alt="avatar" 
                className="w-8 h-8 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="text-white text-sm font-bold" style={{ display: 'none' }}>
                {userName.charAt(0)}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#019863] flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout} 
          className="px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
} 