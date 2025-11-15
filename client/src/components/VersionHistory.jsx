import React, { useState, useEffect } from 'react';
import { anchorModelsAPI } from '../services/api';
import '../styles/VersionHistory.css';

const VersionHistory = ({ modelId, onClose, onRollback }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rollbackInProgress, setRollbackInProgress] = useState(false);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true);
        const response = await anchorModelsAPI.getVersionHistory(modelId);
        setVersions(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch version history');
      } finally {
        setLoading(false);
      }
    };

    fetchVersionHistory();
  }, [modelId]);

  const handleRollback = async (versionNum) => {
    if (!window.confirm(`Rollback to version ${versionNum}?`)) {
      return;
    }

    try {
      setRollbackInProgress(true);
      await anchorModelsAPI.rollbackToVersion(modelId, versionNum, `Rollback to version ${versionNum}`);
      setError(null);
      if (onRollback) {
        onRollback();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rollback');
    } finally {
      setRollbackInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="version-history-modal">
        <div className="version-history-content">
          <h2>Version History</h2>
          <p>Loading versions...</p>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="version-history-modal">
      <div className="version-history-content">
        <h2>Version History</h2>
        
        {error && <div className="error-message">{error}</div>}

        {versions.length === 0 ? (
          <p>No version history found.</p>
        ) : (
          <div className="versions-list">
            {versions.map((version) => (
              <div key={`${version.versionNumber}`} className="version-item">
                <div className="version-header">
                  <span className="version-number">v{version.versionNumber}</span>
                  <span className="version-author">{version.author}</span>
                  <span className="version-date">{formatDate(version.createdAt)}</span>
                </div>
                <div className="version-details">
                  <p className="changelog">{version.changelog || 'No description'}</p>
                  <button
                    onClick={() => handleRollback(version.versionNumber)}
                    disabled={rollbackInProgress}
                    className="rollback-btn"
                  >
                    {rollbackInProgress ? 'Rolling back...' : 'Rollback'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

export default VersionHistory;
