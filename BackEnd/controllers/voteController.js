import { voteService, getVoteCountService } from '../services/voteService.js';

// @desc    Vote on complaint or comment
// @route   POST /api/votes
// @access  Private
export async function vote(req, res) {
  try {
    const { targetType, targetId, voteType } = req.body;
    const result = await voteService({ userId: req.user.id, targetType, targetId, voteType });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    return res.json({ success: true, message: `Vote ${result.action}`, data: { likes: result.likes, dislikes: result.dislikes } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get vote count for a target
// @route   GET /api/votes/count/:targetType/:targetId
// @access  Public
export async function getVoteCount(req, res) {
  try {
    const { targetType, targetId } = req.params;
    const result = await getVoteCountService({ targetType, targetId });
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.json({ success: true, data: { likes: result.likes, dislikes: result.dislikes } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

