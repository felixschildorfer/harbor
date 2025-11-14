# Harbor + Anchor Integration - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

### 2. Start Both Servers

**Terminal 1 - Backend**:
```bash
cd server && npm run dev
# Listens on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd client && npm run dev
# Starts on http://localhost:5173 (or next available port)
```

### 3. Open in Browser

Navigate to the port shown in Terminal 2 (e.g., http://localhost:5173) and open the app in your browser.

### 4. Test Anchor Editor (new-tab workflow)

There is no embedded iframe editor anymore. When you create or edit an Anchor model, Harbor will open the full Anchor editor in a separate browser tab.

1. Click **"Create Anchor Model"** (or edit an existing model) in the Harbor UI.
2. The app will open the Anchor editor in a new browser tab at `/anchor/index.html` (e.g., http://localhost:5173/anchor/index.html).
3. Use the Anchor UI in that tab to draw/edit your model.
4. Save in the Anchor app. (Currently saving/export integration is manual — you can export XML from Anchor and import it back into Harbor, or save files locally.)
5. Verify: If you used the Harbor import flow or pasted XML back into Harbor, check the model appears in the list or backend as expected.

---

## 🔄 Syncing Anchor Files

After updating the Anchor repository files, sync them into the frontend's `public` directory so the editor is served from Harbor's dev server:

```bash
cd client && npm run sync-anchor
```

This rsyncs the latest Anchor files into `client/public/anchor/` so they are reachable at `/anchor/index.html`.

---

## 🧪 Run Tests

```bash
cd client && node test-anchor-integration.js
# Should see: ✅ All 27+ Tests PASSED
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `client/src/components/AnchorEditor.jsx` | Harbor's built-in editor UI (now a textarea-based editor for quick edits) |
| `client/src/styles/AnchorEditor.css` | Styling for the editor UI |
| `client/public/anchor/index.html` | Anchor editor (standalone app served from `client/public/anchor/`). Open it directly in a new tab at `/anchor/index.html` |
| `scripts/sync-anchor-to-client.sh` | Bash script to sync Anchor files into the frontend |
| `client/package.json` | contains the `"sync-anchor"` npm script to run the sync |
| `client/README.md` | Full documentation |
| `ANCHOR_INTEGRATION_COMPLETE.md` | Detailed integration summary |

---


## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Anchor shows "Error" | Check browser console, ensure Vite is running, try `npm run sync-anchor` |
| Model not persisting | Verify backend is running (`cd server && npm run dev`), check Network tab in DevTools |
| Port 5173 in use | Vite auto-picks next port (check terminal output) |
| postMessage origin mismatch | Both should run on localhost—check `window.location.origin` in console |

---

## 🚀 What's Next

1. Manual testing: Use the UI to create, edit, and save Anchor models. Use the new-tab Anchor editor at `/anchor/index.html` for drawing.
2. Backend verification: If you import/export XML between Anchor and Harbor, check the backend (MongoDB) for persisted models.
3. Deployment: See `client/README.md` "Build & Deployment" section. Ensure `client/public/anchor/` is included in your build/deployment if you want the Anchor app hosted alongside Harbor.
4. Enhancements: Consider a lightweight export/import endpoint or cross-window messaging (postMessage) if you want automatic save/transfer between the Anchor tab and Harbor in the future.

---

## 📖 Full Documentation

See `client/README.md` for comprehensive setup, architecture, and development guide.  
See `ANCHOR_INTEGRATION_COMPLETE.md` for detailed technical implementation notes.

---

**Ready to model? Start at step 2 above! 🎨**
