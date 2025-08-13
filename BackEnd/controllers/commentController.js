import {
  getCommentsService,
  addCommentService,
  updateCommentService,
  deleteCommentService,
  getMyCommentsService,

} from '../services/commentService.js';

// @desc    Get comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Public
export async function getComments(req, res) {
  try {
    const { id } = req.params;
    const result = await getCommentsService(id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      count: result.comments.length,
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
    const { content } = req.body;
    const result = await addCommentService({
      complaintId: id,
      content,
      user: req.user
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



// @desc    Get user's comments
// @route   GET /api/comments/user/me
// @access  Private
export async function getMyComments(req, res) {
  try {
    const result = await getMyCommentsService({ userId: req.user.id });
    res.status(200).json({
      success: true,
      count: result.complaints.length,
      data: result.complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


