import Vote from '../models/Vote.js';

export async function findVote(userId, targetType, targetId) {
  return Vote.findOne({ user: userId, targetType, targetId });
}

export async function createVote(userId, targetType, targetId, voteType) {
  return Vote.create({ user: userId, targetType, targetId, voteType });
}

export async function deleteVote(vote) {
  return vote.deleteOne();
}

export async function updateVote(vote, voteType) {
  vote.voteType = voteType;
  return vote.save();
}

export async function countVotes(targetType, targetId, voteType) {
  return Vote.countDocuments({ targetType, targetId, voteType });
} 