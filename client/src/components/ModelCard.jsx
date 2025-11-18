import React from 'react';
import ContextMenu from './ContextMenu';

/**
 * ModelCard component - displays an anchor model with action buttons
 * @param {Object} model - The anchor model data
 * @param {Function} onEdit - Callback to edit model
 * @param {Function} onRename - Callback to rename model
 * @param {Function} onDelete - Callback to delete model
 * @param {Function} onExport - Callback to export model
 * @param {Function} onViewHistory - Callback to view version history
 */
const ModelCard = React.memo(({ model, onEdit, onRename, onDelete, onExport, onViewHistory }) => {
  const handleEdit = React.useCallback(() => {
    onEdit(model);
  }, [model, onEdit]);

  const handleRename = React.useCallback(() => {
    onRename(model._id);
  }, [model._id, onRename]);

  const handleDelete = React.useCallback(() => {
    onDelete(model._id);
  }, [model._id, onDelete]);

  const handleExport = React.useCallback(() => {
    onExport(model);
  }, [model, onExport]);

  const handleViewHistory = React.useCallback(() => {
    onViewHistory(model._id);
  }, [model._id, onViewHistory]);

  const menuItems = [
    {
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      label: 'Version History',
      onClick: handleViewHistory,
    },
    {
      label: 'Rename',
      onClick: handleRename,
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
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-navy-950 text-truncate flex-1">
              {model.name}
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
              model.anchorVersion === 'v0.99.16'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {model.anchorVersion === 'v0.99.16' ? 'Production' : 'Test'}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Version {model.currentVersionNumber || model.version} • {new Date(model.createdAt).toLocaleDateString()}
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
