# Harbor - AI Coding Agent Instructions

## Project Overview

Harbor is a full-stack CRUD application with a React + Vite frontend and Express + MongoDB backend. The architecture is intentionally simple and resilient: the server starts regardless of MongoDB connection status, allowing development even when the database is temporarily unavailable.

## Architecture & Data Flow

### Frontend (`/client`)
- **React 18** with **Vite** for fast development and building
- **Axios** service layer (`src/services/api.js`) centralizes all API calls using an axios instance with base URL `http://localhost:5000/api`
- Component state: items list, loading state, error state, form data, and editing mode (ID tracking)
- Pattern: Form submission triggers create/update; fetching happens on mount and after mutations

### Backend (`/server`)
- **Express.js** with ES modules (`"type": "module"` in package.json)
- **Mongoose** schemas with timestamps and validation (e.g., `status` enum: `['active', 'inactive']`)
- Error handling: MongoDB errors return JSON messages with appropriate HTTP status codes
- **CORS enabled** to allow frontend at `localhost:5173` to call `localhost:5000`

### Data Model
The `Item` schema (`/server/models/Item.js`) contains:
- `name` (required, trimmed string)
- `description` (optional, trimmed string)
- `status` (enum: 'active' | 'inactive', default 'active')
- `createdAt`, `updatedAt` (auto-timestamps)

## Development Workflow

### Quick Start Commands
```bash
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev
```

### Key Dependencies & Scripts
| Package | Role | Command |
|---------|------|---------|
| **server** | Node + Express + Mongoose | `npm run dev` (node --watch) |
| **client** | React + Vite | `npm run dev` (vite), `npm run build`, `npm run lint` |

### Environment Configuration
- Backend uses `.env` file in `/server` with `MONGODB_URI`, `PORT` (default 5000), and `NODE_ENV`
- Supports local MongoDB or MongoDB Atlas
- No frontend `.env` needed; hardcoded API base URL in `api.js`

## API Endpoints Pattern

All endpoints follow REST conventions under `/api/items`:
- `GET /api/items` - fetch all (sorted by createdAt desc)
- `GET /api/items/:id` - fetch single
- `POST /api/items` - create (returns 201)
- `PUT /api/items/:id` - update with validators
- `DELETE /api/items/:id` - delete
- `GET /api` - health check

## Code Patterns & Conventions

### Backend Error Handling
- Try-catch in route handlers
- Validation errors: 400 status
- Not-found: 404 status
- Server errors: 500 status
- Always return JSON: `{ message: error.message }`

### Frontend API Calls
Avoid direct axios calls. Use the exported `itemsAPI` object in `/client/src/services/api.js`:
```javascript
// ✅ Correct pattern
const response = await itemsAPI.getAll();
const newItem = await itemsAPI.create({ name: "...", description: "..." });

// ❌ Avoid raw axios calls in components
```

### Form Handling
The form pattern in `App.jsx` uses:
- Controlled inputs with `formData` state
- `editingId` to toggle between create and update modes
- Error state displayed to user
- Loading state disables interactions during requests

### Component Organization
- `App.jsx` contains all logic (state, API calls, rendering, forms)
- CSS styles in `App.css` using class-based selectors
- No separate component files (monolithic by design)

## Important Implementation Notes

1. **MongoDB Connection Resilience**: Server starts on port 5000 even if MongoDB is unreachable. Database connection errors are logged but don't crash the server. This is intentional for development.

2. **Mongoose Timestamps**: `timestamps: true` in schema automatically manages `createdAt` and `updatedAt`. Leverage for sorting (e.g., `GET /items` sorts by `createdAt: -1`).

3. **CORS Setup**: Middleware order matters. CORS must be applied before routes in `server.js`.

4. **Axios Interceptors**: The axios instance in `api.js` can be extended with interceptors for auth or error handling without modifying components.

5. **Vite Dev Server**: Frontend runs on port 5173 by default. Configure port in `vite.config.js` if needed.

## File Map for Quick Navigation

| File | Purpose | Key Concepts |
|------|---------|--------------|
| `/server/server.js` | Express setup, MongoDB connection, middleware | dotenv, CORS, mongoose connection events |
| `/server/routes/items.js` | CRUD endpoint implementations | Error handling patterns, async/await |
| `/server/models/Item.js` | Mongoose schema with validation | Schema definition, timestamps, enums |
| `/client/src/App.jsx` | Main React component with state & API logic | useEffect fetch, form handling, loading/error states |
| `/client/src/services/api.js` | Axios instance & itemsAPI object | Centralized API layer, axios configuration |
| `/client/package.json` | Frontend build scripts | Vite, ESLint, React version pinning |
| `/server/package.json` | Backend dependencies | Node --watch, ES modules flag |

## When Adding Features

1. **New API endpoint**: Add route in `/server/routes/items.js`, add method to `itemsAPI` object in `/client/src/services/api.js`, call from component using `itemsAPI.methodName()`
2. **New schema field**: Update `/server/models/Item.js`, add to form in `App.jsx`, update validation if needed
3. **Form changes**: Modify `formData` state shape, update `handleChange()`, and form inputs
4. **Error messaging**: Check both API response error structure and network errors (use `err.response?.data?.message || 'Fallback message'`)
