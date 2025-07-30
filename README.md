# 🎓 Campus Voice

Campus Voice is a full-stack MERN (MongoDB, Express, React, Node.js) application that allows students to submit complaints and feedback directly to administrators. Admins can log in via a secure portal, view and manage all student issues, and mark them as resolved.

---

## 🌟 Features

### 🧑‍🎓 Student Portal
- Register and log in securely using JWT authentication
- Submit complaints or issues related to campus, academics, facilities, etc.
- Track status of submitted complaints (Pending / Resolved)
- Clean, responsive UI for ease of use

### 🛡️ Admin Portal
- Admin login with protected routes
- View a dashboard of all complaints submitted by students
- Filter complaints by status (Pending / Resolved)
- Mark issues as resolved with optional feedback

---

## 🧰 Tech Stack

- **Frontend:** React, Tailwind CSS / Bootstrap, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Token)
- **Deployment:** Render / Vercel / Netlify (optional)

---

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](https://github.com/chakri8826/CAMPUS-VOICE/blob/ac2ab51845ff61cb9cd3cfeb1d8954c521d9a326/Student%20Dashboard.png)

### Student Complaint
![Student Complaint](https://github.com/chakri8826/CAMPUS-VOICE/blob/ac2ab51845ff61cb9cd3cfeb1d8954c521d9a326/Submit%20Complaint.png)

### Admin Dashboard
![Admin Dashboard](https://github.com/chakri8826/CAMPUS-VOICE/blob/ac2ab51845ff61cb9cd3cfeb1d8954c521d9a326/Admin%20Dashboard.png)

### Admin Panel
![Admin Panel](https://github.com/chakri8826/CAMPUS-VOICE/blob/ac2ab51845ff61cb9cd3cfeb1d8954c521d9a326/Admin%20Panel.png)

---


## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB database (local or MongoDB Atlas)
- `.env` file with the following variables:
  ```env
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  PORT=5000
