# Integrating Anchor Editor with Harbor

## Overview

This guide explains how to integrate the Anchor XML Editor (from the `/anchor` repository) into the Harbor application. When users click the "Open Anchor Editor" button in Harbor, the Anchor editor will open in a modal window.

## Setup Instructions

### 1. Start the Anchor Application (Web Server)

The Anchor application needs to be running on a local web server. In a separate terminal:

```bash
cd /Users/felix.schildorfer/GitHub/anchor
npm install  # (only needed if not already installed)
npm start
```

**Note:** By default, Anchor runs on `http://localhost:3001`. If it runs on a different port, update the Harbor `App.jsx` file (see Configuration section below).

You should see output like:
```
Server is running on http://localhost:3001
```

### 2. Start Harbor (Frontend + Backend)

In two separate terminals:

**Terminal 1 - Backend:**
```bash
cd /Users/felix.schildorfer/GitHub/harbor/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/felix.schildorfer/GitHub/harbor/client
npm run dev
```

### 3. Access Harbor

Open your browser to:
```
http://localhost:5173
```

You should see:
- "Create New Anchor Model" button (original)
- "Open Anchor Editor" button (new) - in blue

## How to Use

1. **Click "Open Anchor Editor"** - This opens the Anchor XML editor in a large modal window
2. **Design your XML** - Use Anchor's visual editor to design your anchor model
3. **Save the Model** - When finished, click the save/export button in Anchor
4. **Return to Harbor** - The XML is automatically populated in the form
5. **Create the Model** - Fill in the name and click "Create Anchor Model" to save to MongoDB

## Configuration

### Changing the Anchor Port

If Anchor runs on a different port (not 3001):

1. Open `/Users/felix.schildorfer/GitHub/harbor/client/src/App.jsx`
2. Find the line: `src="http://localhost:3001"`
3. Change `3001` to the correct port
4. Also update the message handler validation around line 128:
   ```javascript
   if (event.origin !== 'http://localhost:3001' && event.origin !== 'http://localhost:8080') {
   ```

### Anchor Editor Modal Size

To adjust the modal size, edit `/Users/felix.schildorfer/GitHub/harbor/client/src/App.css`:

```css
.anchor-editor-modal {
  width: 95vw;      /* 95% of viewport width */
  height: 95vh;     /* 95% of viewport height */
  max-width: 1600px;
  max-height: 90vh;
}
```

## Architecture

### Data Flow

```
Harbor (React)
    ↓
[Open Anchor Editor Button]
    ↓
Anchor Editor (iframe) → http://localhost:3001
    ↓
[User designs XML]
    ↓
[User clicks Save in Anchor]
    ↓
postMessage() sends XML back to Harbor
    ↓
Harbor receives XML via window.addEventListener('message')
    ↓
Form populates with XML
    ↓
[User clicks "Create Anchor Model"]
    ↓
XML saved to MongoDB
```

### File Changes

**Frontend (`client/src/App.jsx`):**
- Added `showAnchorEditor` state
- Added `handleOpenAnchorEditor()` handler
- Added `handleCloseAnchorEditor()` handler
- Added message listener for receiving XML from Anchor
- Added "Open Anchor Editor" button
- Added Anchor editor iframe modal

**Frontend Styles (`client/src/App.css`):**
- Added styles for anchor editor button (blue color)
- Added styles for anchor editor modal (responsive sizing)
- Added responsive breakpoints for mobile devices

## Troubleshooting

### "Cannot GET /" error in Anchor iframe

**Problem:** The Anchor server isn't running or is on a different port.

**Solution:**
1. Make sure Anchor is running: `cd /anchor && npm start`
2. Check which port it's running on
3. Update the iframe src in `App.jsx` to match the port

### XML not being saved from Anchor

**Problem:** The message communication isn't working.

**Current Implementation Note:** The current setup assumes Anchor will send a message like:
```javascript
window.parent.postMessage({
  type: 'ANCHOR_XML_SAVED',
  xml: '<anchor>...</anchor>',
  name: 'My Model'
}, 'http://localhost:5173');
```

If Anchor doesn't support this, you may need to:
1. Extract the XML manually from the Anchor interface
2. Copy/paste it into Harbor's form
3. Or implement a different communication method

### Modal not closing

**Problem:** The "×" button doesn't close the modal.

**Solution:** Try clicking outside the modal window to close it (click on the dark overlay).

## Future Enhancements

1. **Auto-save to MongoDB** - Save directly from Anchor editor without showing the form
2. **Edit existing models** - Pre-populate Anchor editor with stored XML
3. **Version tracking** - Keep multiple versions of anchor models
4. **SQL generation** - Display SQL output directly in Harbor
5. **Export options** - Generate SQL/DDL from stored models

## References

- Harbor Repository: `/Users/felix.schildorfer/GitHub/harbor`
- Anchor Repository: `/Users/felix.schildorfer/GitHub/anchor`
- Harbor Frontend: `harbor/client/src/App.jsx`
- Harbor Backend: `harbor/server`
- Anchor Main: `anchor/index.html`, `anchor/main.js`
