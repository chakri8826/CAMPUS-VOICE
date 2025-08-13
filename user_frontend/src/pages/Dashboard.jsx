import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ComplaintCard from '../components/ComplaintCard';

import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api.js';

const categories = [
  'Infrastructure', 'Academic', 'Hostel', 'Transportation', 'Food', 'Security', 'Technology', 'Sports', 'Library', 'Other'
];
const priorities = ['low', 'medium', 'high', 'urgent'];

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const userName = user?.name || 'Guest';
  
  // Debug logging for user authentication (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard user state:', { 
      user, 
      token, 
      isAuthenticated: !!token,
      userId: user?.id || user?._id
    });
  }
 
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    attachments: null
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    attachments: null
  });
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch recent complaints from backend
  const [recentComplaints, setRecentComplaints] = useState([]);
  // Track votes locally for instant UI feedback
  const [voteLoading, setVoteLoading] = useState({}); // { [complaintId]: boolean }
  const [voteCounts, setVoteCounts] = useState({}); // { [complaintId]: { likes, dislikes } }
  const [userVotes, setUserVotes] = useState({}); // { [complaintId]: 'like' | 'dislike' | null }
  const [openComments, setOpenComments] = useState({});
  
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await apiFetch('/api/complaints?limit=5');
        console.log(res);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Server error: Invalid response.');
        }
        if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');
        setRecentComplaints(data.data || []);
        // Fetch vote counts for each complaint
        (data.data || []).forEach(async (complaint) => {
          try {
            const res = await apiFetch(`/api/votes/complaint/${complaint._id}`);
            const result = await res.json();
            if (result.success) {
              setVoteCounts(prev => ({ 
                ...prev, 
                [complaint._id]: result.data || { likes: 0, dislikes: 0 } 
              }));
            }
          } catch (error) {
            // handle error
          }
        });
      } catch (err) {
        setRecentComplaints([]);
      }
    };
    fetchComplaints();
  }, []);

  // Complaint form logic (from ComplaintSubmissionPage)
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleEditChange = e => {
    const { name, value, files } = e.target;
    setEditForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      if (!token) throw new Error('You must be logged in to submit a complaint.');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      if (form.attachments) formData.append('attachments', form.attachments);
      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error('Server error: Invalid response.');
      }
      if (!res.ok) throw new Error(data.message || 'Submission failed.');
      setToast({ type: 'success', message: 'Complaint submitted!' });
      setForm({ title: '', description: '', category: categories[0], priority: priorities[1], attachments: null });
      setShowModal(false);
      // Refresh complaints
      window.location.reload();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditLoading(true);
    setToast(null);
    try {
      if (!token) throw new Error('You must be logged in to edit a complaint.');
      if (!editingComplaint) throw new Error('No complaint selected for editing.');
      
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      formData.append('priority', editForm.priority);
      if (editForm.attachments) formData.append('attachments', editForm.attachments);
      
      const res = await apiFetch(`/api/complaints/${editingComplaint._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error('Server error: Invalid response.');
      }
      
      if (!res.ok) throw new Error(data.message || 'Update failed.');
      
      setToast({ type: 'success', message: 'Complaint updated successfully!' });
      setShowEditModal(false);
      setEditingComplaint(null);
      setEditForm({ title: '', description: '', category: categories[0], priority: priorities[1], attachments: null });
      
      // Update the complaint in the local state
      setRecentComplaints(prev => 
        prev.map(comp => 
          comp._id === editingComplaint._id 
            ? { ...comp, ...editForm, title: editForm.title, description: editForm.description, category: editForm.category, priority: editForm.priority }
            : comp
        )
      );
    } catch (err) {
      console.error('Update complaint error:', err);
      setToast({ type: 'error', message: err.message || 'Update failed. Try again.' });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit complaint
  const handleEditComplaint = (complaint) => {
    if (!complaint || !complaint._id) {
      setToast({ type: 'error', message: 'Invalid complaint data' });
      return;
    }
    
    setEditingComplaint(complaint);
    setEditForm({
      title: complaint.title || '',
      description: complaint.description || '',
      category: complaint.category || categories[0],
      priority: complaint.priority || priorities[1],
      attachments: null
    });
    setShowEditModal(true);
  };

  // Handle delete complaint
  const handleDeleteComplaint = async (complaintId) => {
    try {
      if (!complaintId) {
        setToast({ type: 'error', message: 'Invalid complaint ID' });
        return;
      }
      
      if (!token) throw new Error('You must be logged in to delete a complaint.');
      
      const res = await apiFetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed.');
      
      setToast({ type: 'success', message: 'Complaint deleted successfully!' });
      
      // Remove the complaint from local state
      setRecentComplaints(prev => prev.filter(comp => comp._id !== complaintId));
    } catch (err) {
      console.error('Delete complaint error:', err);
      setToast({ type: 'error', message: err.message || 'Delete failed. Try again.' });
    }
  };

  // Voting handler
  const handleVote = async (complaintId, voteType) => {
    setVoteLoading(prev => ({ ...prev, [complaintId]: true }));
    try {
      if (!token) throw new Error('You must be logged in to vote.');
      const res = await apiFetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetType: 'complaint', targetId: complaintId, voteType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Vote failed.');
      setVoteCounts(prev => ({ 
        ...prev, 
        [complaintId]: { 
          likes: data.data.likes || 0, 
          dislikes: data.data.dislikes || 0 
        } 
      }));
      setUserVotes(prev => ({ ...prev, [complaintId]: voteType }));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Vote failed.' });
    } finally {
      setVoteLoading(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <Navbar onOpenSubmitModal={() => setShowModal(true)} />
      
      {/* Modal for complaint submission */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="bg-[#18382c] rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-lg space-y-4 sm:space-y-6 z-10 border border-[#214a3c]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-2">Submit a Complaint</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Enter complaint title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Describe your issue" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Attachment (optional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label htmlFor="file-upload" className="inline-block px-4 py-2 bg-[#019863] text-white font-semibold rounded cursor-pointer hover:bg-[#017a4f] transition">
                Choose File
              </label>
              <input
                id="file-upload"
                name="attachments"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-[#8ecdb7] text-sm truncate max-w-[200px]">
                {form.attachments ? form.attachments.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </Modal>

      {/* Modal for editing complaint */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEditSubmit} className="bg-[#18382c] rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-lg space-y-4 sm:space-y-6 z-10 border border-[#214a3c]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-2">Edit Complaint</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Title</label>
            <input name="title" value={editForm.title} onChange={handleEditChange} required className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Enter complaint title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Description</label>
            <textarea name="description" value={editForm.description} onChange={handleEditChange} required rows={3} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Describe your issue" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Category</label>
              <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Priority</label>
              <select name="priority" value={editForm.priority} onChange={handleEditChange} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Attachment (optional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label htmlFor="edit-file-upload" className="inline-block px-4 py-2 bg-[#019863] text-white font-semibold rounded cursor-pointer hover:bg-[#017a4f] transition">
                Choose File
              </label>
              <input
                id="edit-file-upload"
                name="attachments"
                type="file"
                accept="image/*"
                onChange={handleEditChange}
                className="hidden"
              />
              <span className="text-[#8ecdb7] text-sm truncate max-w-[200px]">
                {editForm.attachments ? editForm.attachments.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <button type="submit" disabled={editLoading} className="w-full py-2 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition">
            {editLoading ? 'Updating...' : 'Update Complaint'}
          </button>
        </form>
      </Modal>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-6 md:px-16 flex flex-1 justify-center py-4 sm:py-6 md:py-8">
          {/* Main Content - now full width */}
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4">
              <p className="text-white tracking-light text-xl sm:text-2xl md:text-[32px] font-bold leading-tight min-w-0 sm:min-w-72 break-words">Welcome, {userName}</p>
            </div>
            {/* Hero Section */}
            <div className="p-2 sm:p-4">
              <div
                className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[80px] sm:pt-[100px] md:pt-[132px]"
                style={{
                  backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("/Complaints.png")'
                }}
              >
                <div className="flex w-full items-end justify-between gap-2 sm:gap-4 p-2 sm:p-4">
                  <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                    <p className="text-gray-700 tracking-light text-lg sm:text-xl md:text-2xl font-bold leading-tight max-w-[440px] break-words">Have a concern? Share it with us.</p>
                    <p className="text-gray-700 text-sm sm:text-base font-medium leading-normal">Your feedback helps us improve the campus experience for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Complaints */}
            <h2 className="text-white text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-3 pt-5">Recent Complaints</h2>
            {recentComplaints.length === 0 && (
              <div className="text-[#8ecdb7] px-2 sm:px-4 pb-3">No recent complaints found.</div>
            )}
            <div className="grid gap-4 sm:gap-6 px-2">
              {recentComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  voteCounts={voteCounts}
                  userVotes={userVotes}
                  voteLoading={voteLoading}
                  handleVote={handleVote}
                  openComments={openComments}
                  setOpenComments={setOpenComments}
                  onEdit={handleEditComplaint}
                  onDelete={handleDeleteComplaint}
                /> 
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;