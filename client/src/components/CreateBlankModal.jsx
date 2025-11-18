import React, { useState, useCallback } from 'react';

/**
 * CreateBlankModal - Modal for creating new blank anchor models
 * Opens the Anchor editor immediately with a blank canvas
 */
const CreateBlankModal = React.memo(({ isOpen, onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({ name: '', anchorVersion: 'v0.100.1' });
  const [error, setError] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name for the anchor model');
      return;
    }

    try {
      await onCreate({
        name: formData.name.trim(),
        anchorVersion: formData.anchorVersion,
      });

      setFormData({ name: '', anchorVersion: 'v0.100.1' });
      setError(null);
    } catch (err) {
      console.error('Error creating model:', err);
      setError(err.message || 'Failed to create model');
    }
  }, [formData, onCreate]);

  const handleClose = useCallback(() => {
    setFormData({ name: '', anchorVersion: 'v0.100.1' });
    setError(null);
    onClose();
  }, [onClose]);

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
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 id="modal-title" className="text-2xl font-bold text-navy-950">
              Create New Model
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Model Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter anchor model name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Anchor Version Selector */}
            <div>
              <label htmlFor="anchorVersion" className="block text-sm font-medium text-slate-700 mb-1">
                Anchor Modeler Version
              </label>
              <select
                id="anchorVersion"
                name="anchorVersion"
                value={formData.anchorVersion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="v0.100.1">
                  Newest Test Version (v0.100.1) - Latest features and fixes
                </option>
                <option value="v0.99.16">
                  Production Release (v0.99.16) - Stable, widely tested
                </option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Choose the version of Anchor Modeler to use. Once created, the model will always open with the selected version.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="min-w-24 px-4 py-2.5 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: '#1e6091',
                color: 'white',
                border: '2px solid #0f3a5d',
                minWidth: '96px',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#154a73')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1e6091')}
            >
              {loading ? 'Creating...' : 'Create Model'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

CreateBlankModal.displayName = 'CreateBlankModal';

export default CreateBlankModal;
