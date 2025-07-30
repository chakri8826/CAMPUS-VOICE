import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a badge name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Badge name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a badge description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  icon: {
    type: String,
    required: [true, 'Please provide a badge icon'],
    trim: true
  },
  color: {
    type: String,
    default: '#007bff',
    trim: true
  },
  category: {
    type: String,
    enum: ['participation', 'achievement', 'special', 'milestone'],
    default: 'participation'
  },
  criteria: {
    type: {
      type: String,
      enum: [
        'complaints_submitted',
        'complaints_resolved',
        'comments_made',
        'votes_received',
        'days_active',
        'helpful_comments',
        'admin_approved'
      ],
      required: true
    },
    threshold: {
      type: Number,
      required: true,
      min: 1
    },
    timeFrame: {
      type: String,
      enum: ['all_time', 'monthly', 'weekly'],
      default: 'all_time'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  awardedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
badgeSchema.index({ name: 1 });
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1 });

// Virtual for rarity color
badgeSchema.virtual('rarityColor').get(function() {
  const colors = {
    common: '#6c757d',
    uncommon: '#28a745',
    rare: '#007bff',
    epic: '#6f42c1',
    legendary: '#fd7e14'
  };
  return colors[this.rarity] || '#6c757d';
});

// Method to increment awarded count
badgeSchema.methods.incrementAwardedCount = function() {
  this.awardedCount += 1;
  return this.save();
};

// Static method to get badges by category
badgeSchema.statics.getBadgesByCategory = function(category) {
  return this.find({ category: category, isActive: true })
    .sort({ rarity: 1, name: 1 });
};

// Static method to get all active badges
badgeSchema.statics.getActiveBadges = function() {
  return this.find({ isActive: true })
    .sort({ category: 1, rarity: 1, name: 1 });
};

// Static method to get badge by criteria
badgeSchema.statics.getBadgeByCriteria = function(criteriaType, threshold) {
  return this.findOne({
    'criteria.type': criteriaType,
    'criteria.threshold': threshold,
    isActive: true
  });
};

// Static method to get rare badges
badgeSchema.statics.getRareBadges = function() {
  return this.find({
    rarity: { $in: ['rare', 'epic', 'legendary'] },
    isActive: true
  }).sort({ rarity: 1, name: 1 });
};

// Static method to create default badges
badgeSchema.statics.createDefaultBadges = async function() {
  const defaultBadges = [
    {
      name: 'First Complaint',
      description: 'Submitted your first complaint',
      icon: '🎯',
      color: '#28a745',
      category: 'milestone',
      criteria: {
        type: 'complaints_submitted',
        threshold: 1
      },
      rarity: 'common'
    },
    {
      name: 'Active Voice',
      description: 'Submitted 10 complaints',
      icon: '📢',
      color: '#007bff',
      category: 'achievement',
      criteria: {
        type: 'complaints_submitted',
        threshold: 10
      },
      rarity: 'uncommon'
    },
    {
      name: 'Community Helper',
      description: 'Made 25 helpful comments',
      icon: '🤝',
      color: '#6f42c1',
      category: 'achievement',
      criteria: {
        type: 'helpful_comments',
        threshold: 25
      },
      rarity: 'rare'
    },
    {
      name: 'Problem Solver',
      description: 'Had 5 complaints resolved',
      icon: '✅',
      color: '#fd7e14',
      category: 'achievement',
      criteria: {
        type: 'complaints_resolved',
        threshold: 5
      },
      rarity: 'epic'
    },
    {
      name: 'Veteran',
      description: 'Active for 30 days',
      icon: '🏆',
      color: '#dc3545',
      category: 'milestone',
      criteria: {
        type: 'days_active',
        threshold: 30
      },
      rarity: 'legendary'
    }
  ];

  for (const badgeData of defaultBadges) {
    const existingBadge = await this.findOne({ name: badgeData.name });
    if (!existingBadge) {
      await this.create(badgeData);
    }
  }
};

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge; 