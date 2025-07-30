import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { FaRegThumbsUp, FaRegThumbsDown, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const CommentSection = ({ complaintId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setCurrentUser(storedUser);
  } catch {
    setCurrentUser(null);
  }
  
}, []);

  // Fetch comments from backend
  useEffect(() => {
    setLoading(true);
    setToast(null);
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/complaints/${complaintId}/comments`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch comments');
        setComments(data.data || []);
        // Optionally, fetch user votes for each comment if available
      } catch (err) {
        setComments([]);
        setToast({ type: 'error', message: err.message || 'Failed to fetch comments.' });
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [complaintId]);

  // Get current user from localStorage
  // let currentUser = null;
  // try {
  //   currentUser = JSON.parse(localStorage.getItem('user'));
  // } catch {}

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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to comment.');
      const res = await fetch(`/api/complaints/${complaintId}/comments`, {
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

  const handleVote = async (commentId, voteType, isReply = false, parentId = null) => {
    if (!commentId) {
      setToast({ type: 'error', message: 'Invalid comment ID' });
      return;
    }
    
    setToast(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to vote.');
      const res = await fetch(`/api/complaints/${complaintId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to vote.');
      setComments(prev => prev.map(comment => {
        if (isReply && comment._id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply._id === commentId
                ? { ...reply, upvotes: data.data.upvotes, downvotes: data.data.downvotes }
                : reply
            )
          };
        } else if (!isReply && comment._id === commentId) {
          return { ...comment, upvotes: data.data.upvotes, downvotes: data.data.downvotes };
        }
        return comment;
      }));
      setUserVotes(prev => ({ ...prev, [commentId]: voteType }));
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to vote. Please try again.' });
    }
  };

  const handleEditComment = async (commentId, newContent, isReply = false, parentId = null) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setComments(prev => 
        prev.map(comment => {
          if (isReply && comment._id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply._id === commentId 
                  ? { ...reply, content: newContent, isEdited: true, editedAt: new Date() }
                  : reply
              )
            };
          } else if (!isReply && comment._id === commentId) {
            return { ...comment, content: newContent, isEdited: true, editedAt: new Date() };
          }
          return comment;
        })
      );
      
      setEditingComment(null);
      setEditText('');
      setToast({ type: 'success', message: 'Comment updated successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update comment. Please try again.' });
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setToast(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to delete comments.');
      const res = await fetch(`/api/complaints/${complaintId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete comment.');
      setComments(prev => prev.map(comment => {
        if (isReply && comment._id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply._id === commentId
                ? { ...reply, content: '[This comment has been deleted]', isDeleted: true }
                : reply
            )
          };
        } else if (!isReply && comment._id === commentId) {
          return { ...comment, content: '[This comment has been deleted]', isDeleted: true };
        }
        return comment;
      }));
      setToast({ type: 'success', message: 'Comment deleted successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to delete comment. Please try again.' });
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }) => {
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    const handleSubmitReply = async (e, parentId) => {
      e.preventDefault();
      if (!replyText.trim()) return;
      setSubmitting(true);
      setToast(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('You must be logged in to reply.');
        const res = await fetch(`/api/complaints/${complaintId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content: replyText, parentCommentId: parentId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add reply.');
        setComments(prev => prev.map(c =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), data.data] }
            : c
        ));
        setReplyText('');
        setReplyTo(null);
        setToast({ type: 'success', message: 'Reply added successfully!' });
        setShowReplies(true);
      } catch (error) {
        setToast({ type: 'error', message: error.message || 'Failed to add reply. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-[#214a3c] pl-4' : ''} mb-4`}>
        <div className="bg-[#214a3c] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#019863] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{comment.author.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-medium text-sm">{comment.author.name}</span>
                {comment.isOfficial && (
                  <span className="bg-[#019863] text-white text-xs px-2 py-1 rounded">Official</span>
                )}
                <span className="text-[#8ecdb7] text-xs">{comment.author.department}</span>
                <span className="text-[#8ecdb7] text-xs">•</span>
                <span className="text-[#8ecdb7] text-xs">{getTimeAgo(comment.createdAt)}</span>
                {comment.isEdited && (
                  <span className="text-[#8ecdb7] text-xs">(edited)</span>
                )}
              </div>
              
              {editingComment === comment._id ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEditComment(comment._id, editText, isReply, parentId);
                }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white resize-none"
                    rows="3"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#019863] text-white text-sm rounded hover:bg-[#017a4f] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-[#214a3c] text-white text-sm rounded hover:bg-[#2a5a4a] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-white text-sm mb-3">{comment.content}</p>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 bg-[#18382c] rounded-full px-3 py-1 shadow-sm">
                  <button
                    onClick={() => handleVote(comment._id, 'upvote', isReply, parentId)}
                    className={`transition-colors text-lg flex items-center gap-1 px-2 py-1 rounded-full ${userVotes[comment._id] === 'upvote' && comment.upvotes > 0 ? 'text-green-500 bg-[#10231c] font-bold' : 'text-[#8ecdb7] hover:text-[#019863] hover:bg-[#214a3c]'}`}
                    title="Like"
                  >
                    {userVotes[comment._id] === 'upvote' ? <FaThumbsUp className="text-base" /> : <FaRegThumbsUp className="text-base" />}
                    <span className="ml-1 text-base">{comment.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(comment._id, 'downvote', isReply, parentId)}
                    className={`transition-colors text-lg flex items-center gap-1 px-2 py-1 rounded-full ${userVotes[comment._id] === 'downvote' && comment.downvotes > 0  ? 'text-red-500 bg-[#10231c] font-bold' : 'text-[#8ecdb7] hover:text-[#dc3545] hover:bg-[#214a3c]'}`}
                    title="Dislike"
                  >
                    {userVotes[comment._id] === 'downvote' ? <FaThumbsDown className="text-base" /> : <FaRegThumbsDown className="text-base" />}
                    <span className="ml-1 text-base">{comment.downvotes}</span>
                  </button>
                </div>
                
                {!isReply && (
                  <button
                    onClick={() => setReplyTo(comment._id)}
                    className="text-[#8ecdb7] text-sm hover:text-white transition-colors"
                  >
                    Reply
                  </button>
                )}
                
                {/* Edit button for author (example: admin id === '1') */}
                {(() => {
                  const authorId = comment.author._id || comment.author.id;
                  return currentUser && (currentUser._id === authorId || currentUser.role === 'admin') && !editingComment && !comment.isDeleted;
                })() && (
                  <button
                    onClick={() => {
                      setEditingComment(comment._id);
                      setEditText(comment.content);
                    }}
                    className="text-[#8ecdb7] text-sm hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                )}
                {/* Delete button for author or admin */}
                {(() => {
                  const authorId = comment.author._id || comment.author.id;
                  return currentUser && (currentUser._id === authorId || currentUser.role === 'admin') && !comment.isDeleted;
                })() && (
                  <button
                    onClick={() => handleDeleteComment(comment._id, isReply, parentId)}
                    className="text-red-400 text-sm hover:text-white transition-colors ml-2"
                  >
                    Delete
                  </button>
                )}
              </div>
              {/* Show Replies Button */}
              {!isReply && comment.replies && comment.replies.length > 0 && (
                <button
                  className="mt-2 text-[#8ecdb7] text-xs hover:text-white transition-colors underline"
                  onClick={() => setShowReplies((prev) => !prev)}
                >
                  {showReplies ? `Hide Replies (${comment.replies.length})` : `Show Replies (${comment.replies.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Reply Form */}
        {replyTo === comment._id && !isReply && (
          <div className="ml-8 mt-3">
            <form onSubmit={(e) => handleSubmitReply(e, comment._id)}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white resize-none"
                rows="3"
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 bg-[#019863] text-white text-sm rounded hover:bg-[#017a4f] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText('');
                  }}
                  className="px-3 py-1 bg-[#214a3c] text-white text-sm rounded hover:bg-[#2a5a4a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Replies */}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} isReply={true} parentId={comment._id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-[#8ecdb7]">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Comment Form */}
      <div className="bg-[#214a3c] rounded-lg p-4 mb-4">
        <h3 className="text-white font-bold mb-4">Add a Comment</h3>
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-1 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white resize-none"
            rows="2"
            required
          />
          <button
            type="submit"
            className="self-end px-5 py-2 bg-[#019863] text-white font-semibold rounded hover:bg-[#017a4f] transition-colors disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>
      </div>
      {/* Comments List */}
      <div className="space-y-4">
        <h4 className="text-white font-bold mb-2">Comments ({comments.length})</h4>
        {comments.map(comment => (
          <CommentItem key={comment._id} comment={comment} />
        ))}
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CommentSection;  