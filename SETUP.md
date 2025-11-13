# Setup Guide - Harbor

## Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Configure MongoDB

#### Option A: Local MongoDB

1. Make sure MongoDB is installed and running on your machine
2. Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```
3. Edit `.env` and set your MongoDB connection:
   ```
   MONGODB_URI=mongodb://localhost:27017/harbor
   PORT=5000
   NODE_ENV=development
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```
5. Update `.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harbor
   PORT=5000
   NODE_ENV=development
   ```

### 4. Start the Backend Server

```bash
cd server
npm run dev
```

The server will run on http://localhost:5000

### 5. Start the Frontend

Open a new terminal window:

```bash
cd client
npm run dev
```

The frontend will run on http://localhost:5173

## Project Structure

```
harbor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # App styles
│   │   └── services/
│   │       └── api.js     # API service
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── models/
│   │   └── Item.js        # MongoDB model
│   ├── routes/
│   │   └── items.js       # API routes
│   ├── server.js          # Server entry point
│   ├── package.json
│   └── .env               # Environment variables
└── README.md
```

## API Endpoints

- `GET /api` - Health check
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Features

✅ Full CRUD operations (Create, Read, Update, Delete)
✅ React frontend with modern UI
✅ Express.js REST API
✅ MongoDB database with Mongoose
✅ Real-time updates
✅ Error handling
✅ Loading states
✅ Responsive design

## Troubleshooting

### MongoDB Connection Error

- Make sure MongoDB is running (if using local)
- Check your connection string in `.env`
- Verify network access (if using Atlas)

### Port Already in Use

- Change the port in `server/.env` (PORT=5001)
- Update the API_URL in `client/src/services/api.js`

### CORS Errors

- Make sure the backend is running
- Check that CORS is enabled in `server/server.js`

## Next Steps

1. Customize the Item model for your needs
2. Add authentication (JWT, Passport.js)
3. Add validation (Joi, express-validator)
4. Add testing (Jest, React Testing Library)
5. Deploy to production (Heroku, Vercel, AWS)

