import React from 'react';

/**
 * DeleteConfirmModal - Confirmation dialog for deleting anchor models
 */
const DeleteConfirmModal = React.memo(({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
            <h2 id="delete-modal-title" className="text-xl font-bold text-rust-500">
              Delete Model
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none disabled:opacity-50"
              aria-label="Close dialog"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 flex-grow overflow-y-auto">
            <p id="delete-modal-description" className="text-slate-700">
              Are you sure you want to delete this anchor model? This action cannot be undone.
            </p>
            <div className="p-4 bg-rust-50 border border-rust-200 rounded-lg">
              <p className="text-sm text-rust-800 font-medium">
                ⚠️ This will permanently remove the model and its associated XML content.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-w-24 px-4 py-2.5 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="min-w-24 px-4 py-2.5 bg-red-600 text-white border-2 border-red-700 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;
