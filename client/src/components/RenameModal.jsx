import { useState, useEffect } from 'react';

function RenameModal({ isOpen, currentName, onClose, onConfirm, loading }) {
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRenameValue(currentName || '');
    }
  }, [isOpen, currentName]);

  const handleSubmit = () => {
    if (!renameValue.trim()) return;
    onConfirm(renameValue.trim());
    setRenameValue('');
  };

  const handleClose = () => {
    setRenameValue('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && renameValue.trim()) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content rename-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rename Anchor Model</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="renameInput">New name:</label>
            <input
              type="text"
              id="renameInput"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new model name"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading || !renameValue.trim()}
          >
            {loading ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameModal;
