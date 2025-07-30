import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// logs the details of each request
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ENV_VARS } from './config/envVars.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
 

const app = express();
 
connectDB();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: ENV_VARS.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

 
// const limiter = rateLimit({
//   windowMs: parseInt(ENV_VARS.RATE_LIMIT_WINDOW_MS) || 20 * 60 * 1000, // 15 minutes
//   max: parseInt(ENV_VARS.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

 
if (ENV_VARS.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

 
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Health check endpoint


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = ENV_VARS.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV_VARS.NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app; 