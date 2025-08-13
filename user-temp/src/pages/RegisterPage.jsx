import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import Toast from '../components/Toast';
import { getAvatarUrl } from '../utils/avatarUtils.js';

const validateEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const validate = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value) error = 'Email is required.';
      else if (!validateEmail(value)) error = 'Please enter a valid email address.';
    }
    if (field === 'password') {
      if (!value) error = 'Password is required.';
      else if (value.length < 6) error = 'Password must be at least 6 characters.';
    }
    if (field === 'name') {
      if (!value) error = 'Name is required.';
    }
    if (field === 'department') {
      if (!value) error = 'Department is required.';
    }
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validate all fields before submit
    const newErrors = {
      name: validate('name', form.name),
      email: validate('email', form.email),
      password: validate('password', form.password),
      department: validate('department', form.department)
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    setLoading(true);
    setToast(null);
    try {
      // Make API call to backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // If registration returns token and user, log them in
      if (data.data && data.data.token && data.data.user) {
        // Normalize avatar path before storing user data
        const normalizedUser = data.data.user;
        if (normalizedUser.avatar) {
          normalizedUser.avatar = getAvatarUrl(normalizedUser.avatar);
        }
        dispatch(loginSuccess({ user: normalizedUser, token: data.data.token }));
        setToast({ type: 'success', message: 'Registration successful! Redirecting...' });
        // Redirect handled by useEffect
      } else {
        setToast({ type: 'success', message: 'Registration successful! Please login.' });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-6 md:px-16 lg:px-40 flex flex-1 justify-center py-4 sm:py-6 md:py-8">
          <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#10231c] @[480px]:rounded-lg min-h-[180px] sm:min-h-[218px]"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhxH6xq5EJe3U0G9DwBz6m5A-6CEtc596ex6S0L9Org5Pp7Kgm4ylYyXc4JCL_SmRjW4ZpH9bUOjTG0LJzWFunrr6TUsWif8WV3XVTE86AkeMEbOBMNUJpzsA6A-ta-dUBp39DnBMupDU7CnwVzo9uOG7E1HRECIcWD7eqQ6yB2KGckMhnc-Bv8IUCdbeb8RE2OTHYpUa0CfuauZJEOUTtMJBMJzhb_9uwTdFw5GshdqdqnQS1aJpfnd2MSUJ-AlO-ZSwdH6gi6jw")'
                  }}
                ></div>
              </div>
            </div>
            <h2 className="text-white tracking-light text-xl sm:text-2xl md:text-[28px] font-bold leading-tight px-2 sm:px-4 text-center pb-3 pt-5">Create Your Account</h2>
            <div className="flex justify-center py-6">
              <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-2 sm:px-4">
                  <label className="flex flex-col">
                    <input
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={`form-input rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#214a3c] h-12 sm:h-14 placeholder:text-[#8ecdb7] p-3 sm:p-4 text-base ${errors.name ? 'border border-red-500' : ''}`}
                    />
                    {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name}</span>}
                  </label>
                </div>

                <div className="flex flex-col gap-1 px-2 sm:px-4">
                  <label className="flex flex-col">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={`form-input rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#214a3c] h-12 sm:h-14 placeholder:text-[#8ecdb7] p-3 sm:p-4 text-base ${errors.email ? 'border border-red-500' : ''}`}
                    />
                    {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email}</span>}
                  </label>
                </div>

                <div className="flex flex-col gap-1 px-2 sm:px-4">
                  <label className="flex flex-col">
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className={`form-input rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#214a3c] h-12 sm:h-14 placeholder:text-[#8ecdb7] p-3 sm:p-4 text-base ${errors.department ? 'border border-red-500' : ''}`}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.department && <span className="text-red-400 text-xs mt-1">{errors.department}</span>}
                  </label>
                </div>

                <div className="flex flex-col gap-1 px-2 sm:px-4">
                  <label className="flex flex-col">
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className={`form-input rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#214a3c] h-12 sm:h-14 placeholder:text-[#8ecdb7] p-3 sm:p-4 text-base ${errors.password ? 'border border-red-500' : ''}`}
                    />
                    {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password}</span>}
                  </label>
                </div>

                <div className="flex px-2 sm:px-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 sm:h-12 px-4 rounded-lg bg-[#019863] text-white text-sm font-bold hover:bg-[#017a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
            <Link to="/login" className="text-[#8ecdb7] text-base sm:text-lg font-normal leading-normal pb-3 pt-1 px-2 sm:px-4 text-center underline hover:text-white transition-colors">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
} 