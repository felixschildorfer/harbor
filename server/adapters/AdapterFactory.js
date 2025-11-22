import SqlServerAdapter from './SqlServerAdapter.js';
import PostgresAdapter from './PostgresAdapter.js';

/**
 * AdapterFactory - Creates appropriate database adapter based on type
 */
class AdapterFactory {
  /**
   * Create a database adapter
  * @param {string} dbType - Type of database (sqlserver, postgres)
   * @param {Object} config - Connection configuration
   * @returns {DatabaseAdapter}
   */
  static createAdapter(dbType, config) {
    switch (dbType.toLowerCase()) {
      case 'sqlserver':
        return new SqlServerAdapter(config);
      
      case 'postgres':
      case 'postgresql':
        return new PostgresAdapter(config);
      
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

export default AdapterFactory;
