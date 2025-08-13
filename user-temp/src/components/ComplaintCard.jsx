// src/components/ComplaintCard.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegComment,
  FaRegImage,
  FaEllipsisV,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import CommentSection from "./CommentSection";

const ComplaintCard = ({
  complaint,
  voteCounts = {},
  userVotes = {},
  voteLoading = {},
  handleVote,
  openComments = {},
  setOpenComments,
  onEdit,
  onDelete,
}) => {
  const { user } = useSelector(state => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef(null);
  
  const votes = voteCounts[complaint._id] || { likes: 0, dislikes: 0 };
  const userVote = userVotes[complaint._id];
  const isOwner = user && (user.id || user._id) && complaint.submittedBy && 
    (complaint.submittedBy._id === (user.id || user._id) || complaint.submittedBy === (user.id || user._id));
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('ComplaintCard render:', {
      complaintId: complaint._id,
      isOwner,
      userId: user?.id || user?._id,
      complaintSubmittedBy: complaint.submittedBy?._id || complaint.submittedBy
    });
  }

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  const imageUrl = (() => {
    if (
      complaint.attachments &&
      complaint.attachments.length > 0 &&
      complaint.attachments.some((f) => f.mimetype?.startsWith("image/"))
    ) {
      const imgFile = complaint.attachments.find((f) => f.mimetype.startsWith("image/"));
      
      // Check if it's a Cloudinary URL (new structure)
      if (imgFile.url) {
        return imgFile.url;
      }
      
      // Fallback to local file path (old structure)
      if (imgFile.path) {
        let fileUrl = imgFile.path.replace(/^\./, "");
        if (!fileUrl.startsWith("/uploads")) {
          const uploadsIndex = fileUrl.indexOf("uploads");
          if (uploadsIndex !== -1) {
            fileUrl = "/" + fileUrl.slice(uploadsIndex);
          }
        }
        return `http://localhost:5000${fileUrl}`;
      }
    }
    return null;
  })();

  const handleEdit = () => {
    setShowMenu(false);
    if (complaint && complaint._id) {
      onEdit(complaint);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setDeleteConfirm(false);
    if (complaint && complaint._id) {
      onDelete(complaint._id);
    }
  };

  return (
    <div className="bg-[#18382c] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-[#214a3c] transition-transform hover:scale-[1.015] hover:shadow-2xl duration-200">
      {/* Top: Flex row */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Complaint Info */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">
                {complaint.status}
              </span>
              <span className="text-xs text-[#8ecdb7]">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            
                         {/* Three dots menu - only show for owner */}
             {isOwner && (
               <div className="relative" ref={menuRef}>
                 <button
                   onClick={() => setShowMenu(!showMenu)}
                   className="p-1 text-[#8ecdb7] hover:text-white transition-colors rounded-full hover:bg-[#214a3c]"
                 >
                   <FaEllipsisV />
                 </button>
                 
                 {/* Dropdown menu */}
                 {showMenu && (
                   <div className="absolute right-0 top-full mt-1 bg-[#214a3c] border border-[#18382c] rounded-lg shadow-lg z-10 min-w-[120px]">
                     <button
                       onClick={handleEdit}
                       className="w-full px-3 py-2 text-left text-[#8ecdb7] hover:bg-[#18382c] hover:text-white transition-colors flex items-center gap-2 rounded-t-lg"
                     >
                       <FaEdit className="text-sm" />
                       Edit
                     </button>
                     <button
                       onClick={handleDelete}
                       className="w-full px-3 py-2 text-left text-red-400 hover:bg-[#18382c] hover:text-red-300 transition-colors flex items-center gap-2 rounded-b-lg"
                     >
                       <FaTrash className="text-sm" />
                       Delete
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>

          <p className="text-white text-lg font-bold">{complaint.title}</p>
          <p className="text-[#8ecdb7] text-sm">{complaint.description}</p>

          <div className="flex gap-6 items-center mt-3">
            <button
              className={`flex items-center gap-1 transition-colors text-lg ${
                userVote === "like" && votes.likes>0 || votes.likes>0
                  ? "text-green-500 font-bold"
                  : "text-[#8ecdb7] hover:text-[#019863]"
              }`}
              onClick={() => handleVote(complaint._id, "like")}
              disabled={voteLoading[complaint._id]}
            >
              {userVote === "like" && votes.likes>0 || votes.likes>0 ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>{votes.likes}</span>
            </button>

            <button
              className={`flex items-center gap-1 transition-colors text-lg ${
                userVote === "dislike"  && votes.dislikes>0 || votes.dislikes>0
                  ? "text-red-500 font-bold"
                  : "text-[#8ecdb7] hover:text-[#dc3545]"
              }`}
              onClick={() => handleVote(complaint._id, "dislike")}
              disabled={voteLoading[complaint._id]}
            >
              {userVote === "dislike"  && votes.dislikes>0 || votes.dislikes>0 ? <FaThumbsDown /> : <FaRegThumbsDown />}
              <span>{votes.dislikes}</span>
            </button>

            <button
              className="flex items-center gap-1 text-[#8ecdb7] hover:text-[#019863] transition-colors text-lg px-2 py-1 rounded-full bg-[#214a3c] shadow-sm font-medium ml-2"
              onClick={() =>
                setOpenComments((prev) => ({
                  ...prev,
                  [complaint._id]: !prev[complaint._id],
                }))
              }
            >
              <FaRegComment />
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex flex-col justify-center items-center min-w-[12rem]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={complaint.title}
              className="object-cover w-48 h-28 rounded-xl border border-[#214a3c] shadow"
            />
          ) : (
            <div className="w-48 h-28 aspect-video rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-[#214a3c] via-[#18382c] to-[#10231c] border border-[#214a3c] shadow">
              <FaRegImage className="text-4xl text-[#8ecdb7] mb-1" />
              <span className="text-[#8ecdb7] text-xs font-medium">No Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Full-width Comments */}
      {openComments[complaint._id] && (
        <div className="w-full animate-fade-in">
          <CommentSection complaintId={complaint._id} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#18382c] rounded-lg p-6 max-w-md mx-4 border border-[#214a3c]">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-[#8ecdb7] mb-6">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-[#8ecdb7] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;
