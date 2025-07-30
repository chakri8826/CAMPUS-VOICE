// src/components/ComplaintCard.jsx

import React from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegComment,
  FaRegImage,
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
}) => {
  const votes = voteCounts[complaint._id] || { likes: 0, dislikes: 0 };
  const userVote = userVotes[complaint._id];
  
  // Debug logging
  console.log('ComplaintCard render:', {
    complaintId: complaint._id,
    votes,
    userVote,
    voteLoading: voteLoading[complaint._id]
  });

  const imageUrl = (() => {
    if (
      complaint.attachments &&
      complaint.attachments.length > 0 &&
      complaint.attachments.some((f) => f.mimetype?.startsWith("image/"))
    ) {
      const imgFile = complaint.attachments.find((f) => f.mimetype.startsWith("image/"));
      let fileUrl = imgFile.path.replace(/^\./, "");
      if (!fileUrl.startsWith("/uploads")) {
        const uploadsIndex = fileUrl.indexOf("uploads");
        if (uploadsIndex !== -1) {
          fileUrl = "/" + fileUrl.slice(uploadsIndex);
        }
      }
      return `http://localhost:5000${fileUrl}`;
    }
    return null;
  })();

  return (
    <div className="bg-[#18382c] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-[#214a3c] transition-transform hover:scale-[1.015] hover:shadow-2xl duration-200">
      {/* Top: Flex row */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Complaint Info */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#214a3c] text-[#8ecdb7]">
              {complaint.status}
            </span>
            <span className="text-xs text-[#8ecdb7]">
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
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
    </div>
  );
};

export default ComplaintCard;
