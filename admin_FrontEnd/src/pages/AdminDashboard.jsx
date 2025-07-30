import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import AdminNavbar from '../components/AdminNavbar';

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
  const navigate = useNavigate();
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
  const [expandedComplaints, setExpandedComplaints] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  // Toggle complaint expansion
  const toggleComplaintExpansion = (complaintId) => {
    const newExpanded = new Set(expandedComplaints);
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId);
    } else {
      newExpanded.add(complaintId);
    }
    setExpandedComplaints(newExpanded);
  };

  const toggleCommentsExpansion = (complaintId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId);
    } else {
      newExpanded.add(complaintId);
    }
    setExpandedComments(newExpanded);
  };

  const toggleRepliesExpansion = (commentId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/dashboard', {
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

  // Fetch complaints with enhanced data
  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(category !== 'All' && { category }),
        ...(status !== 'All' && { status }),
        ...(priority !== 'All' && { priority }),
        ...(search && { search })
      });

      const res = await fetch(`/api/admin/complaints?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log('Complaints data:', data.data);
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
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/complaints/${complaintId}/status`, {
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
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/complaints/${modal.complaintId}/reply`, {
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
    fetchComplaints();
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
        <div className="px-4 md:px-16 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Admin Dashboard</p>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#214a3c] rounded-lg p-4">
                    <div className="text-[#8ecdb7] text-sm font-medium">Total Complaints</div>
                    <div className="text-white text-2xl font-bold">{stats.overview.totalComplaints}</div>
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-4">
                    <div className="text-[#8ecdb7] text-sm font-medium">Pending</div>
                    <div className="text-white text-2xl font-bold">{stats.overview.pendingComplaints}</div>
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-4">
                    <div className="text-[#8ecdb7] text-sm font-medium">Total Users</div>
                    <div className="text-white text-2xl font-bold">{stats.overview.totalUsers}</div>
                  </div>
                  <div className="bg-[#214a3c] rounded-lg p-4">
                    <div className="text-[#8ecdb7] text-sm font-medium">Urgent Issues</div>
                    <div className="text-white text-2xl font-bold">{stats.overview.urgentComplaints}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="p-4">
              <div className="bg-[#214a3c] rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]"
                    >
                      {priorities.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Search</label>
                    <input 
                      type="text" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search complaints..."
                      className="w-full px-3 py-2 bg-[#10231c] border border-[#8ecdb7] rounded-lg text-white placeholder-[#8ecdb7] focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => fetchComplaints(1)}
                      className="w-full px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="p-4">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Complaints Management</h2>
              
              {loading ? (
                <div className="text-[#8ecdb7] text-center py-8">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="text-[#8ecdb7] text-center py-8">No complaints found.</div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint._id} className="bg-[#214a3c] rounded-lg p-4">
                      <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white text-lg font-semibold">{complaint.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[complaint.status]}`}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorityColors[complaint.priority]}`}>
                                {complaint.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[#8ecdb7] text-sm mb-2">{complaint.description}</p>
                            <div className="text-[#8ecdb7] text-xs">
                              <span>Category: {complaint.category}</span>
                              <span className="mx-2">•</span>
                              <span>Submitted: {formatDate(complaint.createdAt)}</span>
                              <span className="mx-2">•</span>
                              <span>By: {complaint.submittedBy?.name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 lg:items-end">
                            <select 
                              value={complaint.status}
                              onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                              className="px-3 py-1 bg-[#10231c] border border-[#8ecdb7] rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8ecdb7]"
                            >
                              {statuses.filter(s => s !== 'All').map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => setModal({ open: true, complaintId: complaint._id, type: 'reply' })}
                              className="px-4 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] transition-colors text-sm font-medium"
                            >
                              Add Reply
                            </button>
                          </div>
                        </div>

                        {/* Attachments */}
                        {complaint.attachments && complaint.attachments.length > 0 && (
                          <div className="border-t border-[#10231c] pt-3">
                            <h4 className="text-white text-sm font-medium mb-2">Attachments:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {complaint.attachments.map((attachment, index) => {
                                const isImage = attachment.mimetype && attachment.mimetype.startsWith('image/');
                                const backendUrl = 'http://localhost:5000';
                                let fileUrl = attachment.path.replace(/\\/g, '/');
                                if (!fileUrl.startsWith('/uploads')) {
                                  const uploadsIndex = fileUrl.indexOf('uploads');
                                  if (uploadsIndex !== -1) {
                                    fileUrl = '/' + fileUrl.slice(uploadsIndex);
                                  }
                                }
                                fileUrl = backendUrl + fileUrl;
                                
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
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-[#8ecdb7]">
                              <path d="M208,40H48A16,16,0,0,0,32,56V114.8c0,92.36,78.1,123,93.76,128.18a14.48,14.48,0,0,0,4.48,0C145.9,237.78,224,207.16,224,114.8V56A16,16,0,0,0,208,40ZM128,224c-79.4-51.35-96-87.43-96-109.2V56H224v58.8C224,136.57,207.4,172.65,128,224Z"></path>
                            </svg>
                            <span className="text-[#8ecdb7]">{complaint.views || 0} views</span>
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
                            {(() => {
                              console.log('Comments data for complaint:', complaint._id, complaint.comments); // Debug log
                              return null;
                            })()}
                            {complaint.comments && complaint.comments.length > 0 ? (
                              <div className="space-y-3">
                                {complaint.comments.map((comment) => (
                                  <div key={comment._id} className={`bg-[#10231c] rounded p-3 ${comment.isAdminReply ? 'border-l-4 border-[#019863]' : ''}`}>
                                    {(() => {
                                      console.log('Comment data:', comment); // Debug log
                                      return null;
                                    })()}
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-white text-sm font-medium">
                                            {comment.author?.name || comment.author?.username || 'Unknown User'}
                                          </span>
                                          {comment.isAdminReply && (
                                            <span className="px-2 py-1 bg-[#019863] text-white text-xs rounded">Admin</span>
                                          )}
                                          <span className="text-[#8ecdb7] text-xs">
                                            {formatDate(comment.createdAt)}
                                          </span>
                                        </div>
                                        <div className="text-[#8ecdb7] text-sm mb-2">{comment.content}</div>
                                        
                                        {/* Comment Votes */}
                                        {comment.votes && (
                                          <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                                                <path d="M224,120H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8,8,8,0,0,0,8,8H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8A8,8,0,0,0,224,120Z"></path>
                                              </svg>
                                              <span className="text-[#8ecdb7]">{comment.votes.likes || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="text-red-400">
                                                <path d="M32,136H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8,8,8,0,0,0-8-8H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8A8,8,0,0,0,32,136Z"></path>
                                              </svg>
                                              <span className="text-[#8ecdb7]">{comment.votes.dislikes || 0}</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Show Replies Button */}
                                        {comment.replies && comment.replies.length > 0 && (
                                          <button
                                            className="mt-2 text-[#8ecdb7] text-xs hover:text-white transition-colors underline"
                                            onClick={() => toggleRepliesExpansion(comment._id)}
                                          >
                                            {expandedReplies.has(comment._id) ? `Hide Replies (${comment.replies.length})` : `Show Replies (${comment.replies.length})`}
                                          </button>
                                        )}
                                        
                                        {/* Replies Section */}
                                        {expandedReplies.has(comment._id) && comment.replies && comment.replies.length > 0 && (
                                          <div className="mt-3 ml-4 space-y-2 border-l-2 border-[#214a3c] pl-3">
                                            {comment.replies.map((reply) => (
                                              <div key={reply._id} className="bg-[#214a3c] rounded p-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-white text-xs font-medium">
                                                    {reply.author?.name || reply.author?.username || 'Unknown User'}
                                                  </span>
                                                  {reply.isAdminReply && (
                                                    <span className="px-1 py-0.5 bg-[#019863] text-white text-xs rounded text-[10px]">Admin</span>
                                                  )}
                                                  <span className="text-[#8ecdb7] text-xs">
                                                    {formatDate(reply.createdAt)}
                                                  </span>
                                                </div>
                                                <div className="text-[#8ecdb7] text-xs">{reply.content}</div>
                                                
                                                {/* Reply Votes */}
                                                {reply.votes && (
                                                  <div className="flex items-center gap-3 text-xs mt-1">
                                                    <div className="flex items-center gap-1">
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                                                        <path d="M224,120H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8,8,8,0,0,0,8,8H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8A8,8,0,0,0,224,120Z"></path>
                                                      </svg>
                                                      <span className="text-[#8ecdb7]">{reply.votes.likes || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 256 256" className="text-red-400">
                                                        <path d="M32,136H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8,8,8,0,0,0-8-8H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8A8,8,0,0,0,32,136Z"></path>
                                                      </svg>
                                                      <span className="text-[#8ecdb7]">{reply.votes.dislikes || 0}</span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
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

                        {/* Expanded Details */}
                        {expandedComplaints.has(complaint._id) && (
                          <div className="border-t border-[#10231c] pt-4 space-y-4">
                            {/* Comments Section */}
                            <div>
                              <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                                  <path d="M232,64H184V56a24,24,0,0,0-24-24H96A24,24,0,0,0,72,56v8H24A16,16,0,0,0,8,80V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V80A16,16,0,0,0,232,64ZM88,56a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8v8H88Zm144,136H24V80H232V192Z"></path>
                                </svg>
                                Comments ({complaint.comments?.length || 0})
                              </h4>
                              {complaint.comments && complaint.comments.length > 0 ? (
                                <div className="space-y-3">
                                  {complaint.comments.map((comment) => (
                                    <div key={comment._id} className={`bg-[#10231c] rounded p-3 ${comment.isAdminReply ? 'border-l-4 border-[#019863]' : ''}`}>
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white text-sm font-medium">
                                              {comment.author?.name || comment.author?.username || 'Unknown User'}
                                            </span>
                                            {comment.isAdminReply && (
                                              <span className="px-2 py-1 bg-[#019863] text-white text-xs rounded">Admin</span>
                                            )}
                                            <span className="text-[#8ecdb7] text-xs">
                                              {formatDate(comment.createdAt)}
                                            </span>
                                          </div>
                                          <div className="text-[#8ecdb7] text-sm">{comment.content}</div>
                                          
                                          {/* Comment Votes */}
                                          {comment.votes && (
                                            <div className="flex items-center gap-3 text-xs">
                                              <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="text-[#019863]">
                                                  <path d="M224,120H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8,8,8,0,0,0,8,8H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8A8,8,0,0,0,224,120Z"></path>
                                                </svg>
                                                <span className="text-[#8ecdb7]">{comment.votes.likes || 0}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="text-red-400">
                                                  <path d="M32,136H96v64a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V136h64a8,8,0,0,0,8-8,8,8,0,0,0-8-8H160V56a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v64H32a8,8,0,0,0-8,8A8,8,0,0,0,32,136Z"></path>
                                                </svg>
                                                <span className="text-[#8ecdb7]">{comment.votes.dislikes || 0}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[#8ecdb7] text-sm text-center py-4 bg-[#10231c] rounded">
                                  No comments yet. Be the first to comment!
                                </div>
                              )}
                            </div>
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