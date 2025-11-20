import sql from 'mssql';
import DatabaseAdapter from './DatabaseAdapter.js';

/**
 * SqlServerAdapter - SQL Server database adapter
 * Handles connections and queries to Microsoft SQL Server
 */
class SqlServerAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.pool = null;
    this.sqlConfig = {
      user: config.username,
      password: config.password,
      server: config.host,
      port: config.port || 1433,
      database: config.databaseName,
      options: {
        encrypt: config.options?.encrypt !== 'false', // Default to true for Azure
        trustServerCertificate: config.options?.trustServerCertificate === 'true',
        enableArithAbort: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: 15000,
      requestTimeout: 15000,
    };
  }

  /**
   * Get or create connection pool
   * @returns {Promise<sql.ConnectionPool>}
   */
  async getPool() {
    if (!this.pool) {
      this.pool = await sql.connect(this.sqlConfig);
    }
    return this.pool;
  }

  /**
   * Test the database connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const pool = await this.getPool();
      const result = await pool.request().query('SELECT 1 AS test');
      return result.recordset.length > 0;
    } catch (error) {
      console.error('SQL Server connection test failed:', error.message);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query
   * @param {string} query - SQL query to execute
   * @returns {Promise<Object>} - Query results with metadata
   */
  async executeQuery(query) {
    this.validateQuery(query);

    try {
      const pool = await this.getPool();
      const startTime = Date.now();
      const result = await pool.request().query(query);
      const executionTime = Date.now() - startTime;

      // Determine query type
      const queryType = this.getQueryType(query);

      return {
        success: true,
        queryType,
        recordset: result.recordset || [],
        rowsAffected: result.rowsAffected ? result.rowsAffected[0] : 0,
        columns: result.recordset && result.recordset.length > 0 
          ? Object.keys(result.recordset[0]) 
          : [],
        executionTime,
        message: this.getSuccessMessage(queryType, result.rowsAffected),
      };
    } catch (error) {
      console.error('SQL Server query execution failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        number: error.number,
        state: error.state,
        class: error.class,
        lineNumber: error.lineNumber,
      };
    }
  }

  /**
   * Determine the type of SQL query
   * @param {string} query
   * @returns {string}
   */
  getQueryType(query) {
    const trimmed = query.trim().toUpperCase();
    
    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    if (trimmed.startsWith('CREATE')) return 'DDL';
    if (trimmed.startsWith('ALTER')) return 'DDL';
    if (trimmed.startsWith('DROP')) return 'DDL';
    if (trimmed.startsWith('EXEC') || trimmed.startsWith('EXECUTE')) return 'PROCEDURE';
    
    return 'OTHER';
  }

  /**
   * Get success message based on query type
   * @param {string} queryType
   * @param {Array} rowsAffected
   * @returns {string}
   */
  getSuccessMessage(queryType, rowsAffected = []) {
    const affected = rowsAffected[0] || 0;
    
    switch (queryType) {
      case 'SELECT':
        return `Query returned ${affected} row(s)`;
      case 'INSERT':
        return `Successfully inserted ${affected} row(s)`;
      case 'UPDATE':
        return `Successfully updated ${affected} row(s)`;
      case 'DELETE':
        return `Successfully deleted ${affected} row(s)`;
      case 'DDL':
        return 'DDL command executed successfully';
      case 'PROCEDURE':
        return 'Stored procedure executed successfully';
      default:
        return 'Query executed successfully';
    }
  }

  /**
   * Close the database connection pool
   * @returns {Promise<void>}
   */
  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

export default SqlServerAdapter;
