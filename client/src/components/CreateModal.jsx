import React, { useState, useCallback } from 'react';

/**
 * CreateModal - Modal for creating new anchor models
 * Supports file upload and direct XML content input
 */
const CreateModal = React.memo(({ isOpen, onClose, onSubmit, loading, setError, error }) => {
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
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
            <h2 id="modal-title" className="text-2xl font-bold text-navy-950">
              Create New Anchor Model
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
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
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label htmlFor="xmlFile" className="block text-sm font-medium text-slate-700 mb-1">
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
              <label htmlFor="xmlContent" className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent font-mono text-sm"
                disabled={loading}
              />
            </div>
          </form>

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

CreateModal.displayName = 'CreateModal';

export default CreateModal;
