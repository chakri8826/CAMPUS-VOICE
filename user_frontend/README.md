# CampusVoice User Frontend

## Features

### Complaint Management
- **View Complaints**: Browse all complaints with voting and commenting functionality
- **Submit Complaints**: Create new complaints with categories, priorities, and file attachments
- **Edit Complaints**: Edit your own complaints using the three-dots menu
- **Delete Complaints**: Delete your own complaints with confirmation dialog

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes for authenticated users

### Voting System
- Like/dislike complaints
- Real-time vote count updates
- User vote tracking

### Comments
- Add comments to complaints
- View all comments for each complaint
- Expandable comment sections

## New Features (Edit & Delete)

### Three-Dots Menu
- **Location**: Top-right corner of each complaint card (only visible to complaint owner)
- **Functionality**: 
  - Edit complaint details
  - Delete complaint with confirmation

### Edit Complaint
- **Access**: Click the three-dots menu → Edit
- **Editable Fields**:
  - Title
  - Description
  - Category
  - Priority
  - File attachments
- **API**: Uses `PUT /api/complaints/:id` endpoint

### Delete Complaint
- **Access**: Click the three-dots menu → Delete
- **Confirmation**: Modal dialog to confirm deletion
- **API**: Uses `DELETE /api/complaints/:id` endpoint

## Technical Details

### API Endpoints Used
- `GET /api/complaints` - Fetch complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `POST /api/votes` - Vote on complaints

### State Management
- Redux for authentication state
- Local state for complaints, votes, and UI interactions
- Real-time updates for complaint modifications

### Security
- JWT token authentication required for edit/delete operations
- User can only edit/delete their own complaints
- Backend validation ensures data integrity

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Make sure the backend server is running on `http://localhost:5000`

## Usage

1. **Login/Register** to access complaint management features
2. **Browse complaints** on the dashboard
3. **Submit new complaints** using the "Submit Complaint" button
4. **Edit your complaints** using the three-dots menu on complaint cards
5. **Delete your complaints** with confirmation dialog
6. **Vote and comment** on any complaint

## File Structure

```
src/
├── components/
│   ├── ComplaintCard.jsx      # Complaint display with edit/delete
│   ├── Modal.jsx             # Modal dialogs
│   ├── Toast.jsx             # Notification system
│   └── ...
├── pages/
│   ├── Dashboard.jsx         # Main dashboard with complaint management
│   └── ...
└── features/
    └── auth/
        └── authSlice.js      # Authentication state management
```

## Troubleshooting

### Edit/Delete Menu Not Visible
- Ensure you are logged in
- Check that you are the owner of the complaint
- Verify the complaint has a valid `submittedBy` field

### API Errors
- Check browser console for error messages
- Verify backend server is running
- Ensure JWT token is valid and not expired

### State Issues
- Check Redux DevTools for authentication state
- Verify complaint data structure matches expected format
- Clear browser storage if authentication issues persist
