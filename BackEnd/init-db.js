import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { ENV_VARS } from './config/envVars.js';

// Import models
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Comment = require('./models/Comment');
const Badge = require('./models/Badge');
const Vote = require('./models/Vote');
const Notification = require('./models/Notification');

async function initializeDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(ENV_VARS.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    // console.log('🧹 Clearing existing data...');
    // await User.deleteMany({});
    // await Complaint.deleteMany({});
    // await Comment.deleteMany({});
    // await Badge.deleteMany({});
    // await Vote.deleteMany({});
    // await Notification.deleteMany({});

    // Create default badges
    console.log('🏆 Creating default badges...');
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

    const createdBadges = await Badge.insertMany(defaultBadges);
    console.log(`✅ Created ${createdBadges.length} badges`);

    // Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@university.edu',
        password: 'password123',
        studentId: 'STU2024001',
        department: 'Computer Science',
        year: 3,
        role: 'student',
        reputation: 1250,
        complaintsSubmitted: 15,
        complaintsResolved: 8,
        badges: [createdBadges[0]._id, createdBadges[1]._id, createdBadges[3]._id] // First Complaint, Active Voice, Problem Solver
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@university.edu',
        password: 'password123',
        studentId: 'STU2024002',
        department: 'Electrical Engineering',
        year: 2,
        role: 'student',
        reputation: 850,
        complaintsSubmitted: 8,
        complaintsResolved: 3,
        badges: [createdBadges[0]._id] // First Complaint
      },
      {
        name: 'Admin User',
        email: 'admin@university.edu',
        password: 'admin123',
        role: 'admin',
        reputation: 2000,
        complaintsSubmitted: 0,
        complaintsResolved: 0
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample complaints
    console.log('📝 Creating sample complaints...');
    const sampleComplaints = [
      {
        title: 'Wi-Fi Connectivity Issues in Library',
        description: 'The Wi-Fi connection in the library is extremely slow and frequently disconnects. This is affecting students\' ability to study and complete assignments.',
        category: 'Technology',
        subcategory: 'Network',
        priority: 'high',
        status: 'in_progress',
        location: {
          building: 'Main Library',
          floor: '2nd Floor',
          area: 'Study Area A'
        },
        submittedBy: createdUsers[0]._id,
        assignedTo: createdUsers[2]._id, // Admin
        upvotes: 25,
        downvotes: 2,
        tags: ['wifi', 'library', 'network'],
        isUrgent: true,
        estimatedResolutionTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        views: 150
      },
      {
        title: 'Broken Elevator in Building A',
        description: 'The elevator in Building A has been out of service for the past 3 days. Students with disabilities are having difficulty accessing upper floors.',
        category: 'Infrastructure',
        subcategory: 'Elevator',
        priority: 'urgent',
        status: 'resolved',
        location: {
          building: 'Building A',
          floor: 'All Floors',
          area: 'Main Entrance'
        },
        submittedBy: createdUsers[1]._id,
        assignedTo: createdUsers[2]._id, // Admin
        upvotes: 45,
        downvotes: 1,
        tags: ['elevator', 'accessibility', 'building-a'],
        isUrgent: true,
        actualResolutionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        resolutionNotes: 'Elevator has been repaired and is now fully functional.',
        views: 200
      },
      {
        title: 'Noise Complaint in Hostel Block B',
        description: 'Excessive noise from parties in Hostel Block B is disrupting students\' sleep and study time, especially during exam periods.',
        category: 'Hostel',
        subcategory: 'Noise',
        priority: 'medium',
        status: 'pending',
        location: {
          building: 'Hostel Block B',
          floor: '3rd Floor',
          area: 'Room 301-320'
        },
        submittedBy: createdUsers[0]._id,
        upvotes: 12,
        downvotes: 3,
        tags: ['noise', 'hostel', 'disturbance'],
        views: 75
      }
    ];

    const createdComplaints = await Complaint.insertMany(sampleComplaints);
    console.log(`✅ Created ${createdComplaints.length} complaints`);

    // Create sample comments
    console.log('💬 Creating sample comments...');
    const sampleComments = [
      {
        content: 'This is a serious issue that affects many students. I hope it gets resolved quickly.',
        complaint: createdComplaints[0]._id,
        author: createdUsers[0]._id,
        upvotes: 12,
        downvotes: 2,
        isOfficial: false
      },
      {
        content: 'I agree, this has been going on for weeks now.',
        complaint: createdComplaints[0]._id,
        author: createdUsers[1]._id,
        upvotes: 5,
        downvotes: 0,
        isOfficial: false
      },
      {
        content: 'We are aware of this issue and working on a solution. Expected resolution time: 48 hours.',
        complaint: createdComplaints[0]._id,
        author: createdUsers[2]._id,
        upvotes: 25,
        downvotes: 1,
        isOfficial: true
      },
      {
        content: 'Thank you for reporting this. The elevator has been fixed and is now operational.',
        complaint: createdComplaints[1]._id,
        author: createdUsers[2]._id,
        upvotes: 18,
        downvotes: 0,
        isOfficial: true
      }
    ];

    const createdComments = await Comment.insertMany(sampleComments);
    console.log(`✅ Created ${createdComments.length} comments`);

    // Update complaints with comment references
    await Complaint.findByIdAndUpdate(createdComplaints[0]._id, {
      comments: [createdComments[0]._id, createdComments[1]._id, createdComments[2]._id]
    });
    await Complaint.findByIdAndUpdate(createdComplaints[1]._id, {
      comments: [createdComments[3]._id]
    });

    // Create sample votes
    console.log('👍 Creating sample votes...');
    const sampleVotes = [
      {
        user: createdUsers[0]._id,
        targetType: 'complaint',
        targetId: createdComplaints[0]._id,
        voteType: 'upvote'
      },
      {
        user: createdUsers[1]._id,
        targetType: 'complaint',
        targetId: createdComplaints[0]._id,
        voteType: 'upvote'
      },
      {
        user: createdUsers[0]._id,
        targetType: 'complaint',
        targetId: createdComplaints[1]._id,
        voteType: 'upvote'
      },
      {
        user: createdUsers[1]._id,
        targetType: 'complaint',
        targetId: createdComplaints[1]._id,
        voteType: 'upvote'
      },
      {
        user: createdUsers[0]._id,
        targetType: 'comment',
        targetId: createdComments[0]._id,
        voteType: 'upvote'
      },
      {
        user: createdUsers[1]._id,
        targetType: 'comment',
        targetId: createdComments[0]._id,
        voteType: 'upvote'
      }
    ];

    const createdVotes = await Vote.insertMany(sampleVotes);
    console.log(`✅ Created ${createdVotes.length} votes`);

    // Create sample notifications
    console.log('🔔 Creating sample notifications...');
    const sampleNotifications = [
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[2]._id,
        type: 'complaint_assigned',
        title: 'Complaint Assigned',
        message: 'Your Wi-Fi complaint has been assigned to the IT department.',
        targetType: 'complaint',
        targetId: createdComplaints[0]._id,
        priority: 'medium'
      },
      {
        recipient: createdUsers[0]._id,
        type: 'badge_earned',
        title: 'Badge Earned!',
        message: 'Congratulations! You earned the "Problem Solver" badge.',
        targetType: 'user',
        targetId: createdUsers[0]._id,
        priority: 'medium'
      },
      {
        recipient: createdUsers[1]._id,
        sender: createdUsers[2]._id,
        type: 'complaint_resolved',
        title: 'Complaint Resolved',
        message: 'Your elevator complaint has been resolved.',
        targetType: 'complaint',
        targetId: createdComplaints[1]._id,
        priority: 'high'
      }
    ];

    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // Display database summary
    console.log('\n📊 Database Initialization Complete!');
    console.log('=====================================');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📝 Complaints: ${await Complaint.countDocuments()}`);
    console.log(`💬 Comments: ${await Comment.countDocuments()}`);
    console.log(`🏆 Badges: ${await Badge.countDocuments()}`);
    console.log(`👍 Votes: ${await Vote.countDocuments()}`);
    console.log(`🔔 Notifications: ${await Notification.countDocuments()}`);

    console.log('\n🔑 Test Credentials:');
    console.log('Student 1: alex.johnson@university.edu / password123');
    console.log('Student 2: sarah.wilson@university.edu / password123');
    console.log('Admin: admin@university.edu / admin123');

    await mongoose.connection.close();
    console.log('\n✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

initializeDatabase(); 