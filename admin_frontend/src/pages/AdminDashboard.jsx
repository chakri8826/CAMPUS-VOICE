import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import Modal from '../components/Modal';
import AdminNavbar from '../components/AdminNavbar';
import { useSelector } from 'react-redux';

const categories = [
  'All', 'Infrastructure', 'Academic', 'Hostel', 'Transportation', 'Food', 'Security', 'Technology', 'Sports', 'Library', 'Other'
];
const statuses = ['All', 'pending', 'in_progress', 'resolved', 'rejected', 'closed'];
const priorities = ['All', 'low', 'medium', 'high', 'urgent'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-200 text-gray-700'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, complaintId: null, type: 'reply' });
  const [reply, setReply] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());

  const toggleCommentsExpansion = (complaintId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId);
    } else {
      newExpanded.add(complaintId);
    }
    setExpandedComments(newExpanded);
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

 
  const fetchComplaints = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(category !== 'All' && { category }),
        ...(status !== 'All' && { status }),
        ...(priority !== 'All' && { priority }),
        ...(search && { search })
      });

      const res = await apiFetch(`/api/admin/complaints?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        setComplaints(data.data);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching complaints:', data.message);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch function
  const debouncedFetch = useCallback((page = 1) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchComplaints(page);
    }, 500); // 500ms delay
    
    setDebounceTimer(timer);
  }, [category, status, priority, search, debounceTimer]);

  // Update complaint status
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
    const res = await apiFetch(`/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh complaints list
        fetchComplaints(pagination.current);
        fetchStats(); // Refresh stats
      } else {
        const data = await res.json();
        alert(data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Add admin reply
  const handleReply = async () => {
    try {
    const res = await apiFetch(`/api/admin/complaints/${modal.complaintId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: reply })
      });

      if (res.ok) {
        setModal({ open: false, complaintId: null, type: 'reply' });
        setReply('');
        fetchComplaints(pagination.current); // Refresh complaints list
      } else {
        const data = await res.json();
        alert(data.message || 'Error adding reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error adding reply');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchComplaints(1);
  }, []);

  useEffect(() => {
    debouncedFetch(1);
  }, [category, status, priority, search]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      {/* Admin Navbar */}
      <AdminNavbar />
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      {/* Main Content */}
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-2 sm:px-4 md:px-16 flex flex-1 justify-center py-4 sm:py-6 md:py-8"> {/* Responsive padding */}
          <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4"> {/* Responsive padding */}
              <p className="text-white tracking-light text-xl sm:text-2xl md:text-[32px] font-bold leading-tight min-w-0 sm:min-w-72 break-words">Admin Dashboard</p> {/* Responsive text size and word break */}
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="p-2 sm:p-4"> {/* Responsive padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"> {/* Responsive grid */}
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                    <div className="text-[#8ecdb7] text-xs sm:text-sm font-medium">Total Complaints</div> {/* Responsive text size */}
                    <div className="text-white text-xl sm:text-2xl font-bold">{stats.overview.totalComplaints}</div> {/* Responsive text size */}
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                    <div className="text-[#8ecdb7] text-xs sm:text-sm font-medium">Pending</div> {/* Responsive text size */}
                    <div className="text-white text-xl sm:text-2xl font-bold">{stats.overview.pendingComplaints}</div> {/* Responsive text size */}
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                    <div className="text-[#8ecdb7] text-xs sm:text-sm font-medium">Total Users</div> {/* Responsive text size */}
                    <div className="text-white text-xl sm:text-2xl font-bold">{stats.overview.totalUsers}</div> {/* Responsive text size */}
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                    <div className="text-[#8ecdb7] text-xs sm:text-sm font-medium">Total Comments</div> {/* Responsive text size */}
                    <div className="text-white text-xl sm:text-2xl font-bold">{stats.overview.totalComments}</div> {/* Responsive text size */}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="p-2 sm:p-4"> {/* Responsive padding */}
              <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"> {/* Responsive grid */}
                  <div>
                    <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">Category</label> {/* Responsive text size */}
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7] text-sm sm:text-base" /* Responsive text size */
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">Status</label> {/* Responsive text size */}
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7] text-sm sm:text-base" /* Responsive text size */
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">Priority</label> {/* Responsive text size */}
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7] text-sm sm:text-base" /* Responsive text size */
                    >
                      {priorities.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">Search</label> {/* Responsive text size */}
                    <input 
                      type="text" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search complaints..."
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white placeholder-[#8ecdb7] focus:outline-none focus:ring-2 focus:ring-[#8ecdb7] text-sm sm:text-base" /* Responsive text size */
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => fetchComplaints(pagination.current)}
                      className="w-full px-3 sm:px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors font-medium text-sm sm:text-base" /* Responsive padding and text size */
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="p-2 sm:p-4"> {/* Responsive padding */}
              <h2 className="text-white text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Complaints Management</h2> {/* Responsive text size */}
              
              {loading ? (
                <div className="text-[#8ecdb7] text-center py-8">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="text-[#8ecdb7] text-center py-8">No complaints found.</div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint._id} className="bg-[#214a3c] rounded-lg p-3 sm:p-4"> {/* Responsive padding */}
                      <div className="flex flex-col gap-3 sm:gap-4"> {/* Responsive gap */}
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4"> {/* Responsive flex direction and gap */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2"> {/* Responsive flex wrap */}
                              <h3 className="text-white text-base sm:text-lg font-semibold break-words">{complaint.title}</h3> {/* Responsive text size and word break */}
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[complaint.status]}`}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorityColors[complaint.priority]}`}>
                                {complaint.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[#8ecdb7] text-xs sm:text-sm mb-2 break-words">{complaint.description}</p> {/* Responsive text size and word break */}
                            <div className="text-[#8ecdb7] text-xs flex flex-wrap gap-1 sm:gap-2"> {/* Responsive flex wrap and gap */}
                              <span>Category: {complaint.category}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>Submitted: {formatDate(complaint.createdAt)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>By: {complaint.submittedBy?.name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 lg:items-end">
                            <select 
                              value={complaint.status}
                              onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                              className="px-2 sm:px-3 py-1 bg-[#10231c] border border-[#8ecdb7] rounded text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]" /* Responsive padding and text size */
                            >
                              {statuses.filter(s => s !== 'All').map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => setModal({ open: true, complaintId: complaint._id, type: 'reply' })}
                              className="px-3 sm:px-4 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] transition-colors text-xs sm:text-sm font-medium" /* Responsive padding and text size */
                            >
                              Add Reply
                            </button>
                          </div>
                        </div>

                        {/* Attachments */}
                        {complaint.attachments && complaint.attachments.length > 0 && (
                          <div className="border-t border-[#10231c] pt-3">
                            <h4 className="text-white text-xs sm:text-sm font-medium mb-2">Attachments:</h4> {/* Responsive text size */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"> {/* Responsive grid */}
                              {complaint.attachments.map((attachment, index) => {
                                const isImage = attachment.mimetype && attachment.mimetype.startsWith('image/');
                                
                                // Use Cloudinary URL if available, otherwise fallback to local file path
                                let fileUrl = attachment.url || (() => {
                                  if (attachment.path) {
                                    const backendUrl = 'http://localhost:5000';
                                    let localPath = attachment.path.replace(/\\/g, '/');
                                    if (!localPath.startsWith('/uploads')) {
                                      const uploadsIndex = localPath.indexOf('uploads');
                                      if (uploadsIndex !== -1) {
                                        localPath = '/' + localPath.slice(uploadsIndex);
                                      }
                                    }
                                    return backendUrl + localPath;
                                  }
                                  return null;
                                })();
                                
                                if (!fileUrl) return null; // Skip if no valid source
                                
                                return (
                                  <div key={index} className="bg-[#10231c] rounded p-3">
                                    {isImage ? (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <img
                                          src={fileUrl}
                                          alt={attachment.originalName}
                                          className="w-full h-32 object-cover rounded border border-[#214a3c]"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                          }}
                                        />
                                        <div className="text-[#8ecdb7] text-xs mt-1 text-center" style={{ display: 'none' }}>
                                          {attachment.originalName}
                                        </div>
                                      </a>
                                    ) : (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 bg-[#214a3c] rounded border border-[#019863] hover:bg-[#019863] hover:text-white transition-colors"
                                      >
                                        <div className="text-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-2">
                                            <path d="M224,152a8,8,0,0,1-8,8H168v48a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V160H40a8,8,0,0,1,0-16H96V96a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v48h48A8,8,0,0,1,224,152Z"></path>
                                          </svg>
                                          <div className="text-sm font-medium">{attachment.originalName}</div>
                                          <div className="text-xs">{(attachment.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4 text-xs border-t border-[#10231c] pt-3">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                              <path d="M224,120H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8,8,8,0,0,0,8,8H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8A8,8,0,0,0,224,120Z"></path>
                            </svg>
                            <span className="text-[#8ecdb7]">{complaint.likes || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-red-400">
                              <path d="M32,136H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8,8,8,0,0,0-8-8H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8A8,8,0,0,0,32,136Z"></path>
                            </svg>
                            <span className="text-[#8ecdb7]">{complaint.dislikes || 0} dislikes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-[#8ecdb7]">
                              <path d="M232,64H184V56a24,24,0,0,0-24-24H96A24,24,0,0,0,72,56v8H24A16,16,0,0,0,8,80V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V80A16,16,0,0,0,232,64ZM88,56a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8v8H88Zm144,136H24V80H232V192Z"></path>
                            </svg>
                            <span 
                              className="text-[#8ecdb7] cursor-pointer hover:text-[#019863] transition-colors"
                              onClick={() => toggleCommentsExpansion(complaint._id)}
                            >
                              {complaint.comments?.length || 0} comments
                            </span>
                          </div>
                          
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(complaint._id) && (
                          <div className="border-t border-[#10231c] pt-4">
                            <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                                <path d="M232,64H184V56a24,24,0,0,0-24-24H96A24,24,0,0,0,72,56v8H24A16,16,0,0,0,8,80V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V80A16,16,0,0,0,232,64ZM88,56a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8v8H88Zm144,136H24V80H232V192Z"></path>
                              </svg>
                              Comments ({complaint.comments?.length || 0})
                            </h4>
                            {complaint.comments && complaint.comments.length > 0 ? (
                              <div className="space-y-3">
                                {complaint.comments.map((comment) => (
                                  <div key={comment._id} className={`bg-[#10231c] rounded p-3 ${comment.isOfficial ? 'border-l-4 border-[#019863]' : ''}`}>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-white text-sm font-medium">
                                            {comment.author?.name || comment.author?.username || 'Unknown User'}
                                          </span>
                                          {comment.isOfficial && (
                                            <span className="px-2 py-1 bg-[#019863] text-white text-xs rounded">Official</span>
                                          )}
                                          <span className="text-[#8ecdb7] text-xs">
                                            {formatDate(comment.createdAt)}
                                          </span>
                                        </div>
                                        <div className="text-[#8ecdb7] text-sm mb-2">{comment.content}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[#8ecdb7] text-sm text-center py-4 bg-[#10231c] rounded">
                                No comments yet.
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => fetchComplaints(page)}
                        className={`px-3 py-1 rounded ${
                          page === pagination.current
                            ? 'bg-[#019863] text-white'
                            : 'bg-[#214a3c] text-[#8ecdb7] hover:bg-[#019863] hover:text-white'
                        } transition-colors`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, complaintId: null, type: 'reply' })}>
        <div className="p-6 bg-[#214a3c] rounded-lg max-w-md w-full">
          <h3 className="text-white text-lg font-bold mb-4">Add Admin Reply</h3>
          <textarea 
            value={reply} 
            onChange={(e) => setReply(e.target.value)} 
            rows={4} 
            className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded text-white placeholder-[#8ecdb7] focus:outline-none focus:ring-2 focus:ring-[#8ecdb7] mb-4"
            placeholder="Type your reply..."
          />
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setModal({ open: false, complaintId: null, type: 'reply' })}
              className="px-4 py-2 bg-[#10231c] text-[#8ecdb7] rounded hover:bg-[#8ecdb7] hover:text-[#10231c] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleReply}
              className="px-4 py-2 bg-[#019863] text-white rounded hover:bg-[#017a4f] transition-colors"
            >
              Send Reply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 