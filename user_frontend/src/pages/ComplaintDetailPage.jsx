import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api.js';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';


export default function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  // Get current user and token from Redux
  const { user: currentUser, token } = useSelector(state => state.auth);

  // Fetch complaint details
  const fetchComplaint = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await apiFetch(`/api/complaints/${id}`, { headers });
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
  }, [id, token]);

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
      <div className="py-6 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#8ecdb7] mb-4 sm:mb-6 text-center">Complaint Details</h2>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#18382c] rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-[#214a3c]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">{complaint.status}</span>
              <span className="text-xs text-[#8ecdb7]">{formatDate(complaint.createdAt)}</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">{complaint.category}</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-[#019863] text-white">{complaint.priority}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white break-words">{complaint.title}</h1>
            <p className="text-[#8ecdb7] text-sm sm:text-base break-words">{complaint.description}</p>
            {complaint.adminNotes && (
              <div className="text-xs sm:text-sm text-green-400 bg-green-900/30 rounded px-2 py-1 inline-block mt-1">Admin: {complaint.adminNotes}</div>
            )}
            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Attachments:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {complaint.attachments.map((attachment, index) => {
                    // Use Cloudinary URL if available, otherwise fallback to local path
                    const src = attachment.url || (() => {
                      if (attachment.path) {
                        let normalizedPath = attachment.path.replace(/\\/g, '/');
                        if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
                        return `http://localhost:5000${normalizedPath}`;
                      }
                      return null;
                    })();
                    
                    if (!src) return null; // Skip if no valid source
                    return (
                      <div key={index} className="bg-[#10231c] rounded p-2 sm:p-3 flex flex-col items-center">
                        {attachment.mimetype && attachment.mimetype.startsWith('image/') ? (
                          <img
                            src={src}
                            alt={attachment.originalName}
                            className="w-full h-40 sm:h-64 object-cover rounded border border-[#214a3c]"
                            style={{ background: '#222', aspectRatio: '4/3' }}
                            onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                          />
                        ) : (
                          <div className="text-[#8ecdb7] text-xs sm:text-sm">
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