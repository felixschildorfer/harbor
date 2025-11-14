import { useState } from 'react';

function CreateModal({ isOpen, onClose, onSubmit, loading, setError }) {
  const [formData, setFormData] = useState({ name: '', xmlContent: '' });
  const [xmlFile, setXmlFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        setError('Please upload a .xml file');
        return;
      }
      setXmlFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prevData) => ({
          ...prevData,
          xmlContent: event.target.result,
        }));
      };
      reader.onerror = () => {
        setError('Failed to read the XML file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        setError('Please drop a .xml file');
        return;
      }
      setXmlFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prevData) => ({
          ...prevData,
          xmlContent: event.target.result,
        }));
      };
      reader.onerror = () => {
        setError('Failed to read the dropped XML file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
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
      
      // Reset form
      setFormData({ name: '', xmlContent: '' });
      setXmlFile(null);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', xmlContent: '' });
    setXmlFile(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Anchor Model</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="modal-form"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter anchor model name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="xmlFile">Upload XML File</label>
            <input
              type="file"
              id="xmlFile"
              accept=".xml,text/xml"
              onChange={handleFileChange}
              aria-label="Upload XML File"
            />
            {xmlFile && (
              <p className="file-info">File selected: {xmlFile.name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="xmlContent">Or Paste XML Content *</label>
            <textarea
              id="xmlContent"
              name="xmlContent"
              value={formData.xmlContent}
              onChange={handleChange}
              placeholder="Paste your XML content here..."
              rows="10"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Anchor Model'}
            </button>
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateModal;
