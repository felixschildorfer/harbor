import React from 'react';
import Button from './Button';

/**
 * ModelCard component - displays an anchor model with action buttons
 * @param {Object} model - The anchor model data
 * @param {Function} onEdit - Callback to edit model
 * @param {Function} onRename - Callback to rename model
 * @param {Function} onDelete - Callback to delete model
 * @param {Function} onExport - Callback to export model
 */
const ModelCard = React.memo(({ model, onEdit, onRename, onDelete, onExport }) => {
  const handleEdit = React.useCallback(() => {
    onEdit(model._id);
  }, [model._id, onEdit]);

  const handleRename = React.useCallback(() => {
    onRename(model._id);
  }, [model._id, onRename]);

  const handleDelete = React.useCallback(() => {
    onDelete(model._id);
  }, [model._id, onDelete]);

  const handleExport = React.useCallback(() => {
    onExport(model);
  }, [model, onExport]);

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-base group">
      {/* Card Header */}
      <div className="card-header bg-gradient-to-r from-navy-50 to-ocean-50">
        <h3 className="text-xl font-bold text-navy-950 text-truncate mb-1">
          {model.name}
        </h3>
        <p className="text-sm text-slate-600">
          Version {model.version} • {new Date(model.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">
            <strong>Created:</strong> {new Date(model.createdAt).toLocaleString()}
          </p>
          {model.updatedAt && (
            <p className="text-sm text-slate-600">
              <strong>Updated:</strong> {new Date(model.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* XML Preview */}
        {model.xmlContent && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-32 overflow-hidden">
            <p className="text-xs text-slate-500 mb-2">XML Preview:</p>
            <pre className="text-xs text-slate-700 overflow-auto font-mono whitespace-pre-wrap break-words line-clamp-3">
              {model.xmlContent.substring(0, 200)}...
            </pre>
          </div>
        )}
      </div>

      {/* Card Footer - Actions */}
      <div className="card-footer bg-slate-50 flex flex-wrap gap-2 justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEdit}
          ariaLabel={`Edit ${model.name} in Anchor Editor`}
        >
          ✏️ Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          ariaLabel={`Export ${model.name} as XML`}
        >
          ⬇️ Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRename}
          ariaLabel={`Rename ${model.name}`}
        >
          ✓ Rename
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          ariaLabel={`Delete ${model.name}`}
        >
          🗑️ Delete
        </Button>
      </div>
    </div>
  );
});

ModelCard.displayName = 'ModelCard';

export default ModelCard;
