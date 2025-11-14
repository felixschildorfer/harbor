import React from 'react';
import Button from './Button';

/**
 * DeleteConfirmModal - Confirmation dialog for deleting anchor models
 */
const DeleteConfirmModal = React.memo(({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="modal-content w-full max-w-md pointer-events-auto animate-slideIn"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          {/* Header */}
          <div className="modal-header">
            <h2 id="delete-modal-title" className="text-xl font-bold text-rust-500">
              Delete Model
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close dialog"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <p id="delete-modal-description" className="text-slate-700 mb-4">
              Are you sure you want to delete this anchor model? This action cannot be undone.
            </p>
            <div className="p-4 bg-rust-50 border border-rust-200 rounded-lg">
              <p className="text-sm text-rust-800 font-medium">
                ⚠️ This will permanently remove the model and its associated XML content.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-slate-50 -m-6 p-6 flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Model'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;
