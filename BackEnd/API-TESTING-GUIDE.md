# Campus Voice Backend API Testing Guide

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

### 2. Run Automated Tests
```bash
node test-backend.js
```

### 3. Manual Testing with curl
```bash
# On Windows (PowerShell)
./quick-test.sh

# Or use individual curl commands below
```

## 📋 API Endpoints Overview

### Base URL: `http://localhost:5000/api`

## 🔐 Authentication Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "studentId": "STU001",
    "department": "Computer Science",
    "year": 3
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update User Details
```bash
curl -X PUT http://localhost:5000/api/auth/updatedetails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Updated",
    "department": "Electrical Engineering"
  }'
```

### 6. Update Password
```bash
curl -X PUT http://localhost:5000/api/auth/updatepassword \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 7. Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

## 📝 Complaint Endpoints

### 1. Create Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Broken Air Conditioner",
    "description": "The AC in Room 201 is not working properly",
    "category": "facilities",
    "subcategory": "maintenance",
    "priority": "high",
    "location": {
      "building": "Main Building",
      "floor": "2nd Floor",
      "room": "Room 201"
    },
    "tags": ["ac", "maintenance", "urgent"]
  }'
```

### 2. Get All Complaints
```bash
curl -X GET "http://localhost:5000/api/complaints?page=1&limit=10&category=facilities&status=pending"
```

### 3. Get Single Complaint
```bash
curl -X GET http://localhost:5000/api/complaints/COMPLAINT_ID_HERE
```

### 4. Update Complaint
```bash
curl -X PUT http://localhost:5000/api/complaints/COMPLAINT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "in_progress",
    "priority": "urgent",
    "resolutionNotes": "Technician assigned"
  }'
```

### 5. Delete Complaint
```bash
curl -X DELETE http://localhost:5000/api/complaints/COMPLAINT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Vote on Complaint
```bash
curl -X POST http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "voteType": "upvote"
  }'
```

### 7. Get User's Complaints
```bash
curl -X GET "http://localhost:5000/api/complaints/user/me?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Get Complaints by Department
```bash
curl -X GET "http://localhost:5000/api/complaints/department/Computer%20Science?page=1&limit=10"
```

## 👥 User Management Endpoints

### 1. Get All Users (Admin)
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10&role=student" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Get User by ID
```bash
curl -X GET http://localhost:5000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Update User (Admin)
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "role": "faculty",
    "isActive": true
  }'
```

### 4. Delete User (Admin)
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🗳️ Voting Endpoints

### 1. Add Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "targetType": "complaint",
    "targetId": "COMPLAINT_ID_HERE",
    "voteType": "upvote"
  }'
```

### 2. Get Vote Count
```bash
curl -X GET "http://localhost:5000/api/votes/count?targetType=complaint&targetId=COMPLAINT_ID_HERE"
```

### 3. Get User's Vote
```bash
curl -X GET "http://localhost:5000/api/votes/user?targetType=complaint&targetId=COMPLAINT_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 💬 Comment Endpoints

### 1. Add Comment
```bash
curl -X POST http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "This is a helpful comment",
    "isAnonymous": false
  }'
```

### 2. Get Comments
```bash
curl -X GET "http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/comments?page=1&limit=10"
```

### 3. Update Comment
```bash
curl -X PUT http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/comments/COMMENT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Updated comment content"
  }'
```

### 4. Delete Comment
```bash
curl -X DELETE http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/comments/COMMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Admin Endpoints

### 1. Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Get All Complaints (Admin)
```bash
curl -X GET "http://localhost:5000/api/admin/complaints?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Assign Complaint
```bash
curl -X PUT http://localhost:5000/api/admin/complaints/COMPLAINT_ID_HERE/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "assignedTo": "USER_ID_HERE"
  }'
```

### 4. Update Complaint Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/complaints/COMPLAINT_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "resolved",
    "resolutionNotes": "Issue has been fixed"
  }'
```

## 📊 Testing Checklist

### ✅ Basic Functionality
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] MongoDB connection established
- [ ] CORS is working
- [ ] Rate limiting is active

### ✅ Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token generation works
- [ ] Protected routes require authentication
- [ ] Password hashing works
- [ ] Password reset functionality works

### ✅ Complaint Management
- [ ] Create complaint works
- [ ] Get all complaints works
- [ ] Get single complaint works
- [ ] Update complaint works
- [ ] Delete complaint works
- [ ] Vote on complaint works
- [ ] Filtering and pagination work

### ✅ User Management
- [ ] Get user profile works
- [ ] Update user details works
- [ ] Admin can manage users
- [ ] Role-based access control works

### ✅ Advanced Features
- [ ] File uploads work
- [ ] Notifications are sent
- [ ] Badge assignment works
- [ ] Comments system works
- [ ] Search functionality works

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check your `.env` file
   - Ensure MongoDB Atlas is accessible
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET in `.env`
   - Ensure token is being sent in Authorization header
   - Verify token expiration

3. **CORS Errors**
   - Check CORS configuration in server.js
   - Ensure frontend URL is in allowed origins

4. **File Upload Issues**
   - Check uploads directory exists
   - Verify file size limits
   - Check file type restrictions

### Debug Commands:

```bash
# Check server logs
npm run dev

# Test specific endpoint
curl -v -X GET http://localhost:5000/api/health

# Check MongoDB connection
node -e "require('./config/db')"

# Test environment variables
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

## 📈 Performance Testing

### Load Testing with Apache Bench:
```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:5000/api/health

# Test complaints endpoint
ab -n 100 -c 5 http://localhost:5000/api/complaints
```

### Memory Usage:
```bash
# Monitor Node.js process
node --inspect server.js
```

## 🎯 Success Criteria

Your backend is working correctly if:

1. ✅ All automated tests pass
2. ✅ No errors in server logs
3. ✅ All endpoints return proper HTTP status codes
4. ✅ Database operations work correctly
5. ✅ Authentication and authorization work
6. ✅ File uploads work (if implemented)
7. ✅ Rate limiting is active
8. ✅ Error handling works properly

## 📞 Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify your `.env` configuration
3. Test individual endpoints with curl
4. Check MongoDB connection
5. Review the troubleshooting section above

---

**Happy Testing! 🚀** 