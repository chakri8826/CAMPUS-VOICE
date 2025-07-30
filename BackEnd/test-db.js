import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { ENV_VARS } from './config/envVars.js';

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📡 MONGO_URI:', ENV_VARS.MONGO_URI || 'NOT SET');
    
    if (!ENV_VARS.MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env file!');
      return;
    }

    const conn = await mongoose.connect(ENV_VARS.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.model('Test', TestSchema);

    // Create a test document
    const testDoc = new TestModel({
      name: 'Connection Test',
      timestamp: new Date()
    });

    await testDoc.save();
    console.log('✅ Test document saved successfully!');

    // Retrieve the document
    const retrieved = await TestModel.findOne({ name: 'Connection Test' });
    console.log('✅ Test document retrieved:', retrieved);

    // Clean up
    await TestModel.deleteOne({ name: 'Connection Test' });
    console.log('✅ Test document cleaned up');

    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection(); 