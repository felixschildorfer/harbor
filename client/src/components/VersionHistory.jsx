import React, { useState, useEffect, useCallback } from 'react';
import { anchorModelsAPI } from '../services/api';

function VersionHistory({ modelId, isOpen, onClose, onVersionRestored }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedVersion, setExpandedVersion] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await anchorModelsAPI.getHistory(modelId);
      setHistory(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load version history';
      setError(errorMsg);
      console.error('Error loading version history:', err);
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (isOpen && modelId) {
      loadHistory();
    }
  }, [isOpen, modelId, loadHistory]);

  const handleRestoreVersion = async (versionNumber) => {
    try {
      setLoading(true);
      setError(null);

      const response = await anchorModelsAPI.restoreVersion(modelId, versionNumber);

      await loadHistory();

      if (onVersionRestored) {
        onVersionRestored(response.data.model);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to restore version';
      setError(errorMsg);
      console.error('Error restoring version:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatXmlPreview = (xml) => {
    return xml.substring(0, 200) + (xml.length > 200 ? '...' : '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-100 border-b border-slate-300 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Version History</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading && !history.length ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
              <p className="text-slate-600 mt-2">Loading version history...</p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No versions available</p>
          ) : (
            <div className="space-y-4">
              {history.map((version) => (
                <div
                  key={version.versionNumber || 'current'}
                  className={`border rounded-lg p-4 transition-all ${
                    expandedVersion === version.versionNumber
                      ? 'border-ocean-400 bg-ocean-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-3 py-1 bg-ocean-100 text-ocean-700 text-sm font-semibold rounded">
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
