function ModelCard({ model, onEdit, onRename, onDelete, onExport }) {
  return (
    <div className="model-card">
      <h3 className="model-name">{model.name}</h3>
      <p className="model-version">Version {model.version}</p>
      <button
        className="edit-button"
        onClick={() => onEdit(model._id)}
        title="Edit model in Anchor Editor"
      >
        ✏️ Edit in Anchor
      </button>
      <button
        className="export-button"
        onClick={() => onExport(model)}
        title="Export model as XML"
      >
        ⬇️ Export
      </button>
      <button
        className="rename-button"
        onClick={() => onRename(model._id)}
        title="Rename model"
      >
        ✏️ Rename
      </button>
      <button
        className="delete-button"
        onClick={() => onDelete(model._id)}
        title="Delete model"
      >
        🗑️ Delete
      </button>
    </div>
  );
}

export default ModelCard;
