import { useState } from 'react';
import { useSelector } from 'react-redux';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';

const categories = [
  'Infrastructure', 'Academic', 'Hostel', 'Transportation', 'Food', 'Security', 'Technology', 'Sports', 'Library', 'Other'
];
const priorities = ['low', 'medium', 'high', 'urgent'];

export default function ComplaintSubmissionPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    attachments: null
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { token } = useSelector(state => state.auth);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
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
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 py-4 sm:py-6"> {/* Responsive padding */}
        <form onSubmit={handleSubmit} className="bg-[#18382c] rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-lg space-y-4 sm:space-y-6 z-10 border border-[#214a3c]"> {/* Responsive padding and spacing */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-2">Submit a Complaint</h2> {/* Responsive text size */}
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Title</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7] text-sm sm:text-base" 
              placeholder="Enter complaint title" 
            /> {/* Responsive padding and text size */}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required 
              rows={3} 
              className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white placeholder:text-[#8ecdb7] text-sm sm:text-base" 
              placeholder="Describe your issue" 
            /> {/* Responsive padding and text size */}
          </div>
          <div className="flex flex-col sm:flex-row gap-4"> {/* Responsive flex direction */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Category</label>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white text-sm sm:text-base"
              > {/* Responsive padding and text size */}
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Priority</label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={handleChange} 
                className="w-full px-3 py-2 sm:py-3 border border-[#214a3c] rounded focus:outline-none focus:ring-2 focus:ring-[#019863] bg-[#10231c] text-white text-sm sm:text-base"
              > {/* Responsive padding and text size */}
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Attachment (optional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3"> {/* Responsive flex direction */}
              <label htmlFor="file-upload" className="inline-block px-3 sm:px-4 py-2 bg-[#019863] text-white font-semibold rounded cursor-pointer hover:bg-[#017a4f] transition text-sm sm:text-base"> {/* Responsive padding and text size */}
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
              <span className="text-[#8ecdb7] text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]"> {/* Responsive text size and max width */}
                {form.attachments ? form.attachments.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 sm:py-3 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition text-sm sm:text-base"
          > {/* Responsive padding and text size */}
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
} 