import * as adminService from '../services/adminService.js';

// @desc    Get all complaints for admin
// @route   GET /api/admin/complaints
// @access  Private/Admin
export async function getAdminComplaints(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const result = await adminService.getAdminComplaintsService({
      page, limit, category, status, priority, search, sortBy, sortOrder
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
}

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private/Admin
export async function updateComplaintStatus(req, res) {
  try {
    const { status } = req.body;
    const complaintId = req.params.id;
    const result = await adminService.updateComplaintStatusService({ complaintId, status });
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status'
    });
  }
}

// @desc    Add admin reply to complaint
// @route   POST /api/admin/complaints/:id/reply
// @access  Private/Admin
export async function addAdminReply(req, res) {
  try {
    const { content } = req.body;
    const complaintId = req.params.id;
    const userId = req.user.id;
    const result = await adminService.addAdminReplyService({ complaintId, content, userId });
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding admin reply'
    });
  }
}

export async function getAdminDashboard(req, res) {
  try {
    const result = await adminService.getAdminDashboardService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
}

export async function getAdminHealth(req, res) {
  try {
    const result = await adminService.getAdminHealthService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system health'
    });
  }
}

export async function getAdminLogs(req, res) {
  try {
    const result = await adminService.getAdminLogsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching logs'
    });
  }
}

export async function postAdminMaintenance(req, res) {
  try {
    const { action } = req.body;
    const result = await adminService.postAdminMaintenanceService(action);
    res.status(result.status || 200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during maintenance operation'
    });
  }
} 