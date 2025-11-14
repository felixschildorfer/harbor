import React, { useState, useCallback } from 'react';
import Button from './Button';

/**
 * CreateModal - Modal for creating new anchor models
 * Supports file upload and direct XML content input
 */
const CreateModal = React.memo(({ isOpen, onClose, onSubmit, loading, setError }) => {
  const [formData, setFormData] = useState({ name: '', xmlContent: '' });
  const [xmlFile, setXmlFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const processFile = useCallback((file) => {
    if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
      setError('Please upload a .xml file');
      return;
    }

    setXmlFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        xmlContent: event.target.result,
      }));
    };
    reader.onerror = () => {
      setError('Failed to read the XML file. Please try again.');
    };
    reader.readAsText(file);
  }, [setError]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name for the anchor model');
      return;
    }

    if (!formData.xmlContent.trim()) {
      setError('Please upload or paste XML content');
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        xmlContent: formData.xmlContent.trim(),
      });

      setFormData({ name: '', xmlContent: '' });
      setXmlFile(null);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  }, [formData, onSubmit, setError]);

  const handleClose = useCallback(() => {
    setFormData({ name: '', xmlContent: '' });
    setXmlFile(null);
    setError(null);
    onClose();
  }, [onClose, setError]);

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
          className="modal-content w-full max-w-4xl min-w-[600px] max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideIn"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="modal-header flex-between">
            <h2 id="modal-title" className="text-2xl font-bold text-navy-950">
              Create New Anchor Model
            </h2>
            <button
              onClick={handleClose}
              className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              aria-label="Close dialog"
            >
              Close
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-body space-y-6">
            {/* Error Message */}
            {error && (
              <div className="alert-error">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label">
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
                className="form-input"
                disabled={loading}
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label htmlFor="xmlFile" className="form-label">
                Upload XML File (or paste below)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-base cursor-pointer ${
                  isDragging
                    ? 'border-ocean-600 bg-ocean-50'
                    : 'border-slate-300 bg-slate-50 hover:border-ocean-600 hover:bg-ocean-50'
                }`}
              >
                <input
                  type="file"
                  id="xmlFile"
                  accept=".xml,text/xml"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload XML File"
                  disabled={loading}
                />
                <label htmlFor="xmlFile" className="cursor-pointer block">
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Drag and drop your XML file here, or click to select
                  </p>
                  <p className="text-xs text-slate-500">
                    {xmlFile ? `Selected: ${xmlFile.name}` : 'Supported format: .xml'}
                  </p>
                </label>
              </div>
            </div>

            {/* XML Content Field */}
            <div>
              <label htmlFor="xmlContent" className="form-label">
                Or Paste XML Content *
              </label>
              <textarea
                id="xmlContent"
                name="xmlContent"
                value={formData.xmlContent}
                onChange={handleChange}
                required
                placeholder="Paste your XML content here..."
                rows="8"
                className="form-textarea"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="modal-footer bg-slate-50 -m-6 p-6 flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Model'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

CreateModal.displayName = 'CreateModal';

export default CreateModal;
