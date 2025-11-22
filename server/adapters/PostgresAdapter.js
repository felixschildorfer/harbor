import { Pool } from 'pg';
import DatabaseAdapter from './DatabaseAdapter.js';

/**
 * PostgresAdapter - PostgreSQL database adapter
 * Handles connections and queries to PostgreSQL instances
 */
class PostgresAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.pool = null;

    const options = this.normalizeOptions(config.options);
    const maxPoolSize = this.parseNumber(options.maxPoolSize ?? options.max, 10);
    const idleTimeout = this.parseNumber(options.idleTimeoutMillis ?? options.idleTimeout, 30000);
    const connectionTimeout = this.parseNumber(options.connectionTimeoutMillis ?? options.connectionTimeout, 10000);

    this.poolConfig = {
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port || 5432,
      database: config.databaseName,
      ssl: this.buildSslConfig(options),
      max: maxPoolSize,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
    };
  }

  /**
   * Parse numeric options while preserving sensible defaults
   * @param {string|number|undefined} value
   * @param {number} fallback
   * @returns {number}
   */
  parseNumber(value, fallback) {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /**
   * Normalize options that may come from a Mongoose Map or plain object
   * @param {Map|Object} rawOptions
   * @returns {Object}
   */
  normalizeOptions(rawOptions) {
    if (!rawOptions) {
      return {};
    }

    if (rawOptions instanceof Map) {
      return Object.fromEntries(rawOptions.entries());
    }

    return rawOptions;
  }

  /**
   * Build SSL configuration for PostgreSQL
   * @param {Object} options
   * @returns {boolean|Object}
   */
  buildSslConfig(options) {
    if (!options) {
      return false;
    }

    const sslValue = options.ssl ?? options.SSL ?? options.useSSL;
    if (sslValue === undefined) {
      return false;
    }

    const stringValue = String(sslValue).toLowerCase();
    const shouldUseSsl = ['true', '1', 'require', 'verify-full', 'verify-ca', 'prefer', 'allow'].includes(stringValue);

    if (!shouldUseSsl) {
      return false;
    }

    const rejectUnauthorized = options.rejectUnauthorized === undefined
      ? true
      : String(options.rejectUnauthorized).toLowerCase() !== 'false';

    return {
      rejectUnauthorized,
    };
  }

  /**
   * Lazily create or reuse the connection pool
   * @returns {Promise<Pool>}
   */
  async getPool() {
    if (!this.pool) {
      this.pool = new Pool(this.poolConfig);
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
      const result = await pool.query('SELECT 1');
      return result.rowCount > 0;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error.message);
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
      const result = await pool.query(query);
      const executionTime = Date.now() - startTime;

      const queryType = this.getQueryType(query);
      const columns = result.fields ? result.fields.map(field => field.name) : [];
      const rowsAffected = typeof result.rowCount === 'number' ? result.rowCount : 0;

      return {
        success: true,
        queryType,
        recordset: result.rows || [],
        rowsAffected,
        columns,
        executionTime,
        message: this.getSuccessMessage(queryType, rowsAffected),
      };
    } catch (error) {
      console.error('PostgreSQL query execution failed:', error.message);

      return {
        success: false,
        error: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        schema: error.schema,
        table: error.table,
        column: error.column,
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
    if (trimmed.startsWith('DO')) return 'ANONYMOUS_BLOCK';
    if (trimmed.startsWith('CALL')) return 'PROCEDURE';

    return 'OTHER';
  }

  /**
   * Build success message based on query type
   * @param {string} queryType
   * @param {number} rowsAffected
   * @returns {string}
   */
  getSuccessMessage(queryType, rowsAffected = 0) {
    switch (queryType) {
      case 'SELECT':
        return `Query returned ${rowsAffected} row(s)`;
      case 'INSERT':
        return `Successfully inserted ${rowsAffected} row(s)`;
      case 'UPDATE':
        return `Successfully updated ${rowsAffected} row(s)`;
      case 'DELETE':
        return `Successfully deleted ${rowsAffected} row(s)`;
      case 'DDL':
        return 'DDL command executed successfully';
      case 'PROCEDURE':
        return 'Procedure executed successfully';
      case 'ANONYMOUS_BLOCK':
        return 'Anonymous block executed successfully';
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
      await this.pool.end();
      this.pool = null;
    }
  }
}

export default PostgresAdapter;
