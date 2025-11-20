import SqlServerAdapter from './SqlServerAdapter.js';
// Future imports
// import PostgresAdapter from './PostgresAdapter.js';
// import MySQLAdapter from './MySQLAdapter.js';

/**
 * AdapterFactory - Creates appropriate database adapter based on type
 */
class AdapterFactory {
  /**
   * Create a database adapter
   * @param {string} dbType - Type of database (sqlserver, postgres, mysql)
   * @param {Object} config - Connection configuration
   * @returns {DatabaseAdapter}
   */
  static createAdapter(dbType, config) {
    switch (dbType.toLowerCase()) {
      case 'sqlserver':
        return new SqlServerAdapter(config);
      
      case 'postgres':
        throw new Error('PostgreSQL adapter not yet implemented');
        // return new PostgresAdapter(config);
      
      case 'mysql':
        throw new Error('MySQL adapter not yet implemented');
        // return new MySQLAdapter(config);
      
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

export default AdapterFactory;
