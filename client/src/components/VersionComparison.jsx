import React, { useState, useEffect } from 'react';
import { anchorModelsAPI } from '../services/api';
import { parseXmlEntities, compareEntities } from '../utils/xmlParser';
import '../styles/VersionComparison.css';

const VersionComparison = ({ modelId, versions, onClose }) => {
  const [v1, setV1] = useState(versions[0]?.versionNumber || 1);
  const [v2, setV2] = useState(versions[versions.length - 1]?.versionNumber || 1);
  const [comparison, setComparison] = useState(null);
  const [entityComparison, setEntityComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('entities'); // 'entities' or 'xml'

  useEffect(() => {
    const loadComparison = async () => {
      if (v1 === v2) {
        setComparison(null);
        setEntityComparison(null);
        return;
      }

      try {
        setLoading(true);
        const result = await anchorModelsAPI.compareVersions(modelId, v1, v2);
        setComparison(result);

        // Parse entities from both versions
        const entities1 = parseXmlEntities(result.version1.xmlContent);
        const entities2 = parseXmlEntities(result.version2.xmlContent);
        const entityDiff = compareEntities(entities1, entities2);

        setEntityComparison({ entities1, entities2, diff: entityDiff });
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to compare versions');
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [modelId, v1, v2]);

  const highlightDifferences = (text1, text2) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    const diffs = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      diffs.push({
        lineNum: i + 1,
        left: line1,
        right: line2,
        changed: line1 !== line2,
      });
    }

    return diffs;
  };

  const renderEntityList = (entities, diff) => {
    if (!entities || Object.values(entities).every((arr) => arr.length === 0)) {
      return <p className="entity-empty">No entities in this version</p>;
    }

    const entityTypes = [
      { key: 'anchors', label: 'Anchors' },
      { key: 'attributes', label: 'Attributes' },
      { key: 'ties', label: 'Ties' },
      { key: 'nexus', label: 'Nexus' },
      { key: 'knots', label: 'Knots' },
    ];

    return (
      <div className="entity-container">
        {entityTypes.map(({ key, label: entityLabel }) => {
          const items = entities[key] || [];
          if (items.length === 0) return null;

          return (
            <div key={key} className="entity-section">
              <h4 className="entity-type-header">
                {entityLabel} ({items.length})
              </h4>
              <ul className="entity-list">
                {items.map((item, idx) => {
                  const isAdded = diff?.added?.some((a) => a.id === item.id);
                  const isRemoved = diff?.removed?.some((r) => r.id === item.id);
                  const isModified = diff?.modified?.some((m) => m.id === item.id);

                  let statusClass = '';
                  let statusIcon = '';
                  if (isAdded) {
                    statusClass = 'status-added';
                    statusIcon = '+';
                  } else if (isRemoved) {
                    statusClass = 'status-removed';
                    statusIcon = '−';
                  } else if (isModified) {
                    statusClass = 'status-modified';
                    statusIcon = '~';
                  }

                  return (
                    <li key={idx} className={`entity-item ${statusClass}`}>
                      {statusIcon && <span className="status-badge">{statusIcon}</span>}
                      <span className="entity-id">{item.id}</span>
                      {item.mne && <span className="entity-mne">{item.mne}</span>}
                      {item.anchor && <span className="entity-meta">↳ {item.anchor}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const diffs = comparison ? highlightDifferences(comparison.version1.xmlContent, comparison.version2.xmlContent) : [];

  return (
    <div className="version-comparison-modal">
      <div className="version-comparison-content">
        <h2>Compare Versions</h2>

        <div className="comparison-controls">
          <div className="version-selector">
            <label>From Version:</label>
            <select value={v1} onChange={(e) => setV1(parseInt(e.target.value))}>
              {versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="version-selector">
            <label>To Version:</label>
            <select value={v2} onChange={(e) => setV2(parseInt(e.target.value))}>
              {versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* View Mode Tabs */}
        {!loading && comparison && v1 !== v2 && (
          <div className="view-mode-tabs">
            <button
              className={`tab-button ${viewMode === 'entities' ? 'active' : ''}`}
              onClick={() => setViewMode('entities')}
            >
              Entities
            </button>
            <button
              className={`tab-button ${viewMode === 'xml' ? 'active' : ''}`}
              onClick={() => setViewMode('xml')}
            >
              XML Code
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading comparison...</p>
        ) : v1 === v2 ? (
          <p>Please select different versions to compare.</p>
        ) : viewMode === 'entities' && entityComparison ? (
          // Entity View
          <div className="entity-comparison-view">
            <div className="entity-columns">
              <div className="entity-column">
                <h3>Version {v1}</h3>
                {renderEntityList(entityComparison.entities1, entityComparison.diff.anchors)}
              </div>

              <div className="entity-change-summary">
                <h3>Changes</h3>
                <div className="change-stats">
                  {['anchors', 'attributes', 'ties', 'nexus', 'knots'].map((key) => {
                    const diff = entityComparison.diff[key];
                    const hasChanges =
                      diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;

                    if (!hasChanges) return null;

                    const entityLabel = key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <div key={key} className="change-item">
                        <h4>{entityLabel}</h4>
                        {diff.added.length > 0 && (
                          <p className="stat-added">+ {diff.added.length} added</p>
                        )}
                        {diff.removed.length > 0 && (
                          <p className="stat-removed">− {diff.removed.length} removed</p>
                        )}
                        {diff.modified.length > 0 && (
                          <p className="stat-modified">~ {diff.modified.length} modified</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="entity-column">
                <h3>Version {v2}</h3>
                {renderEntityList(entityComparison.entities2, entityComparison.diff.anchors)}
              </div>
            </div>
          </div>
        ) : (
          // XML View
          <div className="diff-view">
            <div className="diff-columns">
              <div className="diff-column">
                <h3>Version {v1}</h3>
                <div className="diff-content">
                  {diffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className={`diff-line ${diff.changed ? 'changed' : ''}`}
                    >
                      <span className="line-num">{diff.lineNum}</span>
                      <span className="line-content">{diff.left || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="diff-column">
                <h3>Version {v2}</h3>
                <div className="diff-content">
                  {diffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className={`diff-line ${diff.changed ? 'changed' : ''}`}
                    >
                      <span className="line-num">{diff.lineNum}</span>
                      <span className="line-content">{diff.right || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

export default VersionComparison;
