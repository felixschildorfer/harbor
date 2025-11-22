import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { databaseAPI } from '../services/api';
import ConnectionForm from './ConnectionForm';

/**
 * DatabaseSettings - Manage database connections
 */
const DB_LABELS = {
  sqlserver: 'SQL Server',
  postgres: 'PostgreSQL',
};

const DatabaseSettings = ({ isOpen, onClose, addToast }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [testingId, setTestingId] = useState(null);

  // Fetch connections
  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await databaseAPI.getConnections();
      setConnections(response.data.connections || []);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch connections', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, fetchConnections]);

  const handleCreateConnection = async (formData) => {
    try {
      setLoading(true);
      await databaseAPI.createConnection(formData);
      addToast('Connection created successfully', 'success');
      setShowForm(false);
      fetchConnections();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConnection = async (formData) => {
    try {
      setLoading(true);
      await databaseAPI.updateConnection(editingConnection._id, formData);
      addToast('Connection updated successfully', 'success');
      setShowForm(false);
      setEditingConnection(null);
      fetchConnections();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      setLoading(true);
      await databaseAPI.deleteConnection(id);
      addToast('Connection deleted successfully', 'success');
      fetchConnections();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id) => {
    try {
      setTestingId(id);
      const response = await databaseAPI.testConnection(id);
      if (response.data.success) {
        addToast('Connection successful!', 'success');
      } else {
        addToast('Connection failed', 'error');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Connection test failed', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleEditClick = (connection) => {
    setEditingConnection(connection);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingConnection(null);
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-navy-950">
              Database Connections
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {showForm ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {editingConnection ? 'Edit Connection' : 'New Connection'}
                </h3>
                <ConnectionForm
                  onSubmit={editingConnection ? handleUpdateConnection : handleCreateConnection}
                  onCancel={handleCancelForm}
                  initialData={editingConnection}
                  loading={loading}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-slate-600">
                    Manage your database connections
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                    style={{
                      backgroundColor: '#1e6091',
                      color: 'white',
                      border: '2px solid #0f3a5d',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    + New Connection
                  </button>
                </div>

                {loading && connections.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Loading connections...
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗄️</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      No Connections Yet
                    </h3>
                    <p className="text-slate-500">
                      Add your first database connection to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connections.map((conn) => (
                      <div
                        key={conn._id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-ocean-500 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-slate-900">
                              {conn.name}
                            </h4>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">Type:</span> {DB_LABELS[conn.dbType] || conn.dbType.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">Database:</span> {conn.databaseName}
                              </div>
                              <div>
                                <span className="font-medium">Host:</span> {conn.host}:{conn.port}
                              </div>
                              <div>
                                <span className="font-medium">User:</span> {conn.username}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleTestConnection(conn._id)}
                              disabled={testingId === conn._id}
                              className="px-3 py-1 text-sm border border-green-500 text-green-600 rounded hover:bg-green-50 disabled:opacity-50"
                            >
                              {testingId === conn._id ? 'Testing...' : 'Test'}
                            </button>
                            <button
                              onClick={() => handleEditClick(conn)}
                              className="px-3 py-1 text-sm border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteConnection(conn._id)}
                              className="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

DatabaseSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addToast: PropTypes.func.isRequired,
};

export default DatabaseSettings;
