import React, { useState, useEffect, useCallback } from 'react';
import { anchorModelsAPI } from './services/api';
import ModelCard from './components/ModelCard';
import CreateModal from './components/CreateModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import RenameModal from './components/RenameModal';
import Button from './components/Button';
import { useToast } from './hooks/useToast';
import { GridSkeleton } from './components/Skeleton';

function App() {
  const [anchorModels, setAnchorModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { addToast, ToastContainer } = useToast();

  // Fetch all anchor models
  const fetchAnchorModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await anchorModelsAPI.getAll();
      setAnchorModels(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch anchor models';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Error fetching anchor models:', err);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Load anchor models on component mount
  useEffect(() => {
    fetchAnchorModels();
  }, [fetchAnchorModels]);

  const handleCreateSubmit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      await anchorModelsAPI.create({
        name: formData.name.trim(),
        xmlContent: formData.xmlContent.trim(),
      });

      setShowModal(false);
      addToast(`Created "${formData.name}" successfully`, 'success');
      await fetchAnchorModels();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create anchor model';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Error creating anchor model:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAnchorModels, addToast]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setError(null);
  }, []);

  const handleOpenAnchorEditor = useCallback((modelId = null) => {
    if (modelId) {
      window.open(`/anchor/index.html?modelId=${modelId}`, 'anchorEditor', 'width=1400,height=900');
    } else {
      window.open('/anchor/index.html', 'anchorEditor', 'width=1400,height=900');
    }
  }, []);

  const handleDeleteClick = useCallback((modelId) => {
    setDeleteTargetId(modelId);
    setShowDeleteConfirm(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;

    try {
      setLoading(true);
      setError(null);
      const modelName = anchorModels.find(m => m._id === deleteTargetId)?.name;
      
      await anchorModelsAPI.delete(deleteTargetId);
      setAnchorModels(anchorModels.filter(m => m._id !== deleteTargetId));
      handleCloseDeleteConfirm();
      addToast(`Deleted "${modelName}" successfully`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete anchor model';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Error deleting anchor model:', err);
    } finally {
      setLoading(false);
    }
  }, [deleteTargetId, anchorModels, handleCloseDeleteConfirm, addToast]);

  const handleRenameClick = useCallback((modelId) => {
    setRenameTargetId(modelId);
    setShowRenameModal(true);
  }, []);

  const handleCloseRenameModal = useCallback(() => {
    setShowRenameModal(false);
    setRenameTargetId(null);
  }, []);

  const handleConfirmRename = useCallback(async (newName) => {
    if (!renameTargetId || !newName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const oldName = anchorModels.find(m => m._id === renameTargetId)?.name;
      
      await anchorModelsAPI.update(renameTargetId, {
        name: newName.trim(),
      });
      
      setAnchorModels(anchorModels.map(m => 
        m._id === renameTargetId 
          ? { ...m, name: newName.trim() }
          : m
      ));
      handleCloseRenameModal();
      addToast(`Renamed "${oldName}" to "${newName.trim()}"`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to rename anchor model';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Error renaming anchor model:', err);
    } finally {
      setLoading(false);
    }
  }, [renameTargetId, anchorModels, handleCloseRenameModal, addToast]);

  const handleExportModel = useCallback((model) => {
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
      addToast(`Exported "${model.name}"`, 'success');
    } catch (err) {
      const errorMsg = 'Failed to export model';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Error exporting model:', err);
    }
  }, [addToast]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } sidebar transition-all duration-base flex flex-col border-r border-slate-200 overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-2 bg-white border-b border-slate-200">
          {sidebarOpen && (
            <img 
              src="/harbor-logo.png" 
              alt="Harbor" 
              className="h-32 w-auto"
              title="Harbor - Anchor Model Manager"
            />
          )}
          {!sidebarOpen && (
            <img 
              src="/harbor-logo.png" 
              alt="Harbor" 
              className="h-40 w-auto"
              title="Harbor"
            />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-navy-900 rounded transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setShowModal(true)}
            className="sidebar-item w-full justify-start"
            aria-label="Create new model"
          >
            <span className="text-lg font-bold">+</span>
            {sidebarOpen && <span>Create Model</span>}
          </button>

          <button
            onClick={() => handleOpenAnchorEditor()}
            className="sidebar-item w-full justify-start"
            aria-label="Open Anchor Editor"
          >
            <span className="text-lg">✎</span>
            {sidebarOpen && <span>Editor</span>}
          </button>

          <button
            onClick={fetchAnchorModels}
            className="sidebar-item w-full justify-start"
            disabled={loading}
            aria-label="Refresh models"
          >
            <span className="text-lg">⟲</span>
            {sidebarOpen && <span>Refresh</span>}
          </button>
        </nav>

        {/* Footer Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700 text-sm text-slate-300">
            <p>Models: <span className="font-bold text-ocean-400">{anchorModels.length}</span></p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
          <div className="flex-between">
            <div>
              <h2 className="text-2xl font-bold text-navy-950">Anchor Models</h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage and edit your anchor models
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="spinner" />
                  Loading...
                </span>
              )}
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
                ariaLabel="Create new model"
              >
                Create New Model
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="alert-error mb-6 flex-between">
                <div>
                  <p><strong>Error:</strong> {error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-lg hover:opacity-70"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {/* Models Grid or Empty State */}
            {loading && !anchorModels.length ? (
              <GridSkeleton count={6} />
            ) : anchorModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-6xl mb-4 text-navy-950">⚓</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Models Yet</h3>
                <p className="text-slate-600 text-center mb-6 max-w-md">
                  Create your first anchor model to get started. Upload XML files or paste content directly.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  ariaLabel="Create first model"
                >
                  Create First Model
                </Button>
              </div>
            ) : (
              <div className="grid-responsive">
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
      </main>

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

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;

