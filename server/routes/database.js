import express from 'express';
import { body, validationResult } from 'express-validator';
import DatabaseConnection from '../models/DatabaseConnection.js';
import AdapterFactory from '../adapters/AdapterFactory.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const isAdmin = (user) => user.roles?.includes('admin');
const isOwner = (connection, userId) => connection.ownerId?.toString() === userId;
const isShared = (connection, userId) => connection.sharedWith?.some((id) => id.toString() === userId);
const canAccess = (connection, user) => isOwner(connection, user.id) || isShared(connection, user.id) || isAdmin(user);
const canModify = (connection, user) => isOwner(connection, user.id) || isAdmin(user);

router.use(requireAuth);

/**
 * POST /api/db/connections
 * Create a new database connection
 */
router.post('/connections',
  [
    body('name').trim().notEmpty().withMessage('Connection name is required'),
    body('dbType').isIn(['sqlserver', 'postgres']).withMessage('Invalid database type'),
    body('host').trim().notEmpty().withMessage('Host is required'),
    body('port').isInt({ min: 1, max: 65535 }).withMessage('Valid port number is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('databaseName').trim().notEmpty().withMessage('Database name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, dbType, host, port, username, password, databaseName, options } = req.body;

      // Create new connection
      const connection = new DatabaseConnection({
        ownerId: req.user.id,
        name,
        dbType,
        host,
        port,
        username,
        password, // Will be encrypted by pre-save hook
        databaseName,
        options: options || {},
      });

      await connection.save();

      res.status(201).json({
        message: 'Database connection created successfully',
        connection: connection.getSafeConfig(),
      });
    } catch (error) {
      console.error('Error creating database connection:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/db/connections
 * Get all database connections for the user
 */
router.get('/connections', async (req, res) => {
  try {
    const query = isAdmin(req.user)
      ? {}
      : {
          $or: [
            { ownerId: req.user.id },
            { sharedWith: req.user.id },
          ],
        };
    const connections = await DatabaseConnection.find(query);

    res.json({
      connections: connections.map(conn => conn.getSafeConfig()),
    });
  } catch (error) {
    console.error('Error fetching database connections:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/db/connections/:id
 * Get a specific database connection
 */
router.get('/connections/:id', async (req, res) => {
  try {
    const connection = await DatabaseConnection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (!canAccess(connection, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ connection: connection.getSafeConfig() });
  } catch (error) {
    console.error('Error fetching database connection:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/db/connections/:id
 * Update a database connection
 */
router.put('/connections/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('host').optional().trim().notEmpty(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
    body('username').optional().trim().notEmpty(),
    body('password').optional().notEmpty(),
    body('databaseName').optional().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const connection = await DatabaseConnection.findById(req.params.id);

      if (!connection) {
        return res.status(404).json({ message: 'Connection not found' });
      }

      if (!canModify(connection, req.user)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Update fields
      const allowedUpdates = ['name', 'host', 'port', 'username', 'password', 'databaseName', 'options'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          connection[field] = req.body[field];
        }
      });

      await connection.save();

      res.json({
        message: 'Connection updated successfully',
        connection: connection.getSafeConfig(),
      });
    } catch (error) {
      console.error('Error updating database connection:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * DELETE /api/db/connections/:id
 * Delete a database connection
 */
router.delete('/connections/:id', async (req, res) => {
  try {
    const connection = await DatabaseConnection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (!canModify(connection, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await connection.deleteOne();

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting database connection:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/db/test-connection/:id
 * Test a database connection
 */
router.post('/test-connection/:id', async (req, res) => {
  try {
    const connection = await DatabaseConnection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (!canAccess(connection, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create adapter and test connection
    const config = {
      ...connection.toObject(),
      password: connection.getDecryptedPassword(),
    };

    const adapter = AdapterFactory.createAdapter(connection.dbType, config);
    const isConnected = await adapter.testConnection();
    await adapter.close();

    res.json({
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed',
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/db/execute
 * Execute a SQL query
 */
router.post('/execute',
  [
    body('connectionId').notEmpty().withMessage('Connection ID is required'),
    body('query').trim().notEmpty().withMessage('SQL query is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { connectionId, query } = req.body;

      // Find the connection
      const connection = await DatabaseConnection.findById(connectionId);

      if (!connection) {
        return res.status(404).json({ message: 'Connection not found' });
      }

      if (!canAccess(connection, req.user)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Create adapter with decrypted password
      const config = {
        ...connection.toObject(),
        password: connection.getDecryptedPassword(),
      };

      const adapter = AdapterFactory.createAdapter(connection.dbType, config);

      // Execute query
      const result = await adapter.executeQuery(query);

      // Close adapter (or keep pool alive - depends on strategy)
      await adapter.close();

      // Log query execution for auditing
      console.log(`Query executed by ${req.user.id} on ${connection.name}:`, query.substring(0, 100));

      res.json(result);
    } catch (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
