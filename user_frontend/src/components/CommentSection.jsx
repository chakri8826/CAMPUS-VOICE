import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import Toast from './Toast';
import { apiFetch } from '../utils/api.js';

// CommentItem component moved outside to prevent re-creation on every render
const CommentItem = React.memo(({ 
  comment, 
  onEdit, 
  onDelete, 
  complaintId,
  user,
  token
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const isOwner = user && (user.id || user._id) && comment.author && 
    (comment.author._id === (user.id || user._id) || comment.author.id === (user.id || user._id));
  const isAdmin = user && user.role === 'admin';
  const canEdit = (isOwner || isAdmin);
  const canDelete = (isOwner || isAdmin);

  const handleEdit = useCallback(async () => {
    if (!editText.trim()) return;
    await onEdit(comment._id, editText);
    setIsEditing(false);
    setEditText(comment.content);
  }, [editText, comment._id, onEdit, comment.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText(comment.content);
  }, [comment.content]);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="mb-4">
      <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#019863] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs sm:text-sm font-bold">{comment.author.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-white font-medium text-xs sm:text-sm">{comment.author.name}</span>
                {comment.isOfficial && (
                  <span className="bg-[#019863] text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">Official</span>
                )}
                <span className="text-[#8ecdb7] text-xs hidden sm:inline">{comment.author.department}</span>
                <span className="text-[#8ecdb7] text-xs hidden sm:inline">•</span>
                <span className="text-[#8ecdb7] text-xs">{getTimeAgo(comment.createdAt)}</span>
                {comment.isEdited && (
                  <span className="text-[#8ecdb7] text-xs">(edited)</span>
                )}
              </div>
              
              {/* Three dots menu for edit/delete */}
              {(canEdit || canDelete) && (
                <div className="relative self-end sm:self-auto" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 sm:p-1 text-[#8ecdb7] hover:text-white transition-colors rounded-full hover:bg-[#18382c]"
                  >
                    <FaEllipsisV className="text-sm sm:text-base" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#18382c] border border-[#214a3c] rounded-lg shadow-lg z-10 min-w-[100px] sm:min-w-[120px]">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditText(comment.content);
                            setShowMenu(false);
                          }}
                          className="w-full px-2 sm:px-3 py-2 text-left text-[#8ecdb7] hover:bg-[#214a3c] hover:text-white transition-colors flex items-center gap-2 rounded-t-lg text-sm"
                        >
                          <FaEdit className="text-sm" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            onDelete(comment._id);
                            setShowMenu(false);
                          }}
                          className="w-full px-2 sm:px-3 py-2 text-left text-red-400 hover:bg-[#18382c] hover:text-red-300 transition-colors flex items-center gap-2 rounded-b-lg text-sm"
                        >
                          <FaTrash className="text-sm" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white resize-none text-sm sm:text-base"
                  rows="3"
                  required
                  autoFocus
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 sm:py-1 bg-[#019863] text-white text-sm rounded hover:bg-[#017a4f] transition-colors w-full sm:w-auto"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 sm:py-1 bg-[#214a3c] text-white text-sm rounded hover:bg-[#2a5a4a] transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-white text-sm mb-3 leading-relaxed">{comment.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const CommentSection = ({ complaintId }) => {
  const { user, token } = useSelector(state => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch comments from backend
  useEffect(() => {
    setLoading(true);
    setToast(null);
    const fetchComments = async () => {
      try {
        const res = await apiFetch(`/api/complaints/${complaintId}/comments`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch comments');
        setComments(data.data || []);
      } catch (err) {
        setComments([]);
        setToast({ type: 'error', message: err.message || 'Failed to fetch comments.' });
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [complaintId]);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setToast(null);
    try {
      if (!token) throw new Error('You must be logged in to comment.');
      const res = await apiFetch(`/api/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add comment.');
      setComments(prev => [data.data, ...prev]);
      setNewComment('');
      setToast({ type: 'success', message: 'Comment added successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to add comment. Please try again.' });
    }
  };

  const handleEditComment = useCallback(async (commentId, newContent) => {
    try {
      if (!token) throw new Error('You must be logged in to edit comments.');
      
      const res = await apiFetch(`/api/complaints/${complaintId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to update comment.');
      
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, content: newContent, isEdited: true, editedAt: new Date() };
          }
          return comment;
        })
      );
      
      setToast({ type: 'success', message: 'Comment updated successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to update comment. Please try again.' });
    }
  }, [complaintId, token]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setToast(null);
    try {
      if (!token) throw new Error('You must be logged in to delete comments.');
      
      const res = await apiFetch(`/api/complaints/${complaintId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to delete comment.');
      
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      setToast({ type: 'success', message: 'Comment deleted successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to delete comment. Please try again.' });
    }
  }, [complaintId, token]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-[#8ecdb7]">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Comment Form */}
      <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4 mb-4">
        <h3 className="text-white font-bold mb-3 sm:mb-4 text-lg sm:text-xl">Add a Comment</h3>
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-2 sm:px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white resize-none text-sm sm:text-base"
            rows="2"
            required
          />
          <button
            type="submit"
            className="self-end px-4 sm:px-5 py-2 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Post Comment
          </button>
        </form>
      </div>
      
      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-white font-bold mb-2 text-base sm:text-lg">Comments ({comments.length})</h4>
        {comments.map(comment => (
          <CommentItem 
            key={comment._id} 
            comment={comment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            complaintId={complaintId}
            user={user}
            token={token}
          />
        ))}
      </div>
      
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CommentSection;  