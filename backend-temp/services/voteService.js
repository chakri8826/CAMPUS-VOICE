import * as voteRepository from '../repositories/voteRepository.js';
import Complaint from '../models/Complaint.js';

export async function voteService({ userId, targetType, targetId, voteType }) {
  if (targetType !== 'complaint' || !['like', 'dislike'].includes(voteType)) {
    return { error: 'Invalid input', status: 400 };
  }

  const existing = await voteRepository.findVote(userId, targetType, targetId);
  let action;
  if (existing) {
    if (existing.voteType === voteType) {
      await voteRepository.deleteVote(existing);
      action = 'removed';
    } else {
      await voteRepository.updateVote(existing, voteType);
      action = 'updated';
    }
  } else {
    await voteRepository.createVote(userId, targetType, targetId, voteType);
    action = 'added';
  }

  // Update and return counts for complaints
  const likes = await voteRepository.countVotes(targetType, targetId, 'like');
  const dislikes = await voteRepository.countVotes(targetType, targetId, 'dislike');
  await Complaint.findByIdAndUpdate(targetId, { likes, dislikes });
  return { action, likes, dislikes };
}

export async function getVoteCountService({ targetType, targetId }) {
  if (targetType !== 'complaint') {
    return { error: 'Invalid input', status: 400 };
  }

  const doc = await Complaint.findById(targetId).select('likes dislikes');
  if (!doc) {
    return { error: 'Target not found', status: 404 };
  }
  return { likes: doc.likes, dislikes: doc.dislikes };
}