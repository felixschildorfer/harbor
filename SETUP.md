# Setup Guide - Harbor

Quick reference for setting up the development environment.

## Prerequisites

- **Node.js** v18+ (check: `node --version`)
- **npm** v9+ (check: `npm --version`)
- **MongoDB** (local or [Atlas Cloud](https://www.mongodb.com/cloud/atlas))
- **Git**

## Installation

### 1. Clone & Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

### 2. Configure MongoDB

**Local MongoDB (default):**
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- `.env` in `server/` is pre-configured for local: `MONGODB_URI=mongodb://localhost:27017/harbor`

**Cloud (MongoDB Atlas):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Edit `server/.env`: Update `MONGODB_URI` with your Atlas string
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harbor
   ```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Output: Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Output: VITE vX.X.X ready in ... ms
#         ➜ Local: http://localhost:5173
```

### 4. Open in Browser

- Navigate to **http://localhost:5173**

## Environment Variables

### Backend (`server/.env`)

```bash
MONGODB_URI=mongodb://localhost:27017/harbor  # Local or Atlas connection string
PORT=5000                                     # Server port
NODE_ENV=development                          # Environment
```

### Frontend

- No `.env` file needed
- API base URL hardcoded: `http://localhost:5000/api` (in `client/src/services/api.js`)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"MongoDB connection failed"** | MongoDB is optional for dev. Backend starts anyway. Start MongoDB or use Atlas. |
| **"Port 5000 already in use"** | Change `PORT` in `server/.env` or kill the process using port 5000. |
| **"Port 5173 already in use"** | Vite auto-picks next port. Check terminal output for actual port. |
| **"Cannot connect to localhost:5000"** | Verify backend is running. Check firewall/CORS settings. |
| **npm install fails** | Delete `node_modules/` and `package-lock.json`, then re-run `npm install`. |

## Next Steps

- See [README.md](./README.md) for project overview and API documentation
- See [client/README.md](./client/README.md) for frontend-specific info
- See [QUICK_START.md](./QUICK_START.md) for quick usage guide

## Tips

- Use `npm run dev` in both directories simultaneously (split terminal)
- Hot Module Reloading (HMR) is enabled on frontend—changes auto-refresh
- Backend auto-restarts on file changes (via `--watch` flag)
- Keep `.env` files out of git (already in `.gitignore`)

---

**Happy developing!** 🚀

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

