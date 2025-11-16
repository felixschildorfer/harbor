import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { anchorModelsAPI } from '../services/api';import { anchorModelsAPI } from '../services/api';

import '../styles/VersionHistory.css';

function VersionHistory({ modelId, isOpen, onClose, onVersionRestored }) {

  const [history, setHistory] = useState([]);const VersionHistory = ({ modelId, onClose, onRollback }) => {

  const [loading, setLoading] = useState(false);  const [versions, setVersions] = useState([]);

  const [error, setError] = useState(null);  const [loading, setLoading] = useState(true);

  const [expandedVersion, setExpandedVersion] = useState(null);  const [error, setError] = useState(null);

  const [rollbackInProgress, setRollbackInProgress] = useState(false);

  useEffect(() => {

    if (isOpen && modelId) {  useEffect(() => {

      loadHistory();    const fetchVersionHistory = async () => {

    }      try {

  }, [isOpen, modelId]);        setLoading(true);

        const response = await anchorModelsAPI.getVersionHistory(modelId);

  const loadHistory = async () => {        setVersions(response.data);

    try {        setError(null);

      setLoading(true);      } catch (err) {

      setError(null);        setError(err.response?.data?.message || 'Failed to fetch version history');

      const response = await anchorModelsAPI.getHistory(modelId);      } finally {

      setHistory(response.data);        setLoading(false);

    } catch (err) {      }

      const errorMsg = err.response?.data?.message || 'Failed to load version history';    };

      setError(errorMsg);

      console.error('Error loading version history:', err);    fetchVersionHistory();

    } finally {  }, [modelId]);

      setLoading(false);

    }  const handleRollback = async (versionNum) => {

  };    if (!window.confirm(`Rollback to version ${versionNum}?`)) {

      return;

  const handleRestoreVersion = async (versionNumber) => {    }

    try {

      setLoading(true);    try {

      setError(null);      setRollbackInProgress(true);

            await anchorModelsAPI.rollbackToVersion(modelId, versionNum, `Rollback to version ${versionNum}`);

      const response = await anchorModelsAPI.restoreVersion(modelId, versionNumber);      setError(null);

            if (onRollback) {

      // Reload history        onRollback();

      await loadHistory();      }

            onClose();

      if (onVersionRestored) {    } catch (err) {

        onVersionRestored(response.data.model);      setError(err.response?.data?.message || 'Failed to rollback');

      }    } finally {

    } catch (err) {      setRollbackInProgress(false);

      const errorMsg = err.response?.data?.message || 'Failed to restore version';    }

      setError(errorMsg);  };

      console.error('Error restoring version:', err);

    } finally {  const formatDate = (dateString) => {

      setLoading(false);    return new Date(dateString).toLocaleDateString('en-US', {

    }      month: 'short',

  };      day: 'numeric',

      year: 'numeric',

  const formatDate = (dateString) => {      hour: '2-digit',

    const date = new Date(dateString);      minute: '2-digit',

    return date.toLocaleString();    });

  };  };



  const formatXmlPreview = (xml) => {  if (loading) {

    // Return first 200 characters of XML for preview    return (

    return xml.substring(0, 200) + (xml.length > 200 ? '...' : '');      <div className="version-history-modal">

  };        <div className="version-history-content">

          <h2>Version History</h2>

  if (!isOpen) return null;          <p>Loading versions...</p>

          <button onClick={onClose} className="close-btn">Close</button>

  return (        </div>

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">      </div>

      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">    );

        {/* Header */}  }

        <div className="sticky top-0 bg-slate-100 border-b border-slate-300 p-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-slate-900">Version History</h2>  return (

          <button    <div className="version-history-modal">

            onClick={onClose}      <div className="version-history-content">

            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"        <h2>Version History</h2>

            aria-label="Close"        

          >        {error && <div className="error-message">{error}</div>}

            ×

          </button>        {versions.length === 0 ? (

        </div>          <p>No version history found.</p>

        ) : (

        {/* Content */}          <div className="versions-list">

        <div className="p-6">            {versions.map((version) => (

          {error && (              <div key={`${version.versionNumber}`} className="version-item">

            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">                <div className="version-header">

              {error}                  <span className="version-number">v{version.versionNumber}</span>

            </div>                  <span className="version-author">{version.author}</span>

          )}                  <span className="version-date">{formatDate(version.createdAt)}</span>

                </div>

          {loading && !history.length ? (                <div className="version-details">

            <div className="text-center py-8">                  <p className="changelog">{version.changelog || 'No description'}</p>

              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>                  <button

              <p className="text-slate-600 mt-2">Loading version history...</p>                    onClick={() => handleRollback(version.versionNumber)}

            </div>                    disabled={rollbackInProgress}

          ) : history.length === 0 ? (                    className="rollback-btn"

            <p className="text-slate-500 text-center py-8">No versions available</p>                  >

          ) : (                    {rollbackInProgress ? 'Rolling back...' : 'Rollback'}

            <div className="space-y-4">                  </button>

              {history.map((version) => (                </div>

                <div              </div>

                  key={version.versionNumber || 'current'}            ))}

                  className={`border rounded-lg p-4 transition-all ${          </div>

                    expandedVersion === version.versionNumber        )}

                      ? 'border-ocean-400 bg-ocean-50'

                      : 'border-slate-200 bg-white hover:border-slate-300'        <button onClick={onClose} className="close-btn">Close</button>

                  }`}      </div>

                >    </div>

                  <div className="flex items-center justify-between gap-4">  );

                    <div className="flex-1">};

                      <div className="flex items-center gap-2">

                        <span className="inline-block px-3 py-1 bg-ocean-100 text-ocean-700 text-sm font-semibold rounded">export default VersionHistory;

                          v{version.versionNumber}
                        </span>
                        {version.isCurrent && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        {version.message || (version.isCurrent ? 'Latest version' : 'Previous version')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(version.createdAt)}
                      </p>
                    </div>

                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestoreVersion(version.versionNumber)}
                        disabled={loading}
                        className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        Restore
                      </button>
                    )}
                  </div>

                  {/* XML Preview (expandable) */}
                  <button
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === version.versionNumber ? null : version.versionNumber
                      )
                    }
                    className="mt-3 text-xs text-ocean-600 hover:text-ocean-700 font-medium"
                  >
                    {expandedVersion === version.versionNumber ? '▼ Hide XML' : '▶ Show XML Preview'}
                  </button>

                  {expandedVersion === version.versionNumber && (
                    <pre className="mt-3 p-3 bg-slate-100 rounded border border-slate-200 text-xs overflow-x-auto max-h-48">
                      <code>{formatXmlPreview(version.xmlContent)}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VersionHistory;
