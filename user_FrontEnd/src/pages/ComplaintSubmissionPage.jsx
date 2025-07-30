import { useState } from 'react';
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
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
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
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
} 