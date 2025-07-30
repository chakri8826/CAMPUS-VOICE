import express from 'express';
import { vote, getVoteCount } from '../controllers/voteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, vote);
router.get('/:targetType/:targetId', getVoteCount);

export default router;