# Harbor Client - React + Vite Frontend

A modern React 18 frontend for Harbor, a full-stack CRUD application for managing Anchor database models.

## Overview

Harbor Client provides a clean UI to:
- Create and manage Anchor database models
- Import/export XML
- Edit XML in a built-in editor
- Launch the full **Anchor Modeler** in a new browser tab for advanced model design

**Tech Stack:**
- React 18 with Vite (hot module reloading)
- Axios for API communication
- CSS (no additional UI framework)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Harbor backend running on `http://localhost:5000`

### Installation & Development

```bash
# Install dependencies
npm install

# Start dev server (usually http://localhost:5173)
npm run dev

# Start backend in another terminal (from repo root)
cd ../server && npm run dev
```

Both should now be running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## Project Structure

```
client/
├── src/
│   ├── App.jsx              # Main component: model list, create modal
│   ├── App.css              # App styling
│   ├── components/
│   │   └── AnchorEditor.jsx # Built-in XML editor component
│   ├── services/
│   │   └── api.js           # Axios API client (centralized API calls)
│   └── styles/
│       └── AnchorEditor.css # Editor component styles
├── public/
│   └── anchor/              # Anchor Modeler static files (synced from ../anchor/)
│       ├── index.html
│       ├── modules/         # Anchor JS modules
│       ├── application.css
│       └── [other assets]
├── package.json
├── vite.config.js
└── README.md
```

## Features

### Model Management
- **View All Models:** Displays list of saved Anchor models with version info
- **Create Model:** Modal form to name and upload/paste XML
- **Upload XML:** File picker or paste XML content
- **Built-in Editor:** Quick view and edit XML content

### Anchor Editor Integration
- **Launch in New Tab:** Click "✏️ Open Anchor Editor" to open Anchor Modeler
- **Full Functionality:** All Anchor features available (anchors, ties, knots, attributes)
- **Independent:** Separate browser tab—work without leaving Harbor
- **Manual Import/Export:** Export XML from Anchor, paste into Harbor form to save

## API Integration

All API calls go through `src/services/api.js`:

```javascript
import { itemsAPI } from './services/api.js';

// Get all models
const models = await itemsAPI.getAll();

// Create new model
const model = await itemsAPI.create({
  name: 'My Model',
  xmlContent: '<schema>...</schema>'
});

// Update model
await itemsAPI.update(modelId, { name, xmlContent });

// Delete model
await itemsAPI.delete(modelId);
```

## Component: AnchorEditor

A built-in XML editor component at `src/components/AnchorEditor.jsx`.

**Features:**
- Syntax highlighting
- XML validation (basic checks)
- Format XML (prettier display)
- Copy to clipboard
- Save and preview

## Scripts

```bash
# Development
npm run dev          # Start Vite dev server with HMR

# Build & Deploy
npm run build        # Production build to dist/
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # ESLint checks

# Synchronization
npm run sync-anchor  # Sync Anchor files from ../anchor/ to public/anchor/
```

## Syncing Anchor Files

The Anchor Modeler is served from `public/anchor/`, synced from `../anchor/`.

**To update Anchor files after changes:**
```bash
npm run sync-anchor
```

This rsyncs all Anchor files, preserves directory structure, and excludes `.git`, `node_modules`, `dist`.

## Environment

- **Base URL:** `http://localhost:5000/api` (in `src/services/api.js`)
- **Dev Server:** Port 5173 (or next available if in use)
- **CORS:** Backend allows requests from `localhost:5173`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 5173 in use** | Vite auto-picks next port (5174, 5175, etc.). Check terminal output. |
| **API calls fail** | Ensure backend is running (`cd ../server && npm run dev`). Check base URL in `src/services/api.js`. |
| **Anchor editor tab doesn't load** | Refresh the browser. Check DevTools → Network for 404s on `/anchor/` resources. |
| **"Cannot find module" errors** | Run `npm install` in `client/` directory. |
| **Styles not updating** | HMR should work; try hard-refresh (Cmd+Shift+R) or restart dev server. |

## Development Notes

### State Management
- Simple `useState` hooks in `App.jsx`
- No Redux or Context API (keep it simple)
- Loading and error states for UX feedback

### Error Handling
- API errors → displayed in error banner
- Invalid XML files → rejected with message
- Network failures → caught and logged to console

### Performance
- Lazy-loaded Anchor Modeler (only loaded when new tab opens)
- CSS is scoped per component
- No unnecessary re-renders

## License

Same as Harbor project.

