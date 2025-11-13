# Harbor

A modern full-stack application with React frontend and MongoDB backend.

## Project Structure

```
harbor/
├── client/          # React frontend
├── server/          # Node.js/Express backend
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher) ✅ (You have v25.1.0)
- MongoDB (local installation or MongoDB Atlas account)
- npm

### Installation

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```
   ✅ Already installed!

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```
   ✅ Already installed!

### Configuration

The `.env` file is already created in the `server` directory with default settings:
```
MONGODB_URI=mongodb://localhost:27017/harbor
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `server/.env`

### Running the Application

**Terminal 1 - Start the backend:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:5173

Open http://localhost:5173 in your browser to see the app!

## Features

- ✅ React 18 with Vite
- ✅ Express.js backend
- ✅ MongoDB with Mongoose
- ✅ CORS configured
- ✅ Environment variables
- ✅ Development and production scripts

## API Endpoints

- `GET /api` - Health check
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Tech Stack

**Frontend:**
- React
- Vite
- Axios (for API calls)

**Backend:**
- Node.js
- Express.js
- Mongoose
- dotenv
- cors

## License

MIT

