const { pool } = require('./db');

const logApiStatus = async (apiName, endpoint, isSuccess, errorMessage = null) => {
  try {
    const query = `
      INSERT INTO api_health_status (api_name, endpoint, status, last_success, last_failure, error_message, updated_at)
      VALUES (
        $1, 
        $2, 
        $3, 
        $4, 
        $5, 
        $6, 
        NOW()
      )
      ON CONFLICT (api_name) 
      DO UPDATE SET 
        endpoint = EXCLUDED.endpoint,
        status = EXCLUDED.status,
        last_success = COALESCE(EXCLUDED.last_success, api_health_status.last_success),
        last_failure = COALESCE(EXCLUDED.last_failure, api_health_status.last_failure),
        error_message = EXCLUDED.error_message,
        updated_at = NOW();
    `;

    const status = isSuccess ? 'UP' : 'DOWN';
    const last_success = isSuccess ? new Date() : null;
    const last_failure = isSuccess ? null : new Date();

    await pool.query(query, [apiName, endpoint, status, last_success, last_failure, errorMessage]);
  } catch (error) {
    console.error(`Failed to log API health for ${apiName}:`, error.message);
  }
};

const getApiHealthStatus = async () => {
  try {
    const res = await pool.query('SELECT * FROM api_health_status ORDER BY updated_at DESC');
    return res.rows;
  } catch (error) {
    console.error('Failed to get API health status:', error.message);
    return [];
  }
};

module.exports = {
  logApiStatus,
  getApiHealthStatus
};
