import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { FaRegThumbsUp, FaRegThumbsDown, FaRegComment, FaThumbsUp, FaThumbsDown, FaRegImage } from 'react-icons/fa';
import CommentSection from '../components/CommentSection';
import ComplaintCard from '../components/ComplaintCard';
import Navbar from '../components/Navbar';

const categories = [
  'Infrastructure', 'Academic', 'Hostel', 'Transportation', 'Food', 'Security', 'Technology', 'Sports', 'Library', 'Other'
];
const priorities = ['low', 'medium', 'high', 'urgent'];

const Dashboard = () => {
  // Get current user from localStorage
  let userName = 'Guest';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      userName = user.name;
      // Normalize avatar path if it exists
      if (user.avatar) {
        user.avatar = user.avatar.replace(/\\/g, '/');
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch {}

  const navigate = useNavigate();

  // Modal state for complaint submission
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    file: null
  });
  const [loading, setLoading] = useState(false);
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
        const res = await fetch('/api/complaints?limit=5');
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
            console.log('Fetching vote counts for complaint:', complaint._id);
            const res = await fetch(`/api/votes/complaint/${complaint._id}`);
            const result = await res.json();
            console.log('Vote count response for', complaint._id, ':', result);
            if (result.success) {
              setVoteCounts(prev => ({ 
                ...prev, 
                [complaint._id]: result.data || { likes: 0, dislikes: 0 } 
              }));
            }
          } catch (error) {
            console.error('Error fetching vote counts for complaint', complaint._id, ':', error);
          }
        });
      } catch (err) {
        setRecentComplaints([]);
      }
    };
    fetchComplaints();
  }, []);

  // Mock data for popular issues
  // const popularIssues = [
  //   {
  //     id: 3,
  //     status: 'Pending',
  //     title: 'Inadequate Wi-Fi Coverage',
  //     description: 'Wi-Fi connectivity issues persist in several campus areas, affecting study and research.',
  //     image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDayzxzWBYCdJtlFWTwZj5Lq0nY77H0sr9WzIbZmwY0aa-bOJC-UY9OOamA_aTJbilqalAkukxq2o6B-Hc7DA4AP-gOChTCecrZl0lkxFtp4JEKRe2PgJr2_e9uD1bcLkjeopX8rzzkhA0bK1TNJpSKusMst4kBCjut7lESFzzgP1iz_QmmuYeE8zg0FMrrWRNtLEx6wk3p-PS3k145W7REyR37BMuuqh0sFLHEFDgQJ6FBulG4Ch2iH9r_p_RYENYEOKvMhf0MI0'
  //   },
  // ];



  // Complaint form logic (from ComplaintSubmissionPage)
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to submit a complaint.');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      if (form.file) formData.append('attachments', form.file);
      const res = await fetch('/api/complaints', {
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
        console.error('Non-JSON response:', text);
        throw new Error('Server error: Invalid response.');
      }
      if (!res.ok) throw new Error(data.message || 'Submission failed.');
      setToast({ type: 'success', message: 'Complaint submitted!' });
      setForm({ title: '', description: '', category: categories[0], priority: priorities[1], file: null });
      setShowModal(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Voting handler
  const handleVote = async (complaintId, voteType) => {
    setVoteLoading(prev => ({ ...prev, [complaintId]: true }));
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to vote.');
      
      console.log('Voting:', { targetType: 'complaint', targetId: complaintId, voteType });
      
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetType: 'complaint', targetId: complaintId, voteType })
      });
      
      const data = await res.json();
      console.log('Vote response:', data);
      
      if (!res.ok) throw new Error(data.message || 'Vote failed.');
      
      // Update vote counts
      setVoteCounts(prev => ({ 
        ...prev, 
        [complaintId]: { 
          likes: data.data.likes || 0, 
          dislikes: data.data.dislikes || 0 
        } 
      }));
      
      // Update user vote
      setUserVotes(prev => ({ ...prev, [complaintId]: voteType }));
      
      console.log('Updated vote counts:', { complaintId, likes: data.data.likes, dislikes: data.data.dislikes });
      
    } catch (err) {
      console.error('Vote error:', err);
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
        <form onSubmit={handleSubmit} className="bg-[#18382c] rounded-lg shadow-lg p-8 w-full max-w-lg space-y-6 z-10 border border-[#214a3c]">
          <h2 className="text-2xl font-bold text-[#8ecdb7] mb-2">Submit a Complaint</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Enter complaint title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7]" placeholder="Describe your issue" />
          </div>
          <div className="flex gap-4">
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
            <div className="flex items-center gap-3">
              <label htmlFor="file-upload" className="inline-block px-4 py-2 bg-[#019863] text-white font-semibold rounded cursor-pointer hover:bg-[#017a4f] transition">
                Choose File
              </label>
              <input
                id="file-upload"
                name="file"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-[#8ecdb7] text-sm truncate max-w-[200px]">
                {form.file ? form.file.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </Modal>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-16 flex flex-1 justify-center py-8">
          {/* Main Content - now full width */}
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Welcome, {userName}</p>
            </div>
            {/* Hero Section */}
            <div className="p-4">
              <div
                className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px]"
                style={{
                  backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8P083Jag-QjJCaipbinDR33rqh13AAD8NUwGQV5ZMekGJ430Uf0ItB_gu5pfvfZmrQtj4eaeGNW5QBRfl3fNLca8-bRKUtbU7yV7QPRw2Aq-BGbYiYIwxnptrEhpGD2dBFEoawGK0KVMIlqdfQiTib-2VWS04Tw8NjCQX-kRrppsOefDMsZRIN8Qtdi6WcCTEeCBCU40whxl5a2KTriQWZopMWyC1Ec3FJ41IwQybqSVS2TKWjIsaLIp4mZIJbT84dOx12smf1M8")'
                }}
              >
                <div className="flex w-full items-end justify-between gap-4 p-4">
                  <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                    <p className="text-white tracking-light text-2xl font-bold leading-tight max-w-[440px]">Have a concern? Share it with us.</p>
                    <p className="text-white text-base font-medium leading-normal">Your feedback helps us improve the campus experience for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Complaints */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recent Complaints</h2>
            {recentComplaints.length === 0 && (
              <div className="text-[#8ecdb7] px-4 pb-3">No recent complaints found.</div>
            )}
            <div className="grid gap-6 px-2">
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