# Backend API

This is the backend API for the recruitment website.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

3. Start the server:
```bash
npm start
```

The server will run on port 3321.

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job (protected)
- `PUT /api/jobs/:id` - Update a job (protected)
- `DELETE /api/jobs/:id` - Delete a job (protected)

### Applications
- `POST /api/applications` - Submit a job application

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (protected)
- `PATCH /api/admin/users/:id/role` - Update user role (protected)
- `DELETE /api/admin/users/:id` - Delete user (protected)
- `POST /api/admin/setup` - Create first admin user

### Users
- `POST /api/users/register` - User registration

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
``` 