import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV_VARS } from './config/envVars.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

 
connectDB();

 
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

 
if (ENV_VARS.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

 
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

 
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);


const adminDistPath = path.join(__dirname, 'admin_frontend', 'dist');
app.use('/admin', express.static(adminDistPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'));
});

const userDistPath = path.join(__dirname, 'user_frontend', 'dist');
app.use(express.static(userDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(userDistPath, 'index.html'));
});


app.use(errorHandler);


const PORT = ENV_VARS.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV_VARS.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
