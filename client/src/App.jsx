import { useState, useEffect } from 'react';
import { anchorModelsAPI } from './services/api';
import './App.css';

function App() {
  const [anchorModels, setAnchorModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    xmlContent: '',
  });
  const [xmlFile, setXmlFile] = useState(null);

  // Fetch all anchor models
  const fetchAnchorModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await anchorModelsAPI.getAll();
      setAnchorModels(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch anchor models');
      console.error('Error fetching anchor models:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load anchor models on component mount
  useEffect(() => {
    fetchAnchorModels();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        setError('Please upload a .xml file');
        return;
      }
      setXmlFile(file);
      setError(null); // Clear any previous errors
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

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
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
      setLoading(true);
      setError(null);

      await anchorModelsAPI.create({
        name: formData.name.trim(),
        xmlContent: formData.xmlContent.trim(),
      });

      // Reset form and close modal
      setFormData({ name: '', xmlContent: '' });
      setXmlFile(null);
      setShowModal(false);
      fetchAnchorModels();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create anchor model';
      const errorDetails = err.response?.data?.details || '';
      const fullError = errorDetails ? `${errorMessage}\n\nFull details:\n${errorDetails}` : errorMessage;
      setError(fullError);
      console.error('Error creating anchor model:', err);
      console.error('Full error response:', err.response?.data);
      console.error('Full error object:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setFormData({ name: '', xmlContent: '' });
    setXmlFile(null);
    setShowModal(false);
    setError(null);
  };

  // Handler to open Anchor editor in new tab
  const handleOpenAnchorEditor = (modelId = null) => {
    if (modelId) {
      window.open(`/anchor/index.html?modelId=${modelId}`, 'anchorEditor', 'width=1400,height=900');
    } else {
      window.open('/anchor/index.html', 'anchorEditor', 'width=1400,height=900');
    }
  };

  // Handler to initiate delete confirmation
  const handleDeleteClick = (modelId) => {
    setDeleteTargetId(modelId);
    setShowDeleteConfirm(true);
  };

  // Handler to close delete confirmation modal
  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // Handler to confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setLoading(true);
      setError(null);
      await anchorModelsAPI.delete(deleteTargetId);
      
      // Remove from list
      setAnchorModels(anchorModels.filter(m => m._id !== deleteTargetId));
      handleCloseDeleteConfirm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete anchor model');
      console.error('Error deleting anchor model:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="/logo.svg" alt="Harbor Logo" className="logo" />
          <h1>Harbor</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Error message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <p><strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}</p>
            </div>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Create Button */}
        <div className="create-button-container">
          <button 
            className="create-button"
            onClick={() => setShowModal(true)}
          >
            Create New Anchor Model
          </button>
          <button 
            className="create-button anchor-editor-launch-btn"
            onClick={handleOpenAnchorEditor}
            style={{ marginLeft: '1rem' }}
          >
            ✏️ Open Anchor Editor
          </button>
        </div>

        {/* Anchor Models Grid */}
        <div className="models-container">
          {loading && !anchorModels.length ? (
            <p className="loading-text">Loading...</p>
          ) : anchorModels.length === 0 ? (
            <p className="empty-text">No anchor models found. Create your first anchor model!</p>
          ) : (
            <div className="models-grid">
              {anchorModels.map((model) => (
                <div key={model._id} className="model-card">
                  <h3 className="model-name">{model.name}</h3>
                  <p className="model-version">Version {model.version}</p>
                  <button
                    className="edit-button"
                    onClick={() => handleOpenAnchorEditor(model._id)}
                  >
                    ✏️ Edit in Anchor
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteClick(model._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Anchor Model</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
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
                  onClick={handleCloseModal} 
                  disabled={loading}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCloseDeleteConfirm}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Anchor Model</h2>
              <button className="modal-close" onClick={handleCloseDeleteConfirm}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this anchor model? This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={handleCloseDeleteConfirm}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-button"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
