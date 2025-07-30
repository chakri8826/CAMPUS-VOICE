import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      // Make API call to backend
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        // Handle specific role validation error
        if (data.message === 'Invalid role for this user') {
          throw new Error('You do not have permission to access this role. Please select the correct role.');
        }
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.data.token);
      
      // Normalize avatar path before storing user data
      const normalizedUser = data.data.user;
      if (normalizedUser.avatar) {
        normalizedUser.avatar = normalizedUser.avatar.replace(/\\/g, '/');
      }
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      setToast({ type: 'success', message: 'Login successful!' });

      // Redirect based on role
      setTimeout(() => {
        if (data.data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Login failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col justify-center  w-[802px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#10231c] @[480px]:rounded-lg min-h-[218px]"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhxH6xq5EJe3U0G9DwBz6m5A-6CEtc596ex6S0L9Org5Pp7Kgm4ylYyXc4JCL_SmRjW4ZpH9bUOjTG0LJzWFunrr6TUsWif8WV3XVTE86AkeMEbOBMNUJpzsA6A-ta-dUBp39DnBMupDU7CnwVzo9uOG7E1HRECIcWD7eqQ6yB2KGckMhnc-Bv8IUCdbeb8RE2OTHYpUa0CfuauZJEOUTtMJBMJzhb_9uwTdFw5GshdqdqnQS1aJpfnd2MSUJ-AlO-ZSwdH6gi6jw")'
                  }}
                ></div>
              </div>
            </div>
            
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Welcome to CampusVoice</h2>
            
            {/* <div className="flex flex-col items-center justify-center h-screen">   */}

            <form onSubmit={handleSubmit} className="flex justify-center py-6">
  <div className="flex flex-col w-[380px] space-y-6">
    <label className="flex flex-col">
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="form-input w-full rounded-lg text-white bg-[#214a3c] placeholder:text-[#8ecdb7] p-4 h-14 text-base focus:outline-none"
      />
    </label>

    <label className="flex flex-col">
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        className="form-input w-full rounded-lg text-white bg-[#214a3c] placeholder:text-[#8ecdb7] p-4 h-14 text-base focus:outline-none"
      />
    </label>

    <button
      type="submit"
      disabled={loading}
      className="h-12 px-4 rounded-lg bg-[#019863] text-white font-bold text-sm hover:bg-[#017a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Logging In...' : 'Log In'}
    </button>
  </div>
</form>

              
            
            <Link to="/register" className="text-[#8ecdb7] text-lg   font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-white transition-colors">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
      
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
} 