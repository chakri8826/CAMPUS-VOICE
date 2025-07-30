import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { sendNotification } from './sendNotification.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import Complaint from '../models/Complaint.js';

/**
 * Assign badges to a user based on their activity
 * @param {string} userId - User ID
 * @param {string} criteriaType - Type of criteria to check
 */
const assignBadges = async (userId, criteriaType) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all active badges
    const badges = await Badge.getActiveBadges();
    
    // Check each badge against user's current stats
    for (const badge of badges) {
      if (badge.criteria.type === criteriaType) {
        const shouldAssign = await checkBadgeCriteria(user, badge);
        
        if (shouldAssign && !user.badges.includes(badge._id)) {
          // Assign badge
          user.badges.push(badge._id);
          await user.save();
          
          // Increment badge awarded count
          await badge.incrementAwardedCount();
          
          // Send notification
          await sendNotification({
            recipient: userId,
            type: 'badge_earned',
            title: `🎉 New Badge Earned: ${badge.name}`,
            message: `Congratulations! You've earned the ${badge.name} badge: ${badge.description}`,
            targetType: 'user',
            targetId: userId,
            priority: 'medium',
            metadata: {
              badgeId: badge._id,
              badgeIcon: badge.icon,
              badgeColor: badge.color
            }
          });
          
          console.log(`Badge "${badge.name}" assigned to user ${user.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error assigning badges:', error);
    throw error;
  }
};

/**
 * Check if user meets badge criteria
 * @param {Object} user - User object
 * @param {Object} badge - Badge object
 */
const checkBadgeCriteria = async (user, badge) => {
  try {
    const { criteria } = badge;
    
    switch (criteria.type) {
      case 'complaints_submitted':
        return user.complaintsSubmitted >= criteria.threshold;
        
      case 'complaints_resolved':
        return user.complaintsResolved >= criteria.threshold;
        
      case 'comments_made':
        const commentCount = await Comment.countDocuments({
          author: user._id,
          isDeleted: false
        });
        return commentCount >= criteria.threshold;
        
      case 'votes_received':
        const voteCount = await Vote.countDocuments({
          targetType: { $in: ['complaint', 'comment'] },
          targetId: { $in: await getUserContentIds(user._id) }
        });
        return voteCount >= criteria.threshold;
        
      case 'days_active':
        const daysActive = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
        return daysActive >= criteria.threshold;
        
      case 'helpful_comments':
        const helpfulComments = await Comment.countDocuments({
          author: user._id,
          isDeleted: false,
          upvotes: { $gte: 5 } // Consider comments with 5+ upvotes as helpful
        });
        return helpfulComments >= criteria.threshold;
        
      case 'admin_approved':
        // This would be manually assigned by admins
        return false;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking badge criteria:', error);
    return false;
  }
};

/**
 * Get all content IDs (complaints and comments) for a user
 * @param {string} userId - User ID
 */
const getUserContentIds = async (userId) => {
  try {
    const [complaints, comments] = await Promise.all([
      Complaint.find({ submittedBy: userId }).select('_id'),
      Comment.find({ author: userId, isDeleted: false }).select('_id')
    ]);
    
    return [
      ...complaints.map(c => c._id),
      ...comments.map(c => c._id)
    ];
  } catch (error) {
    console.error('Error getting user content IDs:', error);
    return [];
  }
};

/**
 * Assign badges to all users (batch process)
 */
const assignBadgesToAllUsers = async () => {
  try {
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      await assignBadges(user._id, 'complaints_submitted');
      await assignBadges(user._id, 'complaints_resolved');
      await assignBadges(user._id, 'comments_made');
      await assignBadges(user._id, 'votes_received');
      await assignBadges(user._id, 'days_active');
      await assignBadges(user._id, 'helpful_comments');
    }
    
    console.log(`Badge assignment completed for ${users.length} users`);
  } catch (error) {
    console.error('Error in batch badge assignment:', error);
    throw error;
  }
};

/**
 * Manually assign a badge to a user (admin function)
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 */
const manuallyAssignBadge = async (userId, badgeId) => {
  try {
    const [user, badge] = await Promise.all([
      User.findById(userId),
      Badge.findById(badgeId)
    ]);
    
    if (!user || !badge) {
      throw new Error('User or badge not found');
    }
    
    if (user.badges.includes(badgeId)) {
      throw new Error('User already has this badge');
    }
    
    // Assign badge
    user.badges.push(badgeId);
    await user.save();
    
    // Increment badge awarded count
    await badge.incrementAwardedCount();
    
    // Send notification
    await sendNotification({
      recipient: userId,
      type: 'badge_earned',
      title: `🎉 Badge Awarded: ${badge.name}`,
      message: `You've been awarded the ${badge.name} badge: ${badge.description}`,
      targetType: 'user',
      targetId: userId,
      priority: 'medium',
      metadata: {
        badgeId: badge._id,
        badgeIcon: badge.icon,
        badgeColor: badge.color
      }
    });
    
    return { user, badge };
  } catch (error) {
    console.error('Error manually assigning badge:', error);
    throw error;
  }
};

/**
 * Remove a badge from a user (admin function)
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 */
const removeBadge = async (userId, badgeId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.badges.includes(badgeId)) {
      throw new Error('User does not have this badge');
    }
    
    // Remove badge
    user.badges = user.badges.filter(id => id.toString() !== badgeId);
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error removing badge:', error);
    throw error;
  }
};

export {
  assignBadges,
  assignBadgesToAllUsers,
  manuallyAssignBadge,
  removeBadge,
  checkBadgeCriteria
}; 