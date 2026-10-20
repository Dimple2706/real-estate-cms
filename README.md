# Real Estate CMS

A full-stack real estate content management platform featuring a luxury property website and a secure administrative dashboard.

The project demonstrates a One Chembur-inspired real estate experience, with dynamic content managed through a custom CMS.

## Live Demo

- Website: https://real-estate-cms-gray.vercel.app
- Admin Login: https://real-estate-cms-gray.vercel.app/admin/login
- Backend API: https://real-estate-cms-qtgi.onrender.com
- GitHub: https://github.com/Dimple2706/real-estate-cms

## Features

### Public Website

- Responsive real estate landing page
- Dynamic property information
- Amenities and facilities
- Connectivity and developer information
- Property image gallery
- Floor plans with document links
- Customer inquiry form
- Published-content filtering

### Admin Dashboard

- JWT-based authentication
- Project management
- Content section management
- Amenities CRUD
- Gallery CRUD
- Floor plan CRUD
- Draft and published content
- Inquiry management
- Activity logs
- Search and pagination

## Technology Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Frontend         | React, Vite, Tailwind CSS |
| Backend          | Node.js, Express          |
| Database         | PostgreSQL                |
| ORM              | Prisma                    |
| Authentication   | JWT, bcrypt               |
| Validation       | Zod                       |
| Database Hosting | Neon                      |
| Backend Hosting  | Render                    |
| Frontend Hosting | Vercel                    |

## Architecture

```text
React Frontend (Vercel)
        |
        | Axios / REST API
        v
Express Backend (Render)
        |
        | Prisma ORM
        v
PostgreSQL Database (Neon)
```

The frontend retrieves published content through REST endpoints. The administrative dashboard uses authenticated requests to create, update, publish, and delete CMS records.

## Project Structure

```text
real-estate-cms/
├── backend/
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── lib/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   └── services/
│   └── package.json
├── docs/
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   └── Real_Estate_CMS.postman_collection.json
└── README.md
```

## Local Setup

### Prerequisites

- Node.js and npm
- PostgreSQL database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Dimple2706/real-estate-cms.git
cd real-estate-cms
```

### 2. Configure Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a template.

```env
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="YOUR_RANDOM_JWT_SECRET"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="YOUR_ADMIN_EMAIL"
ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
PORT=5000
```

Do not commit real credentials.

### 3. Set Up Database

```bash
npx prisma generate
npx prisma migrate deploy
node scripts/createAdmin.js
```

### 4. Start Backend

```bash
npm run dev
```

The backend runs at the configured port.

### 5. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then run:

```bash
npm run dev
```

Open http://localhost:5173.

## API Documentation

See [API.md](docs/API.md) for endpoint details.

## Database Documentation

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for the data model overview.

## Testing

The deployed application has been manually tested for:

- Homepage content loading
- CMS content sections
- Gallery and floor plans
- Admin login
- Dashboard content retrieval
- Inquiry form submission

The repository also includes a Postman collection for API testing.

## Security

- Password hashing using bcrypt
- JWT authentication for administrative actions
- Server-side request validation
- Restricted access to draft content
- CORS configuration
- Rate limiting for sensitive endpoints
- Environment-based secrets

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

The production frontend uses `VITE_API_URL` to connect to the Render API.

## Notes

This is a demonstration project. Property descriptions, images, floor plans, and other marketing content may use illustrative data and should not be interpreted as verified real-estate listings.

## Author

Dimple Bhojwani

GitHub: https://github.com/Dimple2706
