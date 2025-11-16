# Version Control User Guide

## Quick Start: Using Version Control

### Automatic Version Tracking
Version control is **automatic** - every time you save changes to a model's XML content, a new version is created:

1. Edit your model in the Anchor editor
2. Save changes (File > Save to Harbor)
3. Version number increments automatically
4. Previous version stored in history

### Viewing Version History

1. **From the models list**, right-click any model card
2. Select **"Version History"** from the context menu
3. A modal opens showing your complete version timeline

### What You See in Version History

For each version, you'll see:
- **Version number** (e.g., "v1", "v2", "v3")
- **Status badge** - "Current" shows the active version
- **Change message** - Description of what changed (if provided)
- **Timestamp** - When the version was created
- **Show/Hide XML** - Click to preview the XML content for that version

### Restoring a Previous Version

1. Open the **Version History** modal for your model
2. Find the version you want to restore
3. Click the **"Restore"** button
4. A confirmation will appear
5. The model will be restored to that version
6. A **new version is created** (version numbers continue incrementing)
7. Your previous current version is saved in history

**Example**:
```
Before restore:
  Current: v5 (latest)
  History: v1, v2, v3, v4

After restoring v2:
  Current: v6 (restored from v2)
  History: v1, v2, v3, v4, v5
```

### Version Number Behavior

**Version increments when**:
- ✅ XML content changes and is saved
- ✅ Model is restored from history

**Version does NOT increment when**:
- ❌ Model name changes
- ❌ Description is updated
- ❌ Tags are added/modified

**Viewing the version number**:
- In the model list: Shows "Version X" under the model name
- In version history: Each entry shows its version number
- In file export: Filename includes "_vX.xml"

### Tips & Best Practices

#### Use Messages for Important Versions
When updating via API, add a message parameter:
```javascript
// Sends update with descriptive message
await anchorModelsAPI.update(modelId, {
  xmlContent: newXml,
  message: "Added new entity types and relationships"
})
```

#### Safe Experimentation
- Make changes confidently knowing you can always restore
- Version history preserves everything automatically
- No need to manually save backups

#### Model Organization
Use description and tags fields to organize models:
```javascript
await anchorModelsAPI.update(modelId, {
  description: "Customer master data model",
  tags: ["sales", "production", "critical"]
})
```

### API Examples

#### Get Complete Version History
```javascript
const history = await anchorModelsAPI.getHistory(modelId);
// Returns array with:
// - All historical versions
// - Current version (marked with isCurrent: true)
// - Sorted by version number descending
```

#### Restore a Specific Version
```javascript
const result = await anchorModelsAPI.restoreVersion(modelId, versionNumber);
// Returns:
// {
//   message: "Restored to version 2",
//   model: { ...updatedModel }
// }
```

### Common Scenarios

#### Scenario 1: Accidental Delete
If you accidentally deleted an entity from your model:
1. Open Version History
2. Find the last version before deletion
3. Click Restore
4. Model returns to that state

#### Scenario 2: Comparing Versions
To compare two versions:
1. Open Version History
2. Expand "Show XML Preview" for each version
3. Visually compare the XML content
4. (Future feature: automated diff viewer)

#### Scenario 3: Clean Up Old Versions
Currently all versions are preserved. Best practices:
- Keep major versions in history
- Document important changes with messages
- Regularly export versions you want to keep as backups

### Troubleshooting

**Q: I restored a version, where did the newer version go?**
A: It's saved in history! You can view it in the Version History modal and restore it again if needed.

**Q: Why isn't my version number incrementing?**
A: Only changes to the XML content (schema itself) increment the version. Changing the name, description, or tags doesn't increment.

**Q: Can I delete a version from history?**
A: Currently, no. All versions are permanent (under development). If needed, contact support.

**Q: How far back does version history go?**
A: Unlimited - the entire history is preserved in the database. Models can have hundreds of versions.

### Performance Notes

- Version history is stored efficiently in MongoDB
- Loading a model with history is fast (single query)
- Version history modal loads asynchronously
- No performance impact on model editing

### Data Safety

- All versions are persisted to MongoDB Atlas
- Versions are backed up with your database
- Restoration is non-destructive (original version saved)
- Changes are atomic and transactional

---

**Questions?** Check the technical implementation docs or check git history on the `feature/anchor-version-control` branch.
