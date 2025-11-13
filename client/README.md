# Harbor Client - React + Vite Frontend

A modern React 18 frontend for Harbor, a full-stack CRUD application with Anchor XML editor integration.

## Overview

Harbor is a simple CRUD app that integrates the **Anchor Modeler** (a sophisticated database modeling tool) directly into the React UI via an iframe. Users can create, edit, and save Anchor XML models without leaving the Harbor interface.

### Tech Stack
- **React 18** with Vite (fast dev server & HMR)
- **Axios** for API client layer
- **Anchor Modeler** embedded as static HTML/JS in an iframe
- **CSS** for styling (no additional UI framework)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Harbor server running on `http://localhost:5000` (API base URL)

### Installation & Development

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# In another terminal, start the Harbor backend (from repo root)
cd ../server && npm run dev
```

Both services should now be running:
- **Frontend**: http://localhost:5173 (or auto-assigned port if 5173 is in use)
- **Backend**: http://localhost:5000

## Anchor Editor Integration

The Anchor Modeler is embedded inside the Harbor UI via an iframe at `src/components/AnchorEditor.jsx`. 

### How It Works

1. **Iframe Embedding**: `public/anchor/index.html` is served by Vite at `/anchor/index.html`
2. **postMessage Protocol**: Host (Harbor) ↔ Iframe (Anchor) communicate via `window.postMessage()`:
   - **Host → Iframe**: `{ type: 'load-xml', xml: '<schema>...' }`
   - **Iframe → Host**: `{ type: 'anchor-ready' }`, `{ type: 'anchor-saved', xml: '...' }`
3. **Save Flow**: When a user saves in Anchor, the XML is sent to the host's `onSave()` callback, which persists it via the API

### Syncing Anchor Files

The Anchor static files are copied from the workspace `../anchor/` directory into `client/public/anchor/` so they can be served by Vite.

**To sync Anchor files after updates**:
```bash
# Run from client/ directory
npm run sync-anchor

# Or manually from the repo root
bash scripts/sync-anchor-to-client.sh
```

This command:
- Copies all Anchor HTML, CSS, JS, and module files
- Excludes `.git`, `node_modules`, `dist`, and Markdown files
- Preserves directory structure (e.g., `modules/` subdirectory)

### File Structure

```
client/
├── src/
│   ├── App.jsx              # Main React component (model list, editor modal)
│   ├── components/
│   │   └── AnchorEditor.jsx # Iframe host + postMessage logic
│   ├── services/
│   │   └── api.js           # Axios instance + itemsAPI methods
│   └── styles/
│       └── AnchorEditor.css # Editor component styling
├── public/
│   └── anchor/              # Anchor static files (synced from ../anchor/)
│       ├── index.html
│       ├── application.css
│       ├── modules/
│       └── [other Anchor assets]
└── package.json
```

## API Integration

The client communicates with the backend via `src/services/api.js`:

```javascript
// Get all Anchor models
const models = await itemsAPI.getAll();

// Create a new model
const newModel = await itemsAPI.create({
  name: 'My Model',
  xmlContent: '<schema>...'
});

// Update an existing model
await itemsAPI.update(modelId, { name, xmlContent });

// Delete a model
await itemsAPI.delete(modelId);
```

**Base URL**: `http://localhost:5000/api` (hardcoded in `api.js`)

## Component: AnchorEditor

Located at `src/components/AnchorEditor.jsx`, this React component:
- Renders a modal with the embedded Anchor iframe (in "native" mode) or a built-in textarea editor
- Manages postMessage handshake (`anchor-ready` → `load-xml`)
- Shows status indicators (connecting, ready, error)
- Displays save/export confirmations
- Validates and formats XML (in built-in mode)

### Props
- `xmlContent` (string): Initial XML to display
- `onSave(xml)` (function): Called when user saves; receives the updated XML
- `onClose()` (function): Called to close the editor modal

### UI Features
- **Toggle Button**: Switch between "Native" (Anchor iframe) and "Built-in" (textarea) editors
- **Status Indicator**: Shows connection state (⏳ Connecting, ✓ Ready, ✗ Error)
- **Toolbar**: Validate, Format, Copy, Save buttons
- **Preview Tab**: In built-in mode, shows an XML tree view

## Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

Output is in `dist/`, ready to serve on a static host.

## Troubleshooting

### Anchor editor shows "Error: Failed to load"
- Ensure the dev server is running (`npm run dev`)
- Verify `public/anchor/index.html` exists (run `npm run sync-anchor`)
- Check browser console for postMessage errors
- Confirm origin matches: postMessage requires `window.location.origin` match

### Port 5173 already in use
- Vite will auto-pick the next available port (e.g., 5174)
- Update your Anchor editor iframe src if you manually override the port in `vite.config.js`

### Models not persisting after save
- Verify backend is running on `http://localhost:5000`
- Check network tab in DevTools for `POST /api/items` requests
- Confirm backend `.env` has `MONGODB_URI` configured (or accepts dev mode without DB)

## Development Workflow

1. **Make changes** to React components or Anchor files
2. **Sync Anchor** if you updated static assets: `npm run sync-anchor`
3. **Hot reload** happens automatically (HMR)
4. **Test** in browser at http://localhost:5173

## Contributing

- Follow the existing component structure (monolithic `App.jsx` by design)
- Use Axios for all API calls (centralized in `api.js`)
- Leverage CSS classes in `AnchorEditor.css` for styling
- Update this README if you add significant features

## License

Same as Harbor project.

