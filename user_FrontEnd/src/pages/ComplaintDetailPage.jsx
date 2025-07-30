import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';

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

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  // Get current user from localStorage
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('user'));
  } catch {}

  // Fetch complaint details
  const fetchComplaint = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`/api/complaints/${id}`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        setComplaint(data.data);
      } else {
        console.error('Error fetching complaint:', data.message);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchComplaint();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10231c] flex items-center justify-center">
        <div className="text-[#8ecdb7] text-xl">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-[#10231c] flex items-center justify-center">
        <div className="text-[#8ecdb7] text-xl">Complaint not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10231c] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <div className="py-8 px-2">
        <h2 className="text-2xl font-bold text-[#8ecdb7] mb-6 text-center">Complaint Details</h2>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#18382c] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-[#214a3c]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">{complaint.status}</span>
              <span className="text-xs text-[#8ecdb7]">{formatDate(complaint.createdAt)}</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">{complaint.category}</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-[#019863] text-white">{complaint.priority}</span>
            </div>
            <h1 className="text-white text-2xl font-bold">{complaint.title}</h1>
            <p className="text-[#8ecdb7] text-base">{complaint.description}</p>
            {complaint.adminNotes && (
              <div className="text-sm text-green-400 bg-green-900/30 rounded px-2 py-1 inline-block mt-1">Admin: {complaint.adminNotes}</div>
            )}
 
            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">Attachments:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment, index) => {
                    // Normalize path
                    let normalizedPath = attachment.path.replace(/\\/g, '/');
                    if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
                    const src = `http://localhost:5000${normalizedPath}`;
                    return (
                      <div key={index} className="bg-[#10231c] rounded p-3 flex flex-col items-center">
                        {attachment.mimetype && attachment.mimetype.startsWith('image/') ? (
                          <img
                            src={src}
                            alt={attachment.originalName}
                            className="w-full h-64 object-cover rounded border border-[#214a3c]"
                            style={{ background: '#222', aspectRatio: '4/3' }}
                            onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                          />
                        ) : (
                          <div className="text-[#8ecdb7] text-sm">
                            <div className="font-medium">{attachment.originalName}</div>
                            <div className="text-xs">{(attachment.size / 1024).toFixed(1)} KB</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 