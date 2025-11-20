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

## Features & Usage

### Core Features
- ✅ **Create Anchor Models** - Upload XML files or paste content directly
- ✅ **View Models** - Grid display with version tracking and metadata
- ✅ **Edit in Anchor Editor** - Launch full modeling tool in new tab with auto-save
- ✅ **Update Models** - Modify name and/or XML content with version tracking
- ✅ **Rename Models** - Quick rename without incrementing version
- ✅ **Delete Models** - Remove with confirmation protection
- ✅ **Export Models** - Download as XML files with version in filename
- ✅ **Drag-and-Drop** - Upload XML files by dragging into create modal
- ✅ **Model Versioning** - Auto-increment on XML changes, track history
- ✅ **Comprehensive Testing** - 100+ tests (Jest backend, Vitest frontend)
- ✅ **Database Integration** - Connect to SQL Server and execute queries directly
- ✅ **Multi-Database Support** - Manage multiple database connections
- ✅ **SQL Execution** - Run read/write queries with results display

### Creating Models
1. Click **"Upload Model"** button in sidebar
2. Enter model name (required)
3. Upload XML file OR paste XML content (required)
4. Supports drag-and-drop file upload
5. Click **"Upload Model"** button in the modal to save

### Creating New Models in Editor
1. Click **"Create Model"** button in sidebar
2. Anchor Modeler opens with a single blank anchor
3. Design your model visually
4. Save to Harbor when ready

### Editing Models
1. Right-click on a model card
2. Select **"Edit"** from the context menu
3. Anchor Modeler opens with your model loaded
4. Modify the model visually
5. Save changes - automatically syncs back to Harbor
6. Version auto-increments on XML changes
7. List updates with new version number

### Renaming Models
1. Right-click on a model card
2. Select **"Rename"** from the context menu
3. Enter new name in modal
4. Click **"Rename"** button
5. Does NOT increment version number

### Deleting Models
1. Right-click on a model card
2. Select **"Delete"** from the context menu
3. Confirm in dialog
4. Model removed immediately
5. Cannot be undone

### Exporting Models
1. Right-click on a model card
2. Select **"Export"** from the context menu
3. File downloads automatically: `ModelName_v<version>.xml`
4. Contains complete XML content
5. Can be used externally or imported to another Harbor instance

### Database Integration

Harbor now supports direct database connectivity for executing SQL queries.

**Managing Database Connections:**
1. Click **"🗄️ DB Connections"** in sidebar
2. Click **"+ New Connection"** button
3. Fill in connection details (host, port, database, credentials)
4. Click **"Create Connection"**
5. Test connection validity with **"Test"** button
6. Edit or delete connections as needed

**Executing SQL Queries:**
1. Click **"⚡ Execute SQL"** in sidebar
2. Select a database connection from dropdown
3. Enter SQL query (SELECT, INSERT, UPDATE, DELETE, DDL)
4. Click **"▶ Execute Query"**
5. View results in table format with execution metadata

**Supported Operations:**
- Read operations (SELECT)
- Write operations (INSERT, UPDATE, DELETE)
- DDL statements (CREATE, ALTER, DROP)
- Stored procedure execution

**Security Features:**
- Encrypted password storage (AES-256)
- SQL injection pattern detection
- Query execution auditing
- Connection-level authentication

📖 **Detailed Documentation:** See [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) for complete guide

## Testing

Harbor includes comprehensive test coverage for quality assurance and future maintenance.

### Running Tests

**Backend Tests:**
```bash
cd server
npm install  # First time only
npm test
```

**Frontend Tests:**
```bash
cd client
npm install  # First time only
npm test              # Run tests
npm run test:ui       # Visual test runner
npm run test:coverage # Coverage report
```

### Test Structure

**Backend (Jest + Supertest)** - `server/routes/anchorModels.test.js`
- 35+ tests covering all 5 API endpoints
- CRUD operations, validation, error handling
- Edge cases: invalid IDs, missing fields, malformed JSON

**Frontend (Vitest + React Testing Library)**
- `client/src/App.test.jsx` - 40+ integration tests
- `client/src/components/ModelCard.test.jsx` - 10 component tests
- `client/src/components/CreateModal.test.jsx` - 20 form & validation tests
- `client/src/components/DeleteConfirmModal.test.jsx` - 10 confirmation tests
- `client/src/components/RenameModal.test.jsx` - 15 rename interaction tests

Total coverage: **100+ test cases** ensuring reliability and maintainability.

## API Endpoints

```
GET    /api                          # Health check
GET    /api/anchor-models            # List all anchor models (sorted by creation date, newest first)
POST   /api/anchor-models            # Create new anchor model
GET    /api/anchor-models/:id        # Get anchor model by ID
PUT    /api/anchor-models/:id        # Update anchor model (name and/or xmlContent)
DELETE /api/anchor-models/:id        # Delete anchor model
```

**Request/Response Format:**
```javascript
POST /api/anchor-models
{
  "name": "Customer Entity",
  "xmlContent": "<schema>...</schema>"
}

Response (201 Created):
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Customer Entity",
  "xmlContent": "<schema>...</schema>",
  "version": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Project Structure

```
harbor/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main component: model list and CRUD modals
│   │   ├── App.test.jsx       # Integration tests (~40 tests)
│   │   ├── components/
│   │   │   ├── ModelCard.jsx     # Individual model card display
│   │   │   ├── CreateModal.jsx   # Create/upload modal with drag-drop
│   │   │   ├── DeleteConfirmModal.jsx  # Delete confirmation
│   │   │   ├── RenameModal.jsx   # Rename input modal
│   │   │   └── *.test.jsx      # Component tests
│   │   ├── services/
│   │   │   └── api.js         # Axios API client for anchor models
│   │   └── styles/
│   ├── public/
│   │   └── anchor/            # Anchor Modeler (static files)
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js       # Vitest configuration for React tests
├── server/                     # Express backend + MongoDB
│   ├── models/
│   │   └── AnchorModel.js     # Mongoose schema (name, xmlContent, version)
│   ├── routes/
│   │   ├── anchorModels.js    # API route handlers (CRUD)
│   │   └── anchorModels.test.js  # Backend tests (~35 tests)
│   ├── server.js              # Entry point
│   ├── package.json
│   ├── jest.config.js         # Jest configuration for backend tests
│   └── .env                   # Configuration (MONGODB_URI, PORT)
├── SETUP.md                   # Setup and testing instructions
├── CODE_REVIEW.md             # Code quality analysis
├── MERGE_CHECKLIST.md         # Pre-merge verification
├── README.md                  # This file
└── scripts/
    └── sync-anchor-to-client.sh  # Sync Anchor files to frontend
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

## Anchor Modeler Version Management

Harbor supports **dual-bundle architecture** to manage multiple versions of Anchor Modeler simultaneously:

### Overview

- **Test Version (v0.100.1)**: Located in `/public/anchor/` - Latest features, updated monthly
- **Production Version (v0.99.16)**: Located in `/public/anchor-prod/` - Stable, updated every few years

Each model is created with a specific Anchor version, and when you edit it, the corresponding version is automatically loaded.

### Version Selection

When creating a new model in Harbor:
1. Fill in the model name and XML content
2. **Select an Anchor version:**
   - **Newest Test Version (v0.100.1)**: Latest features and fixes (recommended for new development)
   - **Production Release (v0.99.16)**: Stable, widely tested version (for production stability)
3. The model will always open with the selected version

### Version Badge

Model cards display a version badge:
- **Blue badge ("Test")**: Using the test version
- **Green badge ("Production")**: Using the production version

### Updating Anchor Versions

#### Monthly Test Version Updates

When Anchor upstream releases updates:

```bash
# In the /anchor repository (test version)
git fetch upstream
git merge upstream/main
# Resolve any conflicts with custom modifications
npm run build  # If build step exists
```

Then copy to Harbor:
```bash
cp -r /path/to/anchor/* /path/to/harbor/client/public/anchor/
```

#### Production Version Updates (Rare)

The production version is rarely updated but follows the same process:

```bash
# In the /anchor-prod repository (production version, on v0.99.16 tag)
# Only merge critical security or essential fixes
# Then copy to Harbor:
cp -r /path/to/anchor-prod/* /path/to/harbor/client/public/anchor-prod/
```

### Custom Modifications

Both Anchor versions include Harbor integration:
- **index.html** parameters: `modelId=<id>` to load from Harbor
- **SQL fixes**: Template syntax corrections for code generation
- **Save to Harbor**: "Save model to Harbor..." menu option

When merging upstream updates, re-apply these customizations to maintain Harbor integration.

### Architecture Benefits

- ✅ **No startup slowdown**: Both versions bundled locally
- ✅ **Model version persistence**: Models always use their original version
- ✅ **Clean separation**: Easy to manage test and production independently
- ✅ **Safe testing**: Try new features without affecting production models

## Development & Branching Strategy

### Main Branch
The `main` branch contains the latest stable release with all tested features.

### Feature Branches

#### Frontend Redesign (`feature/frontend-redesign`)
A dedicated branch for modernizing the Harbor UI/UX without affecting stability.

**Redesign Goals:**
- Modernize visual design and styling
- Improve layout and navigation
- Implement React 18 best practices
- Enhance user experience with better feedback
- Maintain full backend API compatibility

**Redesign Scope:**
- Visual design updates
- Component structure improvements
- Better form and modal designs
- Enhanced responsive design
- Improved accessibility

**What's NOT Included:**
- API endpoint changes
- Database schema changes
- Breaking changes to core functionality
- Experimental/unfinished features

See [REDESIGN_CHECKLIST.md](REDESIGN_CHECKLIST.md) for detailed redesign tasks and progress tracking.

## Documentation

For additional information:
- **[SETUP.md](SETUP.md)** - Detailed setup and testing instructions
- **[REDESIGN_CHECKLIST.md](REDESIGN_CHECKLIST.md)** - Frontend redesign tasks and checklist

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

