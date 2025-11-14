import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';

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
        className="modal-backdrop"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="modal-content w-full max-w-md pointer-events-auto animate-slideIn"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-modal-title"
        >
          {/* Header */}
          <div className="modal-header">
            <h2 id="rename-modal-title" className="text-xl font-bold text-navy-950">
              Rename Model
            </h2>
            <button
              onClick={handleClose}
              className="text-2xl text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close dialog"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <label htmlFor="renameInput" className="form-label">
              New Name
            </label>
            <input
              type="text"
              id="renameInput"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new model name"
              className="form-input"
              disabled={loading}
              autoFocus
            />
            {renameValue !== currentName && renameValue.trim() && (
              <p className="text-sm text-ocean-600 mt-2">
                Will rename from "{currentName}" to "{renameValue.trim()}"
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-slate-50 -m-6 p-6 flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading || !renameValue.trim()}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

RenameModal.displayName = 'RenameModal';

export default RenameModal;
