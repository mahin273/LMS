# Learning Management System (LMS) with Gamified Badges

A full-stack Learning Management System designed to enhance student engagement through gamification. This platform allows instructors to manage courses, lessons, and assignments, while students can track their progress and earn badges.

## Features

- **User Authentication:** Secure registration and login using JWT.
- **Course Management:** Create, update, and manage courses.
- **Lesson Delivery:** Structured lessons within courses.
- **Assignments & Submissions:** Students can submit assignments, and instructors can grade them.
- **Gamification:** Students earn badges for achievements and milestones.
- **File Uploads:** Support for assignment attachments.
- **Role-Based Access Control:** Separate interfaces/permissions for Admin/Instructors and Students.

## Technologies Used

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Validation:** Joi
- **Security:** Helmet, Express Rate Limit, CORS
- **File Handling:** Multer

### Frontend
- **Core:** HTML5, CSS3, JavaScript (Vanilla)
- **Serving:** http-server (for development)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    ```

### Configuration

**Backend:**
1.  Navigate to the `backend` directory.
2.  Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```
3.  Update the `MONGODB_URI` and `JWT_SECRET` values in `.env` if necessary.

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    # For development (with hot-reload)
    npm run dev
    # Or for production
    npm start
    ```
    The server will start on port specified in `.env` (default: 5000).

2.  **Seed the Database (Optional):**
    To populate the database with initial data:
    ```bash
    npm run seed
    ```

3.  **Start the Frontend:**
    Open a new terminal window:
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend will be served at `http://localhost:5500`.

## Project Structure

```
├── backend/            # Express.js API
│   ├── src/
│   │   ├── config/     # Database and other configurations
│   │   ├── controllers/# Route controllers
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   └── uploads/        # User uploaded files
│
├── frontend/           # Static Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side logic
│   └── pages/          # HTML pages
└── README.md
```

## API Documentation

The backend API runs at `http://localhost:5000/api`. Key endpoints include:

-   `AUTH`: `/auth/register`, `/auth/login`
-   `COURSES`: `/courses`
-   `LESSONS`: `/lessons`
-   `ASSIGNMENTS`: `/assignments`
-   `SUBMISSIONS`: `/submissions`
-   `USERS`: `/users`
