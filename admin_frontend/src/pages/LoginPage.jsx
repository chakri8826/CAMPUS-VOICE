import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      const user = data.data?.user;
      const token = data.data?.token;
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (!user || user.role !== 'admin') throw new Error('Not an admin account');
      dispatch(loginSuccess({ user, token }));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#10231c] px-4 sm:px-6 py-4 sm:py-6"> {/* Responsive padding */}
      <form onSubmit={handleSubmit} className="bg-[#214a3c] p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md space-y-4 sm:space-y-6"> {/* Responsive padding and spacing */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Admin Login</h2> {/* Responsive text size and margin */}
        {error && <div className="text-red-400 mb-4 text-sm sm:text-base">{error}</div>} {/* Responsive text size */}
        <div className="mb-4">
          <label className="block text-[#8ecdb7] mb-2 text-sm sm:text-base">Email</label> {/* Responsive text size */}
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-3 py-2 sm:py-3 rounded bg-[#10231c] text-white text-sm sm:text-base" 
          /> {/* Responsive padding and text size */}
        </div>
        <div className="mb-4 sm:mb-6"> {/* Responsive margin */}
          <label className="block text-[#8ecdb7] mb-2 text-sm sm:text-base">Password</label> {/* Responsive text size */}
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full px-3 py-2 sm:py-3 rounded bg-[#10231c] text-white text-sm sm:text-base" 
          /> {/* Responsive padding and text size */}
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#019863] text-white py-2 sm:py-3 rounded font-semibold hover:bg-[#017a4f] transition text-sm sm:text-base" 
        > {/* Responsive padding and text size */}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 