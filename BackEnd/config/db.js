import mongoose from 'mongoose';
import { ENV_VARS } from './envVars.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
 
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB; 