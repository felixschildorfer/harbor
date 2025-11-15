import React, { useState, useEffect, useCallback } from 'react';

/**
 * RenameModal - Modal for renaming anchor models
 */
const RenameModal = React.memo(({ isOpen, currentName, onClose, onConfirm, loading }) => {
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRenameValue(currentName || '');
    }
  }, [isOpen, currentName]);

  const handleSubmit = useCallback(() => {
    if (!renameValue.trim()) return;
    onConfirm(renameValue.trim());
    setRenameValue('');
  }, [renameValue, onConfirm]);

  const handleClose = useCallback(() => {
    setRenameValue('');
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && renameValue.trim() && !loading) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  }, [renameValue, loading, handleSubmit, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
            <h2 id="rename-modal-title" className="text-xl font-bold text-navy-950">
              Rename Model
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none disabled:opacity-50"
              aria-label="Close dialog"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 flex-grow">
            <div>
              <label htmlFor="renameInput" className="block text-sm font-medium text-slate-700 mb-1">
                New Name
              </label>
              <input
                type="text"
                id="renameInput"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter new model name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
              {renameValue !== currentName && renameValue.trim() && (
                <p className="text-sm text-ocean-600 mt-2">
                  Will rename from "{currentName}" to "{renameValue.trim()}"
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="min-w-24 px-4 py-2.5 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !renameValue.trim()}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: '2px solid #059669',
                minWidth: '96px',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: (loading || !renameValue.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !renameValue.trim()) ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !(loading || !renameValue.trim()) && (e.target.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => !(loading || !renameValue.trim()) && (e.target.style.backgroundColor = '#10b981')}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

RenameModal.displayName = 'RenameModal';

export default RenameModal;
