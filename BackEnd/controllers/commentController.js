import {
  getCommentsService,
  addCommentService,
  updateCommentService,
  deleteCommentService,
  voteCommentService,
  getMyCommentsService,
  getCommentStatsService
} from '../services/commentService.js';

// @desc    Get comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Public
export async function getComments(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getCommentsService(id, page, limit);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      count: result.comments.length,
      pagination: { current: page, pages: Math.ceil(result.total / limit), total: result.total },
      data: result.comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;
    const result = await addCommentService({
      complaintId: id,
      content,
      parentCommentId,
      user: req.user,
      uploadedFiles: req.uploadedFiles
    });
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(201).json({ success: true, message: 'Comment added successfully', data: result.comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update comment
// @route   PUT /api/complaints/:id/comments/:commentId
// @access  Private
export async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const result = await updateCommentService({ commentId, content, user: req.user });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'Comment updated successfully', data: result.comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Delete comment
// @route   DELETE /api/complaints/:id/comments/:commentId
// @access  Private
export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const result = await deleteCommentService({ commentId, user: req.user });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Vote on comment
// @route   POST /api/complaints/:id/comments/:commentId/vote
// @access  Private
export async function voteComment(req, res) {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const result = await voteCommentService({ commentId, voteType, user: req.user });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        voteCount: result.voteCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get user's comments
// @route   GET /api/comments/user/me
// @access  Private
export async function getMyComments(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getMyCommentsService({ userId: req.user.id, page, limit });
    res.status(200).json({
      success: true,
      count: result.comments.length,
      pagination: { current: page, pages: Math.ceil(result.total / limit), total: result.total },
      data: result.comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

 
