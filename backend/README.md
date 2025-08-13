# Campus Voice Backend

A comprehensive Node.js backend for the Smart Campus Feedback & Complaint Portal built with Express.js, MongoDB, and Mongoose.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Complaint Management**: Full CRUD operations for campus complaints with categories and priorities
- **Comment System**: Nested comments with voting capabilities
- **Voting System**: Upvote/downvote functionality for complaints and comments
- **File Upload**: Multer-based file upload with support for images, documents, and videos
- **User Management**: Registration, authentication, and profile management
- **Badge System**: Gamification with automatic badge assignment based on user activity
- **Admin Dashboard**: Comprehensive admin panel with statistics and management tools
- **Search & Filtering**: Advanced search and filtering capabilities

- **Error Handling**: Centralized error handling with detailed logging

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with your configuration
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/campus_voice
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=30d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

3. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `POST /api/complaints/:id/vote` - Vote on complaint

### Users
- `GET /api/users/profile/:id` - Get user profile
- `GET /api/users/search` - Search users
- `PUT /api/users/avatar` - Update avatar

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/health` - Get system health

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Supports images, documents, videos, and audio files. Files are organized in subdirectories and stored with unique names.

## Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Rate Limiting
- Input Validation
- CORS Configuration
- Security Headers with Helmet
- File Upload Security

## Performance Features

- Database Indexing
- Pagination
- Error Logging
- Response Compression

## License

MIT License 