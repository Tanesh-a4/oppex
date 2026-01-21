# Oppex Authentication System

A full-stack authentication system with email verification.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Node.js   │────▶│   Quarkus│────▶│   Neon DB │
│  Frontend   │     │  Middleware │     │   Backend   │     │  PostgreSQL │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     :3001              :3000               :8080              Cloud
```

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | React + Vite + React Router          |
| Middleware | Node.js + Express + express-session  |
| Backend    | Quarkus + Hibernate Panache + BCrypt |
| Database   | Neon DB (Serverless PostgreSQL)      |
| Email      | Nodemailer                           |

## Project Structure

```
oppex/
├── frontend/          # React application
├── middleware/        # Node.js Express server
├── backend/           # Quarkus Java application
├── database/          # SQL schemas
└── README.md
```

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Neon DB account (https://neon.tech)

## Local Development

### 1. Database Setup

1. Create a Neon DB project at https://neon.tech
2. Run the schema from `database/schema.sql`
3. Copy the connection string

### 2. Backend (Quarkus)

```bash
cd backend
# Update application.properties with Neon DB connection
mvn quarkus:dev
```

### 3. Middleware (Node.js)

```bash
cd middleware
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

### 4. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Middleware (.env)

```
SESSION_SECRET=your-secret-key
QUARKUS_URL=http://localhost:8080
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

### Backend (application.properties)

```
quarkus.datasource.jdbc.url=jdbc:postgresql://your-neon-host/neondb?sslmode=require
quarkus.datasource.username=your-username
quarkus.datasource.password=your-password
```

## API Endpoints

### Middleware (Port 3000)

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/signup        | Register new user |
| POST   | /api/login         | Authenticate user |
| POST   | /api/logout        | End session       |
| GET    | /api/me            | Get current user  |
| GET    | /api/verify/:token | Verify email      |

### Backend (Port 8080)

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| POST   | /api/users/register      | Create user          |
| POST   | /api/users/login         | Validate credentials |
| GET    | /api/users/verify/:token | Mark email verified  |

## Testing

```bash
# Backend tests
cd backend && mvn test

# Middleware tests
cd middleware && npm test

# Frontend tests
cd frontend && npm test
```

## Deployment (AWS EC2)

See deployment documentation for AWS Free Tier setup instructions.

## License

MIT
