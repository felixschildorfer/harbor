# Database Integration - Feature Documentation

## Overview

Harbor now supports direct integration with external databases, allowing users to connect to multiple database servers and execute SQL queries directly from the application interface. The current release ships with adapters for **Microsoft SQL Server** and **PostgreSQL**.

> **Before you start**
> 1. Configure `DB_ENCRYPTION_KEY` in `server/.env` with a 64-character hex value and restart the backend so the encryption helper can load it.
> 2. Verify `CLIENT_ORIGIN` matches the React dev server origin so authenticated requests keep their cookies.
> 3. Confirm MongoDB (local or Atlas) is reachable—connection metadata is persisted there alongside anchor models.

## Architecture

### Backend Components

#### 1. Database Adapter Pattern
- **DatabaseAdapter** (Abstract Interface): Defines standard methods all database adapters must implement
- **SqlServerAdapter**: Microsoft SQL Server implementation with connection pooling
- **PostgresAdapter**: PostgreSQL implementation powered by the `pg` client library
- **AdapterFactory**: Factory pattern for creating appropriate database adapters

#### 2. Data Model
- **DatabaseConnection**: MongoDB model storing connection details
   - Encrypted password storage using AES-256
   - User-specific connections via userId
   - Support for SQL Server and PostgreSQL connections

#### 3. API Endpoints (`/api/db/`)
- `POST /connections` - Create new database connection
- `GET /connections` - List all user connections
- `GET /connections/:id` - Get specific connection
- `PUT /connections/:id` - Update connection
- `DELETE /connections/:id` - Delete connection
- `POST /test-connection/:id` - Test connection validity
- `POST /execute` - Execute SQL query

#### 4. Security Features
- Password encryption using crypto (AES-256-CBC)
- JWT authentication middleware (structure in place)
- SQL injection pattern detection
- Query execution auditing via console logs

### Frontend Components

#### 1. ConnectionForm
- Form component for creating/editing database connections
- Fields: name, type, host, port, database, username, password
- Validation and disabled states during submission

#### 2. DatabaseSettings
- Modal page for managing database connections
- Features:
  - List all connections
  - Test connection functionality
  - Edit/Delete operations
  - Create new connections

#### 3. SqlExecutionPanel
- SQL query execution interface
- Features:
  - Connection selector dropdown
  - SQL input text area
  - Execute button with loading states
  - Results table display
  - Error messaging
  - Query metadata (execution time, rows affected)

#### 4. API Service Layer
- `databaseAPI` object in `services/api.js`
- Centralized API calls for all database operations

## Usage Guide

### Adding a Database Connection

1. Click "🗄️ DB Connections" in the sidebar
2. Click "+ New Connection"
3. Fill in connection details:
   - Connection Name (e.g., "Production SQL Server" or "Staging Postgres")
   - Database Type (SQL Server or PostgreSQL)
   - Host (IP or hostname)
   - Port (default 1433 for SQL Server, 5432 for PostgreSQL)
   - Database Name
   - Username
   - Password
4. Click "Create Connection"
5. Optionally click "Test" to verify connection

### Executing SQL Queries

1. Click "⚡ Execute SQL" in the sidebar
2. Select a database connection from the dropdown
3. Enter your SQL query in the text area
4. Click "▶ Execute Query"
5. View results in the table below

#### Supported Query Types
- **SELECT**: View query results in table format
- **INSERT**: See rows affected count
- **UPDATE**: See rows affected count
- **DELETE**: See rows affected count
- **DDL**: CREATE, ALTER, DROP statements
- **Stored Procedures**: EXEC statements

### Query Results Display

Results include:
- **Query Type**: SELECT, INSERT, UPDATE, DELETE, DDL, etc.
- **Rows Affected**: Number of rows returned or modified
- **Execution Time**: Query execution duration in milliseconds
- **Data Table**: First 100 rows displayed in tabular format
- **Error Messages**: Detailed error information if query fails

## Security Considerations

### Current Implementation

1. **Password Encryption**
   - Passwords encrypted with AES-256-CBC before storage
   - Decryption only occurs server-side during execution
   - Never sent to frontend
   - Requires a stable `DB_ENCRYPTION_KEY`; rotating the key invalidates previously saved credentials and those connections must be recreated

2. **SQL Injection Protection**
   - Basic pattern detection for dangerous SQL
   - Warnings logged for suspicious queries
   - No parameterization (planned improvement)

3. **Authentication**
   - JWT middleware structure in place
   - Currently uses temporary user ID ('user123')
   - Ready for full user authentication system

4. **Auditing**
   - All query executions logged to console
   - Includes user ID, connection name, and query preview

### Production Recommendations

**Before deploying to production:**

1. **Implement Full User Authentication**
   - Replace TEMP_USER_ID with real JWT authentication
   - Enable auth middleware to reject unauthenticated requests
   - Store JWT_SECRET in environment variable

2. **Enhance Encryption**
   - Store DB_ENCRYPTION_KEY in environment variable
   - Use strong, randomly generated key (current: auto-generated)
   - Consider using HSM or key management service

3. **Improve SQL Validation**
   - Implement query parameterization
   - Add query whitelisting for production
   - Consider query execution timeouts
   - Implement rate limiting

4. **Database Permissions**
   - Use least-privilege database accounts
   - Create read-only connections when appropriate
   - Avoid using 'sa' or root accounts

5. **Audit Logging**
   - Store query logs in database or logging service
   - Include timestamp, user, connection, query, and result status
   - Implement log retention policies

## Future Enhancements

### Planned Features

1. **Additional Database Support**
   - MySQL adapter
   - Oracle adapter
   - MongoDB query interface

2. **Query Management**
   - Save favorite queries
   - Query history per user
   - Query templates
   - Export results to CSV/Excel

3. **Advanced Execution**
   - Query parameterization UI
   - Transaction support
   - Batch query execution
   - Query scheduling

4. **Visualization**
   - Chart generation from query results
   - Schema visualization
   - Query performance insights

5. **Collaboration**
   - Share connections with team members
   - Read-only connection mode
   - Query result sharing

## Technical Details

### Database Connection Model Schema

```javascript
{
  userId: String (indexed),
  name: String (required),
   dbType: enum ['sqlserver', 'postgres'],
  host: String (required),
  port: Number (required),
  username: String (required),
  password: String (encrypted, required),
  databaseName: String (required),
  options: Map<String, String>,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### SQL Server Connection Configuration

```javascript
{
  user: username,
  password: decryptedPassword,
  server: host,
  port: port || 1433,
  database: databaseName,
  options: {
    encrypt: true,  // Default for Azure
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 15000,
  requestTimeout: 15000
}
```

### PostgreSQL Connection Configuration

```javascript
{
   user: username,
   password: decryptedPassword,
   host: host,
   port: port || 5432,
   database: databaseName,
   ssl: false || { rejectUnauthorized: true },
   max: 10, // Pool size (configurable via options.maxPoolSize)
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 10000
}
```

**Optional Settings (via connection options):**
- `ssl`: set to `"true"`, `"require"`, or `"verify-full"` to enable SSL
- `rejectUnauthorized`: set to `"false"` to allow self-signed certificates
- `maxPoolSize`: customize pool size (defaults to 10)
- `idleTimeoutMillis`: override idle timeout
- `connectionTimeoutMillis`: override connection timeout

### API Request Examples

#### Create Connection
```javascript
POST /api/db/connections
{
  "name": "Production DB",
  "dbType": "sqlserver",
  "host": "10.0.1.100",
  "port": 1433,
  "username": "app_user",
  "password": "secret123",
  "databaseName": "ProductionDB",
  "options": {
    "encrypt": "true",
    "trustServerCertificate": "false"
  }
}
```

#### Execute Query
```javascript
POST /api/db/execute
{
  "connectionId": "507f1f77bcf86cd799439011",
  "query": "SELECT TOP 10 * FROM Users WHERE Active = 1"
}
```

#### Response Format
```javascript
{
  "success": true,
  "queryType": "SELECT",
  "recordset": [...],  // Array of result objects
  "rowsAffected": 10,
  "columns": ["Id", "Name", "Email", "Active"],
  "executionTime": 45,
  "message": "Query returned 10 row(s)"
}
```

## Troubleshooting

### Connection Issues

**Problem**: "Connection failed" error  
**Solutions**:
- Verify host and port are correct
- Check firewall allows connections
- Ensure SQL Server allows remote connections
- Verify credentials are correct
- Check if SQL Server is running

**Problem**: "Login failed for user"  
**Solutions**:
- Verify username and password
- Check SQL Server authentication mode (Windows vs Mixed)
- Ensure user has appropriate permissions
- Check if user is locked or disabled

### Query Execution Issues

**Problem**: "Invalid object name" error  
**Solutions**:
- Verify table/view exists in database
- Check user has permissions to access object
- Ensure correct database is selected in connection
- Use fully qualified names (schema.table)

**Problem**: Query timeout  
**Solutions**:
- Simplify or optimize query
- Add appropriate indexes
- Reduce result set size with WHERE clause
- Increase requestTimeout in configuration

## Dependencies

### Backend
- `mssql` ^11.0.1 - SQL Server driver
- `pg` ^8.12.0 - PostgreSQL driver
- `jsonwebtoken` ^9.0.2 - JWT authentication
- `bcryptjs` ^2.4.3 - Bcrypt hashing (optional)
- `express-validator` ^7.2.2 - Request validation

### Frontend
- Existing React dependencies
- No additional packages required

## File Structure

```
server/
├── adapters/
│   ├── DatabaseAdapter.js      # Abstract interface
│   ├── SqlServerAdapter.js     # SQL Server implementation
│   ├── PostgresAdapter.js      # PostgreSQL implementation
│   └── AdapterFactory.js       # Factory pattern
├── models/
│   └── DatabaseConnection.js   # MongoDB model
├── routes/
│   └── database.js             # API endpoints
├── middleware/
│   └── auth.js                 # JWT middleware
└── utils/
    └── encryption.js           # Password encryption

client/src/
├── components/
│   ├── ConnectionForm.jsx      # Connection form
│   ├── DatabaseSettings.jsx    # Settings modal
│   └── SqlExecutionPanel.jsx   # Query execution
└── services/
    └── api.js                  # API service (updated)
```

## Testing Checklist

> Repeat the following tests for each supported adapter (SQL Server, PostgreSQL).

- [ ] Create database connection
- [ ] Test connection validity
- [ ] Execute SELECT query
- [ ] Execute SELECT query (PostgreSQL)
- [ ] Execute INSERT query
- [ ] Execute UPDATE query
- [ ] Execute DELETE query
- [ ] Execute DDL statement
- [ ] View results for >100 rows
- [ ] Handle query errors correctly
- [ ] Edit connection details
- [ ] Delete connection
- [ ] Verify password encryption in MongoDB
- [ ] Test connection pooling with multiple queries
- [ ] Verify query execution auditing in logs
