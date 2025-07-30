import {
  getComplaintsService,
  getComplaintService,
  createComplaintService,
  updateComplaintService,
  deleteComplaintService,
  voteComplaintService,
  getMyComplaintsService,
} from '../services/complaintService.js';

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public
export async function getComplaints(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const result = await getComplaintsService({ filter, page, limit });
    res.status(200).json({
      success: true,
      count: result.complaints.length,
      pagination: { current: page, pages: Math.ceil(result.total / limit), total: result.total },
      data: result.complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
export async function getComplaint(req, res) {
  try {
    const result = await getComplaintService(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, data: result.complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export async function createComplaint(req, res) {
  try {
    const result = await createComplaintService({ data: req.body, user: req.user, uploadedFiles: req.uploadedFiles });
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(201).json({ success: true, message: 'Complaint created successfully', data: result.complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
export async function updateComplaint(req, res) {
  try {
    const result = await updateComplaintService({ id: req.params.id, data: req.body, user: req.user, uploadedFiles: req.uploadedFiles });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'Complaint updated successfully', data: result.complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
export async function deleteComplaint(req, res) {
  try {
    const result = await deleteComplaintService({ id: req.params.id, user: req.user });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Vote on complaint
// @route   POST /api/complaints/:id/vote
// @access  Private
export async function voteComplaint(req, res) {
  try {
    const { voteType } = req.body;
    const result = await voteComplaintService({ id: req.params.id, voteType, user: req.user });
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

// @desc    Get user's complaints
// @route   GET /api/complaints/user/me
// @access  Private
export async function getMyComplaints(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getMyComplaintsService({ userId: req.user.id, page, limit });
    res.status(200).json({
      success: true,
      count: result.complaints.length,
      pagination: { current: page, pages: Math.ceil(result.total / limit), total: result.total },
      data: result.complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

