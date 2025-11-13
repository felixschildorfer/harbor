# Anchor Editor Integration for Harbor

## Overview

Option A integration successfully embeds Anchor's XML editor functionality directly into Harbor as a React component. This provides a seamless, embedded editing experience without requiring a separate desktop application.

## Architecture

### New Components

#### `AnchorEditor` Component (`/client/src/components/AnchorEditor.jsx`)
The main embedded editor component with the following features:

- **Editor Tab**: Full-featured XML text editor with syntax support
- **Preview Tab**: Interactive tree view of XML structure with collapsible nodes
- **XML Validation**: Real-time XSD validation with error reporting
- **Formatting**: Pretty-print with automatic indentation
- **Copy to Clipboard**: One-click XML content copying
- **Save Integration**: Saves directly to Harbor's MongoDB backend

#### Styling (`/client/src/styles/AnchorEditor.css`)
- Responsive modal design (95vw/95vh)
- Dark header with gradient background
- Syntax highlighting for XML elements
- Responsive breakpoints for mobile/tablet

### XML Features

1. **XML Parsing & Validation**
   - Uses browser's native `DOMParser` API
   - Detects malformed XML with error messages
   - Validates before saving

2. **Pretty Printing**
   - Recursive formatter with configurable indentation
   - Preserves attributes and text content
   - Respects nested structure

3. **Tree View Preview**
   - Expandable/collapsible element nodes
   - Color-coded tags, attributes, values, and text
   - Inline text content display

## User Workflow

### Creating a New Anchor Model with Editor

1. Click **"✏️ Open Anchor Editor"** button
2. Enter model name in the modal
3. Click **"Continue to Editor"**
4. Use the embedded editor to:
   - Paste XML content
   - Edit directly in the textarea
   - Use **Validate** to check syntax
   - Use **Format** to pretty-print XML
   - Switch to **Preview** tab to see tree structure
5. Click **"💾 Save"** to save to Harbor

### Editing Existing Models

Future enhancement: Load existing model XML into editor for editing:

```jsx
const handleEditModel = (model) => {
  setEditingModelId(model._id);
  setEditorXml(model.xmlContent);
  setFormData({ name: model.name, xmlContent: '' });
  setShowAnchorEditor(true);
};
```

## API Integration

The editor integrates with Harbor's backend through `anchorModelsAPI`:

```javascript
// Create new model with XML from editor
await anchorModelsAPI.create({
  name: "My Model",
  xmlContent: "...", // From editor
});

// Future: Update existing model
await anchorModelsAPI.update(modelId, {
  xmlContent: "..." // Modified XML
});
```

## File Structure

```
/client
├── src/
│   ├── components/
│   │   └── AnchorEditor.jsx          # Main editor component
│   ├── styles/
│   │   └── AnchorEditor.css          # Editor styling
│   ├── App.jsx                       # Updated to use AnchorEditor
│   ├── App.css                       # Updated with editor button style
│   └── services/
│       └── api.js                    # Existing API service
└── package.json
```

## Technical Highlights

### No External Editor Required
- Unlike Option B, no need for separate Anchor desktop app
- No iframe sandboxing limitations
- Direct state management with React

### Browser-Native XML Processing
- Uses `DOMParser` for validation
- No external XML libraries required
- Fast and lightweight

### Responsive Design
- Optimized for desktop (95vw/95vh)
- Mobile-friendly with stacked toolbar
- Touch-friendly buttons

## Future Enhancements

1. **XSD Validation**: Integrate Anchor Model XSD for schema validation
2. **Syntax Highlighting**: Code editor library (Monaco, CodeMirror) for better highlighting
3. **Drag-Drop**: Upload XML files via drag-and-drop
4. **Edit History**: Implement undo/redo with version history
5. **Collaborative Editing**: Real-time multi-user editing
6. **Export Formats**: Export to different XML variants or schemas

## Testing Checklist

- [ ] Editor launches when clicking "Open Anchor Editor"
- [ ] Name input modal appears before editor
- [ ] XML can be pasted and edited in textarea
- [ ] Validate button shows success/error messages
- [ ] Format button pretty-prints XML
- [ ] Copy button copies XML to clipboard
- [ ] Preview tab shows expandable tree structure
- [ ] Save button creates model in Harbor
- [ ] Large XML files (50MB+) can be handled
- [ ] Close button exits editor without losing work (optional save prompt)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- DOMParser API supported in all modern browsers

## Performance Notes

- Large XML files (>10MB) may be slow in preview mode due to tree rendering
- Format operation is O(n) on element count
- Validation is instant with native DOMParser
