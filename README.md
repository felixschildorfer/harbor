# Harbor

A full-stack CRUD application for managing Anchor database models. Built with **React + Vite** frontend and **Express + MongoDB** backend, with integrated **Anchor Modeler** for XML-based database design.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Harbor (React + Vite) @ http://localhost:5173           │
│ • Create/manage Anchor models                           │
│ • Upload XML files or use built-in editor               │
│ • Launch Anchor Modeler in new tab for advanced editing │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────────┐
│ Harbor Backend (Express) @ http://localhost:5000        │
│ • CRUD endpoints: GET, POST, PUT, DELETE                │
│ • MongoDB persistence                                   │
│ • CORS enabled for localhost:5173                       │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Anchor Modeler (standalone) @ http://localhost:5173/... │
│ • Full-featured database modeling tool                  │
│ • Opens in separate browser tab from Harbor             │
│ • Design anchors, ties, knots, attributes independently│
│ • Export XML to save locally or reimport to Harbor      │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm**

### Setup (2 min)

1. **Backend:**
   ```bash
   cd server && npm install && npm run dev
   ```
   Runs on `http://localhost:5000`

2. **Frontend (new terminal):**
   ```bash
   cd client && npm install && npm run dev
   ```
   Runs on `http://localhost:5173`

3. **Open in browser:** http://localhost:5173

### MongoDB Configuration

**Local MongoDB (default):**
- `.env` in `server/` is pre-configured: `MONGODB_URI=mongodb://localhost:27017/harbor`
- Start MongoDB service: `brew services start mongodb-community` (macOS) or follow your OS guide

**Cloud (MongoDB Atlas):**
- Get connection string from [Atlas Dashboard](https://www.mongodb.com/cloud/atlas)
- Update `MONGODB_URI` in `server/.env`

## Features

- ✅ **React 18 + Vite**: Fast HMR development
- ✅ **Express REST API**: Clean CRUD endpoints
- ✅ **MongoDB + Mongoose**: Flexible document storage with validation
- ✅ **Anchor Editor Integration**: Launch full modeling tool in new tab
- ✅ **XML Import/Export**: Load and save Anchor models as XML
- ✅ **Built-in Editor**: Quick text editor for XML in Harbor UI
- ✅ **CORS & Error Handling**: Secure cross-origin requests with detailed messages
- ✅ **Development Resilience**: Backend starts even if MongoDB is offline

## API Endpoints

```
GET    /api                    # Health check
GET    /api/items              # List all models (sorted by creation date, newest first)
POST   /api/items              # Create new model
GET    /api/items/:id          # Get model by ID
PUT    /api/items/:id          # Update model
DELETE /api/items/:id          # Delete model
```

## Project Structure

```
harbor/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main component: model list, modals
│   │   ├── components/
│   │   │   └── AnchorEditor.jsx # Built-in XML editor
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   └── styles/
│   ├── public/
│   │   └── anchor/            # Anchor Modeler (static files)
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express backend + MongoDB
│   ├── models/
│   │   └── AnchorModel.js     # Mongoose schema
│   ├── routes/
│   │   └── anchorModels.js    # API route handlers
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # Configuration
├── scripts/
│   └── sync-anchor-to-client.sh  # Sync Anchor files to frontend
└── README.md
```

## Using the Anchor Modeler

1. **In Harbor UI:** Click **"✏️ Open Anchor Editor"** button
2. **New Tab Opens:** Full Anchor Modeler appears at `/anchor/index.html`
3. **Design Your Model:** Add anchors, ties, knots, attributes
4. **Save/Export:** Use Anchor's menu to export XML
5. **Import to Harbor:** Copy XML and paste into Harbor's form, or upload file

## Development

### Frontend Development

```bash
cd client
npm run dev       # Start Vite dev server with HMR
npm run build     # Build for production
npm run lint      # ESLint checks
```

### Backend Development

```bash
cd server
npm run dev       # Start with auto-restart (--watch)
```

### Syncing Anchor Updates

If you update the Anchor repository files:

```bash
cd client
npm run sync-anchor
```

This rsyncs `../anchor/` → `client/public/anchor/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Cannot connect to localhost:5173"** | Ensure `cd client && npm run dev` is running. Vite may use port 5174 if 5173 is in use. |
| **"Cannot connect to localhost:5000"** | Ensure `cd server && npm run dev` is running. |
| **"MongoDB connection failed"** | This is OK during development—backend still starts. Start MongoDB or use Atlas. |
| **Anchor editor doesn't load** | Refresh the browser tab. Check DevTools → Network tab for 404 errors on `/anchor/` resources. |
| **Anchor UI not responding to clicks** | Make sure the browser has focus on the Anchor tab. |

## License

MIT

