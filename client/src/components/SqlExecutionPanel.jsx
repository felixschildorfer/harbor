import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { databaseAPI } from '../services/api';

/**
 * SqlExecutionPanel - Execute SQL queries and view results
 */
const DB_LABELS = {
  sqlserver: 'SQL Server',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
};

const SqlExecutionPanel = ({ isOpen, onClose, addToast }) => {
  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  // Fetch connections
  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, fetchConnections]);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await databaseAPI.getConnections();
      const conns = response.data.connections || [];
      setConnections(conns);
      if (conns.length > 0) {
        setSelectedConnectionId((prev) => prev || conns[0]._id);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch connections', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      addToast('Please enter a SQL query', 'error');
      return;
    }

    if (!selectedConnectionId) {
      addToast('Please select a database connection', 'error');
      return;
    }

    try {
      setExecuting(true);
      setResult(null);
      
      const response = await databaseAPI.executeQuery(selectedConnectionId, query);
      setResult(response.data);

      if (response.data.success) {
        addToast(response.data.message || 'Query executed successfully', 'success');
      } else {
        addToast(response.data.error || 'Query execution failed', 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Query execution failed';
      addToast(errorMsg, 'error');
      setResult({
        success: false,
        error: errorMsg,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleClearResults = () => {
    setResult(null);
  };

  const handleClearQuery = () => {
    setQuery('');
    setResult(null);
  };

  if (!isOpen) return null;

  const selectedConnection = connections.find(c => c._id === selectedConnectionId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-navy-950">
              SQL Query Execution
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Connection Selector */}
            <div>
              <label htmlFor="connection" className="block text-sm font-medium text-slate-700 mb-1">
                Database Connection
              </label>
              {connections.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  No database connections found. Please add a connection first.
                </div>
              ) : (
                <div className="flex gap-3">
                  <select
                    id="connection"
                    value={selectedConnectionId}
                    onChange={(e) => setSelectedConnectionId(e.target.value)}
                    disabled={loading || executing}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
                  >
                    {connections.map((conn) => {
                      const label = DB_LABELS[conn.dbType] || conn.dbType;
                      return (
                        <option key={conn._id} value={conn._id}>
                          {conn.name} ({label} - {conn.databaseName})
                        </option>
                      );
                    })}
                  </select>
                  {selectedConnection && (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                      {selectedConnection.host}:{selectedConnection.port}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SQL Query Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="query" className="block text-sm font-medium text-slate-700">
                  SQL Query
                </label>
                <button
                  onClick={handleClearQuery}
                  disabled={executing}
                  className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={executing}
                placeholder="SELECT * FROM TableName"
                rows="8"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent font-mono text-sm disabled:opacity-50"
              />
            </div>

            {/* Execute Button */}
            <div className="flex gap-3">
              <button
                onClick={handleExecuteQuery}
                disabled={executing || !selectedConnectionId || !query.trim()}
                style={{
                  backgroundColor: '#1e6091',
                  color: 'white',
                  border: '2px solid #0f3a5d',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: (executing || !selectedConnectionId || !query.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (executing || !selectedConnectionId || !query.trim()) ? 0.5 : 1,
                }}
              >
                {executing ? 'Executing...' : '▶ Execute Query'}
              </button>
              {result && (
                <button
                  onClick={handleClearResults}
                  className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100"
                >
                  Clear Results
                </button>
              )}
            </div>

            {/* Results */}
            {result && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className={`px-4 py-2 font-medium ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {result.success ? '✓ Success' : '✗ Error'}
                </div>
                
                {result.success ? (
                  <div className="p-4 space-y-3">
                    {/* Metadata */}
                    <div className="flex gap-4 text-sm text-slate-600">
                      <div><span className="font-medium">Type:</span> {result.queryType}</div>
                      <div><span className="font-medium">Rows:</span> {result.rowsAffected || result.recordset?.length || 0}</div>
                      <div><span className="font-medium">Time:</span> {result.executionTime}ms</div>
                    </div>

                    {/* Message */}
                    {result.message && (
                      <div className="text-sm text-slate-700">
                        {result.message}
                      </div>
                    )}

                    {/* Data Table */}
                    {result.recordset && result.recordset.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              {result.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="px-4 py-2 text-left font-medium text-slate-700 border-b border-slate-200"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {result.recordset.slice(0, 100).map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-slate-50">
                                {result.columns.map((col, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-4 py-2 text-slate-700 font-mono text-xs"
                                  >
                                    {row[col] === null ? (
                                      <span className="text-slate-400 italic">NULL</span>
                                    ) : (
                                      String(row[col])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {result.recordset.length > 100 && (
                          <div className="p-2 text-center text-sm text-slate-500 bg-slate-50">
                            Showing first 100 of {result.recordset.length} rows
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    <div className="font-mono text-sm text-red-700">
                      {result.error}
                    </div>
                    {result.lineNumber && (
                      <div className="text-xs text-red-600">
                        Line {result.lineNumber}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

SqlExecutionPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addToast: PropTypes.func.isRequired,
};

export default SqlExecutionPanel;
