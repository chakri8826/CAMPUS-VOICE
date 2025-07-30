import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import { normalizeUserAvatar, getAvatarUrl } from '../utils/avatarUtils';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editForm, setEditForm] = useState({ department: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Function to fetch user badges
  const fetchUserBadges = async () => {
    if (isAdmin) return; // Don't fetch badges for admin users
    
    setBadgesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) throw new Error('Not authenticated. Please log in.');
      const userObj = JSON.parse(userStr);
      const userId = userObj.id || userObj._id;
      if (!userId) throw new Error('User ID not found.');
      
      const res = await fetch(`/api/users/${userId}/badges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch badges');
      setBadges(data.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load badges.' });
      setBadges([]);
    } finally {
      setBadgesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setToast(null);
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) throw new Error('Not authenticated. Please log in.');
        const userObj = JSON.parse(userStr);
        const userId = userObj.id || userObj._id;
        if (!userId) throw new Error('User ID not found.');
        
        // Check if user is admin
        setIsAdmin(userObj.role === 'admin');
        
        const res = await fetch(`/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Server error: Invalid response.');
        }
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        
        // Normalize avatar path
        const normalizedUser = normalizeUserAvatar(data.data.user);
        setUser(normalizedUser);
        setRecentComplaints(data.data.recentComplaints || []);
        setEditForm({
          department: normalizedUser.department || '',
          email: normalizedUser.email || ''
        });
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6c757d',
      uncommon: '#28a745',
      rare: '#007bff',
      epic: '#6f42c1',
      legendary: '#fd7e14'
    };
    return colors[rarity] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <Navbar />
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            {/* Main Content */}
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Profile</p>
              </div>

              {/* Profile Header */}
              <div className="p-4">
                <div className="bg-[#214a3c] rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#019863] rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={`http://localhost:5000/${user.avatar.replace(/\\/g, '/')}`}
                          alt="avatar" 
                          className="w-20 h-20 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className="text-white text-2xl font-bold" style={{ display: user.avatar ? 'none' : 'flex' }}>
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-white text-2xl font-bold mb-2">{user.name}</h2>
                      <p className="text-[#8ecdb7] text-sm mb-1">{user.email}</p>
                      {!isAdmin && (
                        <>
                          <p className="text-[#8ecdb7] text-sm">
                            {user.department && [
                              'Computer Science',
                              'Electrical Engineering',
                              'Mechanical Engineering',
                              'Civil Engineering',
                              'Chemical Engineering',
                              'Other'
                            ].includes(user.department)
                              ? user.department
                              : 'Other'}
                          </p>
                        </>
                      )}
                      {isAdmin && (
                        <p className="text-[#019863] text-sm font-medium bg-[#019863] bg-opacity-20 px-2 py-1 rounded inline-block">
                          ADMINISTRATOR
                        </p>
                      )}
                    </div>
                    {!isAdmin && (
                      <div className="text-right">
                        <div className="text-white text-3xl font-bold">{user.reputation}</div>
                        <div className="text-[#8ecdb7] text-sm">Reputation Points</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!isAdmin ? (
                    <>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.complaintsSubmitted}</div>
                        <div className="text-[#8ecdb7] text-sm">Complaints Submitted</div>
                      </div>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.complaintsResolved}</div>
                        <div className="text-[#8ecdb7] text-sm">Complaints Resolved</div>
                      </div>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.badges.length}</div>
                        <div className="text-[#8ecdb7] text-sm">Badges Earned</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.complaintsResolved || 0}</div>
                        <div className="text-[#8ecdb7] text-sm">Complaints Resolved</div>
                      </div>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.reputation || 0}</div>
                        <div className="text-[#8ecdb7] text-sm">Admin Points</div>
                      </div>
                      <div className="bg-[#214a3c] rounded-lg p-4">
                        <div className="text-white text-2xl font-bold">{user.badges?.length || 0}</div>
                        <div className="text-[#8ecdb7] text-sm">Achievements</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="p-4">
                <div className="flex gap-4 border-b border-[#214a3c]">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-white border-b-2 border-[#019863]'
                        : 'text-[#8ecdb7] hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab('badges');
                        fetchUserBadges();
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'badges'
                          ? 'text-white border-b-2 border-[#019863]'
                          : 'text-[#8ecdb7] hover:text-white'
                      }`}
                    >
                      Badges
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'settings'
                        ? 'text-white border-b-2 border-[#019863]'
                        : 'text-[#8ecdb7] hover:text-white'
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="bg-[#214a3c] rounded-lg p-4">
                      <h3 className="text-white text-lg font-bold mb-3">
                        {isAdmin ? 'Admin Overview' : 'Recent Activity'}
                      </h3>
                      <div className="space-y-2">
                        {isAdmin ? (
                          <div className="text-[#8ecdb7] text-sm">
                            <p>Welcome to the admin profile. Here you can manage your account settings and view your administrative statistics.</p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[#10231c] rounded-lg p-3">
                                <div className="text-white font-medium">Role</div>
                                <div className="text-[#019863] text-sm">Administrator</div>
                              </div>
                              <div className="bg-[#10231c] rounded-lg p-3">
                                <div className="text-white font-medium">Account Status</div>
                                <div className="text-[#019863] text-sm">Active</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          recentComplaints && recentComplaints.length > 0 ? (
                            recentComplaints.map((complaint) => (
                              <div 
                                key={complaint._id} 
                                className="flex items-center gap-3 text-[#8ecdb7] text-sm cursor-pointer hover:text-white transition-colors"
                                onClick={() => navigate(`/complaints/${complaint._id}`)}
                              >
                                <div className="w-2 h-2 bg-[#019863] rounded-full"></div>
                                <span className="flex-1">{complaint.title}</span>
                                <span className="text-xs">{complaint.status.replace('_', ' ').toUpperCase()}</span>
                                <span className="text-xs">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[#8ecdb7] text-sm">No recent activity found.</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'badges' && !isAdmin && (
                  <div className="space-y-4">
                    <div className="bg-[#214a3c] rounded-lg p-4">
                      <h3 className="text-white text-lg font-bold mb-4">Badges Collection</h3>
                      {badgesLoading ? (
                        <div className="text-[#8ecdb7] text-center py-8">Loading badges...</div>
                      ) : badges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {badges.map((badge) => (
                            <div key={badge._id || badge.id} className="bg-[#10231c] rounded-lg p-4 border border-[#019863]">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{badge.icon}</span>
                                <div>
                                  <h4 className="text-white font-bold">{badge.name}</h4>
                                  <p className="text-[#8ecdb7] text-xs capitalize">{badge.rarity}</p>
                                </div>
                              </div>
                              <p className="text-[#8ecdb7] text-sm">{badge.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[#8ecdb7] text-center py-8">
                          <p className="text-lg mb-2">No badges earned yet!</p>
                          <p className="text-sm">Submit complaints and engage with the community to earn badges.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="bg-[#214a3c] rounded-lg p-4">
                      <h3 className="text-white text-lg font-bold mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        {/* Avatar Upload */}
                        <div>
                          <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Avatar</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#019863] flex items-center justify-center text-2xl text-white font-bold overflow-hidden">
                              {user.avatar ? (
                                <img 
                                  src={`http://localhost:5000/${user.avatar.replace(/\\/g, '/')}`}
                                  alt="avatar" 
                                  className="w-16 h-16 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span style={{ display: user.avatar ? 'none' : 'flex' }}>
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (!avatarFile) {
                                  setToast({ type: 'error', message: 'Please select an image.' });
                                  return;
                                }
                                setAvatarUploading(true);
                                setToast(null);
                                try {
                                  const token = localStorage.getItem('token');
                                  const formData = new FormData();
                                  formData.append('file', avatarFile);
                                  console.log('avatarFile:', avatarFile);
                                  console.log('formData entries:', [...formData.entries()]);
                                  const res = await fetch('/api/users/avatar', {
                                    method: 'PUT',
                                    headers: { Authorization: `Bearer ${token}` },
                                    body: formData
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.message || 'Failed to update avatar');
                                  // Normalize the avatar path
                                  const normalizedAvatar = data.data.avatar?.replace(/\\/g, '/');
                                  setUser(u => ({ ...u, avatar: normalizedAvatar }));
                                  const currentUserData = JSON.parse(localStorage.getItem('user'));
                                  localStorage.setItem('user', JSON.stringify({ ...currentUserData, avatar: normalizedAvatar }));
                                  setToast({ type: 'success', message: 'Avatar updated successfully!' });
                                  setAvatarFile(null);
                                } catch (err) {
                                  setToast({ type: 'error', message: err.message || 'Failed to update avatar.' });
                                } finally {
                                  setAvatarUploading(false);
                                }
                              }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => setAvatarFile(e.target.files[0])}
                                className="hidden"
                                id="avatar-upload"
                              />
                              <label htmlFor="avatar-upload" className="px-3 py-2 bg-[#019863] text-white rounded-lg cursor-pointer hover:bg-[#017a4f] transition-colors">
                                {avatarFile ? avatarFile.name : 'Choose File'}
                              </label>
                              <button
                                type="submit"
                                className="ml-2 px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50"
                                disabled={avatarUploading || !avatarFile}
                              >
                                {avatarUploading ? 'Uploading...' : 'Upload'}
                              </button>
                            </form>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Email</label>
                          <input
                            type="email"
                            value={editForm.email || user.email}
                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                          />
                        </div>
                        {!isAdmin && (
                          <>
                            <div>
                              <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Department</label>
                              <select
                                value={editForm.department || user.department}
                                onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                              >
                                <option value="">Select Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Chemical Engineering">Chemical Engineering</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </>
                        )}
                        {isAdmin && (
                          <div>
                            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Role</label>
                            <input
                              type="text"
                              value="Administrator"
                              readOnly
                              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                            />
                          </div>
                        )}
                        {/* Password Change */}
                        <div>
                          <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Change Password</label>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setPasswordSaving(true);
                              setToast(null);
                              try {
                                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                  throw new Error('New passwords do not match.');
                                }
                                const token = localStorage.getItem('token');
                                const res = await fetch('/api/auth/updatepassword', {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    currentPassword: passwordForm.currentPassword,
                                    newPassword: passwordForm.newPassword
                                  })
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.message || 'Failed to update password');
                                setToast({ type: 'success', message: 'Password updated successfully!' });
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              } catch (err) {
                                setToast({ type: 'error', message: err.message || 'Failed to update password.' });
                              } finally {
                                setPasswordSaving(false);
                              }
                            }}
                            className="space-y-2"
                          >
                            <input
                              type="password"
                              placeholder="Current Password"
                              value={passwordForm.currentPassword}
                              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                              required
                            />
                            <input
                              type="password"
                              placeholder="New Password"
                              value={passwordForm.newPassword}
                              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                              required
                            />
                            <input
                              type="password"
                              placeholder="Confirm New Password"
                              value={passwordForm.confirmPassword}
                              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white"
                              required
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50"
                              disabled={passwordSaving}
                            >
                              {passwordSaving ? 'Saving...' : 'Change Password'}
                            </button>
                          </form>
                        </div>
                        <div className="flex gap-4">
                          <button
                            className="px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50"
                            disabled={saving}
                            onClick={async (e) => {
                              e.preventDefault();
                              setSaving(true);
                              setToast(null);
                              try {
                                const token = localStorage.getItem('token');
                                const updateData = {};
                                
                                // Include email if it's different from current
                                if (editForm.email && editForm.email !== user.email) {
                                  updateData.email = editForm.email;
                                }
                                
                                // Only include fields that are editable for the user type
                                if (!isAdmin) {
                                  if (editForm.department !== undefined) updateData.department = editForm.department;
                                }
                                
                                const res = await fetch('/api/auth/updatedetails', {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: JSON.stringify(updateData)
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.message || 'Failed to update profile');
                                
                                // Update local state
                                setUser(u => ({ ...u, ...updateData }));
                                
                                // Update localStorage
                                const currentUserData = JSON.parse(localStorage.getItem('user'));
                                localStorage.setItem('user', JSON.stringify({ ...currentUserData, ...updateData }));
                                
                                setToast({ type: 'success', message: 'Profile updated successfully!' });
                              } catch (err) {
                                setToast({ type: 'error', message: err.message || 'Failed to update profile.' });
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      

  );
};

export default ProfilePage;     