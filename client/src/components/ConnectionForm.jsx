import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ConnectionForm - Form for adding/editing database connections
 */
const ConnectionForm = ({ onSubmit, onCancel, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    dbType: 'sqlserver',
    host: '',
    port: 1433,
    username: '',
    password: '',
    databaseName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || '' : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Connection Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="My SQL Server"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="dbType" className="block text-sm font-medium text-slate-700 mb-1">
          Database Type *
        </label>
        <select
          id="dbType"
          name="dbType"
          value={formData.dbType}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="sqlserver">Microsoft SQL Server</option>
          <option value="postgres" disabled>PostgreSQL (Coming Soon)</option>
          <option value="mysql" disabled>MySQL (Coming Soon)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-slate-700 mb-1">
            Host *
          </label>
          <input
            type="text"
            id="host"
            name="host"
            value={formData.host}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="localhost or IP"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="port" className="block text-sm font-medium text-slate-700 mb-1">
            Port *
          </label>
          <input
            type="number"
            id="port"
            name="port"
            value={formData.port}
            onChange={handleChange}
            required
            disabled={loading}
            min="1"
            max="65535"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="databaseName" className="block text-sm font-medium text-slate-700 mb-1">
          Database Name *
        </label>
        <input
          type="text"
          id="databaseName"
          name="databaseName"
          value={formData.databaseName}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="database_name"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
          Username *
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="sa or username"
          autoComplete="username"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
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
            flex: 1,
          }}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Connection' : 'Create Connection')}
        </button>
      </div>
    </form>
  );
};

ConnectionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};

export default ConnectionForm;
