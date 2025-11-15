import React from 'react';
import ContextMenu from './ContextMenu';

/**
 * ModelCard component - displays an anchor model with action buttons
 * @param {Object} model - The anchor model data
 * @param {Function} onEdit - Callback to edit model
 * @param {Function} onRename - Callback to rename model
 * @param {Function} onDelete - Callback to delete model
 * @param {Function} onExport - Callback to export model
 * @param {Function} onVersionHistory - Callback to view version history
 * @param {Function} onVersionComparison - Callback to compare versions
 */
const ModelCard = React.memo(({ model, onEdit, onRename, onDelete, onExport, onVersionHistory, onVersionComparison }) => {
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

  const handleVersionHistory = React.useCallback(() => {
    onVersionHistory(model._id);
  }, [model._id, onVersionHistory]);

  const handleVersionComparison = React.useCallback(() => {
    onVersionComparison(model._id);
  }, [model._id, onVersionComparison]);

  const menuItems = [
    {
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      label: 'Rename',
      onClick: handleRename,
    },
    {
      label: 'Version History',
      onClick: handleVersionHistory,
    },
    {
      label: 'Compare Versions',
      onClick: handleVersionComparison,
    },
    {
      label: 'Export',
      onClick: handleExport,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  return (
    <ContextMenu items={menuItems}>
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-base group cursor-context-menu">
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
            {model.author && model.author !== 'Unknown' && (
              <p className="text-sm text-slate-600">
                <strong>Author:</strong> {model.author}
              </p>
            )}
            {model.description && (
              <p className="text-sm text-slate-600 italic" title={model.description}>
                <strong>Description:</strong> {model.description.substring(0, 50)}
                {model.description.length > 50 ? '...' : ''}
              </p>
            )}
          </div>

          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {model.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-ocean-100 text-ocean-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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

        {/* Help text - indicates right-click for menu */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
          Right-click for menu
        </div>
      </div>
    </ContextMenu>
  );
});

ModelCard.displayName = 'ModelCard';

export default ModelCard;
