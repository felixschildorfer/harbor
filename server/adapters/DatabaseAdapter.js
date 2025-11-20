/**
 * DatabaseAdapter - Abstract interface for database connections
 * All database adapters should implement these methods
 */
class DatabaseAdapter {
  constructor(config) {
    this.config = config;
  }

  /**
   * Test the database connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented');
  }

  /**
   * Execute a SQL query
   * @param {string} query - SQL query to execute
   * @returns {Promise<Object>} - Query results
   */
  async executeQuery(query) {
    throw new Error('executeQuery() must be implemented');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('close() must be implemented');
  }

  /**
   * Validate SQL query (basic validation)
   * @param {string} query - SQL query to validate
   * @returns {boolean}
   */
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    // Basic validation - can be extended
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      throw new Error('Query cannot be empty');
    }

    // Check for common SQL injection patterns (basic)
    const dangerousPatterns = [
      /;\s*drop\s+/i,
      /;\s*delete\s+from\s+/i,
      /;\s*truncate\s+/i,
      /xp_cmdshell/i,
      /exec\s*\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        console.warn('Potentially dangerous SQL pattern detected:', trimmed);
      }
    }

    return true;
  }
}

export default DatabaseAdapter;
