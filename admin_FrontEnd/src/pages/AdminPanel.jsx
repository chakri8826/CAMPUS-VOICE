import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const departmentOptions = [
  { label: 'All', value: 'All' },
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Electrical Engineering', value: 'Electrical Engineering' },
  { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
  { label: 'Civil Engineering', value: 'Civil Engineering' },
  { label: 'Chemical Engineering', value: 'Chemical Engineering' },
  { label: 'Other', value: 'Other' }
];
const roleOptions = [
  { label: 'All', value: 'All' },
  { label: 'Student', value: 'student' },
  { label: 'Admin', value: 'admin' }
];
const statusOptions = ['All', 'Active', 'Inactive'];

const adminRoleOptions = [
  { label: 'Student', value: 'student' },
  { label: 'Admin', value: 'admin' }
];

export default function AdminPanel() {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState(null);
  const [maintenanceResult, setMaintenanceResult] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [userFilters, setUserFilters] = useState({ role: 'All', department: 'All', isActive: 'All' });
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userEditMode, setUserEditMode] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [userActivityLoading, setUserActivityLoading] = useState(false);
  const [userUpdateLoading, setUserUpdateLoading] = useState(false);
  const [userDeleteLoading, setUserDeleteLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState(null);
  const [showHealthMsg, setShowHealthMsg] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealth(null);
    setShowHealthMsg(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHealth(data.data || data);
      setShowHealthMsg(true);
      setTimeout(() => setShowHealthMsg(false), 3000);
    } catch (error) {
      setHealth({ error: 'Failed to fetch health info', success: false, message: 'Failed to fetch health info' });
      setShowHealthMsg(true);
      setTimeout(() => setShowHealthMsg(false), 3000);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setLogs(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.data || data);
    } catch (error) {
      setLogs({ error: 'Failed to fetch logs' });
    } finally {
      setLoadingLogs(false);
    }
  };

  const runMaintenance = async (action) => {
    setLoadingMaintenance(true);
    setMaintenanceResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setMaintenanceResult(data);
    } catch (error) {
      setMaintenanceResult({ error: 'Failed to run maintenance' });
    } finally {
      setLoadingMaintenance(false);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(userFilters.role !== 'All' && { role: userFilters.role }),
        ...(userFilters.department !== 'All' && { department: userFilters.department }),
        ...(userFilters.isActive !== 'All' && { isActive: userFilters.isActive === 'Active' })
      });
      const res = await fetch(`/api/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data);
        setUserPagination(data.pagination);
      } else {
        setUserError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setUserError('Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    setUserModalOpen(true);
    setUserEditMode(false);
    setSelectedUser(null);
    setUserActivity([]);
    setUserActivityLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [userRes, activityRes] = await Promise.all([
        fetch(`/api/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/users/${userId}/activity`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const userData = await userRes.json();
      const activityData = await activityRes.json();
      if (userRes.ok) setSelectedUser(userData.data);
      if (activityRes.ok) setUserActivity(activityData.data);
    } catch {}
    setUserActivityLoading(false);
  };

  // Update user
  const handleUserUpdate = async (userId, updates) => {
    setUserUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data.data);
        setUserEditMode(false);
        fetchUsers(userPagination.current);
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch {
      alert('Failed to update user');
    }
    setUserUpdateLoading(false);
  };

  // Deactivate user
  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    setUserDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUserModalOpen(false);
        setUsers(prev => prev.filter(u => u._id !== userId));
        setUserPagination(p => ({ ...p, total: p.total - 1 }));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to deactivate user');
      }
    } catch {
      alert('Failed to deactivate user');
    }
    setUserDeleteLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [userFilters]);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      {/* Admin Navbar */}
      <AdminNavbar />
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      {/* Main Content */}
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-16 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Admin Panel</p>
            </div>

            {/* User Management Card */}
            <div className="bg-[#214a3c] rounded-lg p-8 mb-8">
              <h2 className="text-white text-2xl font-bold mb-6">User Management</h2>
              <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
                <div className="flex gap-4 flex-wrap items-end">
                  <div className="flex flex-col">
                    <label className="text-[#8ecdb7] text-xs font-semibold mb-1 ml-1">Role</label>
                    <select value={userFilters.role} onChange={e => setUserFilters(f => ({ ...f, role: e.target.value }))} className="px-3 py-2 rounded bg-[#10231c] text-[#8ecdb7] border border-[#8ecdb7]">
                      {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[#8ecdb7] text-xs font-semibold mb-1 ml-1">Department</label>
                    <select value={userFilters.department} onChange={e => setUserFilters(f => ({ ...f, department: e.target.value }))} className="px-3 py-2 rounded bg-[#10231c] text-[#8ecdb7] border border-[#8ecdb7]">
                      {departmentOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[#8ecdb7] text-xs font-semibold mb-1 ml-1">Status</label>
                    <select value={userFilters.isActive} onChange={e => setUserFilters(f => ({ ...f, isActive: e.target.value }))} className="px-3 py-2 rounded bg-[#10231c] text-[#8ecdb7] border border-[#8ecdb7]">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => { setCreateAdminOpen(true); setCreateAdminError(null); setCreateAdminSuccess(null); }} className="px-4 py-2 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold whitespace-nowrap">Create New Admin</button>
              </div>
              <div className="overflow-x-auto rounded">
                <table className="min-w-full text-sm text-[#8ecdb7]">
                  <thead>
                    <tr className="bg-[#18382c]">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLoading ? (
                      <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                    ) : userError ? (
                      <tr><td colSpan={6} className="text-center py-4 text-red-400">{userError}</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4">No users found.</td></tr>
                    ) : users.map(user => (
                      <tr key={user._id} className="border-b border-[#18382c]">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.role}</td>
                        <td className="px-4 py-2">{user.department}</td>
                        <td className="px-4 py-2">{user.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => fetchUserDetails(user._id)} className="px-2 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] mr-2">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-end gap-2 mt-4">
                <button disabled={userPagination.current === 1} onClick={() => fetchUsers(userPagination.current - 1)} className="px-3 py-1 rounded bg-[#18382c] text-[#8ecdb7] disabled:opacity-50">Prev</button>
                <span className="text-[#8ecdb7]">Page {userPagination.current} of {userPagination.pages}</span>
                <button disabled={userPagination.current === userPagination.pages} onClick={() => fetchUsers(userPagination.current + 1)} className="px-3 py-1 rounded bg-[#18382c] text-[#8ecdb7] disabled:opacity-50">Next</button>
              </div>
            </div>

            {/* User Modal */}
            {userModalOpen && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-[#214a3c] rounded-lg p-8 w-full max-w-lg relative">
                  <button onClick={() => setUserModalOpen(false)} className="absolute top-2 right-2 text-white">&times;</button>
                  <h3 className="text-white text-xl font-bold mb-4">User Details</h3>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Name:</span> {selectedUser.name}</div>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Email:</span> {selectedUser.email}</div>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Role:</span> {selectedUser.role}</div>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Department:</span> {selectedUser.department}</div>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Status:</span> {selectedUser.isActive ? 'Active' : 'Inactive'}</div>
                  <div className="mb-2"><span className="font-semibold text-[#8ecdb7]">Joined:</span> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setUserEditMode(e => !e)} className="px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f]">{userEditMode ? 'Cancel Edit' : 'Edit'}</button>
                    <button onClick={() => handleUserDelete(selectedUser._id)} disabled={userDeleteLoading} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-800">{userDeleteLoading ? 'Deleting...' : 'Delete User'}</button>
                  </div>
                  {/* Edit Form */}
                  {userEditMode && (
                    <form className="mt-4" onSubmit={e => { e.preventDefault(); handleUserUpdate(selectedUser._id, { name: e.target.name.value, email: e.target.email.value, role: e.target.role.value, department: e.target.department.value }); }}>
                      <div className="mb-2">
                        <label className="block text-[#8ecdb7]">Name</label>
                        <input name="name" defaultValue={selectedUser.name} className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]" />
                      </div>
                      <div className="mb-2">
                        <label className="block text-[#8ecdb7]">Email</label>
                        <input name="email" defaultValue={selectedUser.email} className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]" />
                      </div>
                      <div className="mb-2">
                        <label className="block text-[#8ecdb7]">Role</label>
                        <select name="role" defaultValue={selectedUser.role} className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]">
                          {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="block text-[#8ecdb7]">Department</label>
                        <select name="department" defaultValue={selectedUser.department} className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]">
                          {departmentOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <button type="submit" disabled={userUpdateLoading} className="px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] mt-2">{userUpdateLoading ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                  )}
                  {/* User Activity */}
                  <div className="mt-6">
                    <h4 className="text-[#8ecdb7] font-semibold mb-2">User Activity</h4>
                    {userActivityLoading ? <div className="text-white">Loading...</div> : (
                      <ul className="list-disc pl-5 text-[#8ecdb7]">
                        {userActivity.length === 0 ? <li>No activity found.</li> : userActivity.map((c, i) => <li key={i}>{c.title || c._id}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create Admin Modal */}
            {createAdminOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-[#214a3c] rounded-lg p-8 w-full max-w-md relative">
                  <button onClick={() => setCreateAdminOpen(false)} className="absolute top-2 right-2 text-white">&times;</button>
                  <h3 className="text-white text-xl font-bold mb-4">Register New User</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setCreateAdminLoading(true);
                    setCreateAdminError(null);
                    setCreateAdminSuccess(null);
                    const name = e.target.name.value;
                    const email = e.target.email.value;
                    const password = e.target.password.value;
                    const department = e.target.department.value;
                    const role = e.target.role.value;
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ name, email, password, department, role })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setCreateAdminSuccess('User registered successfully!');
                        setCreateAdminOpen(false);
                        fetchUsers(1); // Refresh user list
                      } else {
                        setCreateAdminError(data.message || 'Failed to register user');
                      }
                    } catch {
                      setCreateAdminError('Failed to register user');
                    }
                    setCreateAdminLoading(false);
                  }}>
                    <div className="mb-2">
                      <label className="block text-[#8ecdb7]">Name</label>
                      <input name="name" required className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]" />
                    </div>
                    <div className="mb-2">
                      <label className="block text-[#8ecdb7]">Email</label>
                      <input name="email" type="email" required className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]" />
                    </div>
                    <div className="mb-2">
                      <label className="block text-[#8ecdb7]">Password</label>
                      <input name="password" type="password" required minLength={6} className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]" />
                    </div>
                    <div className="mb-2">
                      <label className="block text-[#8ecdb7]">Department</label>
                      <select name="department" required className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]">
                        {departmentOptions.filter(d => d.value !== 'All').map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="block text-[#8ecdb7]">Role</label>
                      <select name="role" required className="w-full px-2 py-1 rounded bg-[#10231c] text-white border border-[#8ecdb7]">
                        {adminRoleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    {createAdminError && <div className="text-red-400 mb-2">{createAdminError}</div>}
                    {createAdminSuccess && <div className="text-green-400 mb-2">{createAdminSuccess}</div>}
                    <button type="submit" disabled={createAdminLoading} className="px-4 py-2 bg-[#019863] text-white rounded hover:bg-[#017a4f] font-semibold w-full mt-2">{createAdminLoading ? 'Registering...' : 'Register User'}</button>
                  </form>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="bg-[#214a3c] rounded-lg p-8">
                <h2 className="text-white text-2xl font-bold mb-6">Admin Panel</h2>
                <p className="text-[#8ecdb7] text-lg mb-4">
                  Welcome to the Admin Panel. This is where you can manage various aspects of the CampusVoice system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {/* System Health Section with badge outside the card */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#10231c] rounded-lg p-6 border border-[#8ecdb7] col-span-1 flex-1 min-w-[350px] md:min-w-[400px]" style={{ width: '400px' }}>
                      <h3 className="text-white text-lg font-semibold mb-3">System Health</h3>
                      <p className="text-[#8ecdb7] text-sm mb-4">View current system health and resource usage.</p>
                      <button onClick={fetchHealth} disabled={loadingHealth} className="px-4 py-2 bg-[#019863] text-white rounded hover:bg-[#017a4f] transition-colors mb-2">
                        {loadingHealth ? 'Loading...' : 'Check Health'}
                      </button>
                    </div>
                    {showHealthMsg && health && health.message && (
                      <span className={`inline-block px-3 py-2 rounded text-base font-semibold ${health.success ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}
                        style={{ minWidth: '220px', textAlign: 'center' }}>
                        {health.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 