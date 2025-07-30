import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['complaint', 'comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },
  voteType: { type: String, enum: ['like', 'dislike'], required: true }
}, { timestamps: true });

voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
