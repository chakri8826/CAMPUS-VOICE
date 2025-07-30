import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'admin' })
      });
      const data = await res.json();
      const user = data.data?.user;
      const token = data.data?.token;
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      if (!user || user.role !== 'admin') throw new Error('Not an admin account');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#10231c]">
      <form onSubmit={handleSubmit} className="bg-[#214a3c] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Register</h2>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-[#8ecdb7] mb-2">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded bg-[#10231c] text-white" />
        </div>
        <div className="mb-4">
          <label className="block text-[#8ecdb7] mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded bg-[#10231c] text-white" />
        </div>
        <div className="mb-6">
          <label className="block text-[#8ecdb7] mb-2">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 rounded bg-[#10231c] text-white" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#019863] text-white py-2 rounded font-semibold hover:bg-[#017a4f] transition">{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
} 