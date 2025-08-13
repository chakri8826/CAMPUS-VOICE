import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-200 text-gray-700'
};

const categories = [
  'Infrastructure', 'Academic', 'Hostel', 'Transportation', 'Food', 'Security', 'Technology', 'Sports', 'Library', 'Other'
];
const priorities = ['low', 'medium', 'high', 'urgent'];

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state for complaint submission
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    attachments: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/complaints/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Server error: Invalid response.');
        }
        if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');
        setComplaints(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  // Complaint form logic
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      if (form.attachments) formData.append('attachments', form.attachments);
      
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
      setForm({ title: '', description: '', category: categories[0], priority: priorities[1], attachments: null });
      setShowModal(false);
      // Refresh the complaints list
      window.location.reload();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Submission failed. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <Navbar onOpenSubmitModal={() => setShowModal(true)} />
      {/* Modal for complaint submission */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="bg-[#18382c] rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-lg space-y-4 sm:space-y-6 z-10 border border-[#214a3c]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-2">Submit a Complaint</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7] text-sm sm:text-base" placeholder="Enter complaint title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7] text-sm sm:text-base" placeholder="Describe your issue" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white text-sm sm:text-base">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white text-sm sm:text-base">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Attachment (optional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label htmlFor="file-upload" className="inline-block px-3 sm:px-4 py-2 bg-[#019863] text-white font-semibold rounded cursor-pointer hover:bg-[#017a4f] transition text-sm sm:text-base">
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
              <span className="text-[#8ecdb7] text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">
                {form.attachments ? form.attachments.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2 sm:py-3 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition text-sm sm:text-base">
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </Modal>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="py-6 sm:py-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-4 sm:mb-6 text-center">My Complaints</h2>
        <div className="max-w-3xl mx-auto grid gap-4 sm:gap-6">
          {loading && <div className="text-center text-white">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!loading && !error && complaints.length === 0 && (
            <div className="text-center text-[#8ecdb7]">No complaints found.</div>
          )}
          {complaints.map(c => (
            <div 
              key={c._id} 
              className="bg-[#18382c] rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 border border-[#214a3c] cursor-pointer hover:bg-[#214a3c] transition-colors"
              onClick={() => navigate(`/complaints/${c._id}`)}
            >
              <div className="flex-1">
                <div className="text-base sm:text-lg font-semibold mb-1 text-white break-words">{c.title}</div>
                <div className="text-xs sm:text-sm text-[#8ecdb7] mb-2">Submitted: {new Date(c.createdAt).toLocaleDateString()}</div>
                {c.adminNotes && (
                  <div className="text-xs sm:text-sm text-green-400 bg-green-900/30 rounded px-2 py-1 inline-block mt-1 break-words">Admin: {c.adminNotes}</div>
                )}
                {c.attachments && c.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.attachments.map((file, idx) => {
                      const isImage = file.mimetype && file.mimetype.startsWith('image/');
                      const backendUrl = 'http://localhost:5000';
                      let fileUrl = file.path.replace(/^\./, '');
                      if (!fileUrl.startsWith('/uploads')) {
                        // If the path is not relative, try to extract uploads path
                        const uploadsIndex = fileUrl.indexOf('uploads');
                        if (uploadsIndex !== -1) {
                          fileUrl = '/' + fileUrl.slice(uploadsIndex);
                        }
                      }
                      fileUrl = backendUrl + fileUrl;
                      return isImage ? (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block border border-[#214a3c] rounded overflow-hidden bg-[#10231c]"
                          style={{ maxWidth: 120, maxHeight: 120 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={fileUrl}
                            alt={file.originalName || file.filename}
                            className="object-cover w-24 sm:w-28 h-16 sm:h-20"
                          />
                          <div className="text-xs sm:text-[13px] text-[#8ecdb7] text-center px-2 py-1 truncate bg-[#18382c]">
                            {file.originalName || file.filename}
                          </div>
                        </a>
                      ) : (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-2 sm:px-3 py-1 bg-[#019863] text-white rounded hover:bg-[#017a4f] text-xs sm:text-sm font-medium transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {file.originalName || file.filename}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold self-start md:self-center ${statusColors[c.status]}`}>{c.status.replace('_', ' ').toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
