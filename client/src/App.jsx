import { useState, useEffect } from 'react';
import { anchorModelsAPI } from './services/api';
import ModelCard from './components/ModelCard';
import CreateModal from './components/CreateModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import RenameModal from './components/RenameModal';
import './App.css';

function App() {
  const [anchorModels, setAnchorModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);

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

  // File handling is now managed within CreateModal component
  // Form handling is now managed within CreateModal component

  // Handle form submit - moved to CreateModal
  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      await anchorModelsAPI.create({
        name: formData.name.trim(),
        xmlContent: formData.xmlContent.trim(),
      });

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

  // Handler to initiate rename
  const handleRenameClick = (modelId) => {
    setRenameTargetId(modelId);
    setShowRenameModal(true);
  };

  // Handler to close rename modal
  const handleCloseRenameModal = () => {
    setShowRenameModal(false);
    setRenameTargetId(null);
  };

  // Handler to confirm and execute rename
  const handleConfirmRename = async (newName) => {
    if (!renameTargetId || !newName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await anchorModelsAPI.update(renameTargetId, {
        name: newName.trim(),
      });
      
      // Update in list
      setAnchorModels(anchorModels.map(m => 
        m._id === renameTargetId 
          ? { ...m, name: newName.trim() }
          : m
      ));
      handleCloseRenameModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rename anchor model');
      console.error('Error renaming anchor model:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler to export model as XML
  const handleExportModel = (model) => {
    try {
      const xmlContent = model.xmlContent;
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${model.name.replace(/\s+/g, '_')}_v${model.version}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export model');
      console.error('Error exporting model:', err);
    }
  };

  // Handler for drag and drop - moved to CreateModal
  // Kept here as reference for migration purposes

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
            onClick={() => handleOpenAnchorEditor()}
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
                <ModelCard
                  key={model._id}
                  model={model}
                  onEdit={handleOpenAnchorEditor}
                  onRename={handleRenameClick}
                  onDelete={handleDeleteClick}
                  onExport={handleExportModel}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateSubmit}
        loading={loading}
        error={error}
        setError={setError}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <RenameModal
        isOpen={showRenameModal}
        currentName={anchorModels.find(m => m._id === renameTargetId)?.name || ''}
        onClose={handleCloseRenameModal}
        onConfirm={handleConfirmRename}
        loading={loading}
      />
    </div>
  );
}

export default App;
