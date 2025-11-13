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

Navigate to the port shown in Terminal 2 (e.g., http://localhost:5174)

### 4. Test Anchor Editor

1. Click **"Create Anchor Model"** (or edit existing)
2. Click **"🔌 Native"** button to toggle to Anchor iframe editor
3. **Wait** for status to show **"✓ Ready"** (green)
4. **Draw/Edit** your model in the canvas
5. **Save**: Click "💾 Save" button
6. **Verify**: Model appears in the list with saved XML

---

## 🔄 Syncing Anchor Files

After updating the Anchor repository files:

```bash
cd client && npm run sync-anchor
```

This rsync's the latest Anchor files into `client/public/anchor/`.

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
| `client/src/components/AnchorEditor.jsx` | React modal with iframe host & postMessage logic |
| `client/src/styles/AnchorEditor.css` | Styling (status indicators, messages) |
| `client/public/anchor/index.html` | Anchor editor (with Harbor bridge script) |
| `scripts/sync-anchor-to-client.sh` | Bash script to sync Anchor files |
| `client/package.json` | `"sync-anchor"` npm script added |
| `client/README.md` | Full documentation |
| `ANCHOR_INTEGRATION_COMPLETE.md` | Detailed integration summary |

---

## 💬 PostMessage Flow

```
User clicks "Save" in Anchor
          ↓
Harbor Bridge wraps Actions.save
          ↓
Sends: { type: 'anchor-saved', xml: '...' }
          ↓
Host (Harbor) receives via postMessage
          ↓
Calls onSave(xml)
          ↓
App.jsx → anchorModelsAPI.create({ name, xmlContent: xml })
          ↓
Backend: POST /api/items
          ↓
Model saved to MongoDB ✅
```

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

1. **Manual testing**: Use the UI to create, edit, and save Anchor models
2. **Backend verification**: Check MongoDB for persisted models
3. **Deployment**: See `client/README.md` "Build & Deployment" section
4. **Enhancements**: Add versioning, export formats, collaboration features (optional)

---

## 📖 Full Documentation

See `client/README.md` for comprehensive setup, architecture, and development guide.  
See `ANCHOR_INTEGRATION_COMPLETE.md` for detailed technical implementation notes.

---

**Ready to model? Start at step 2 above! 🎨**
