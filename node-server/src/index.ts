import 'dotenv/config';
import express, { Express } from 'express';
import logger from './utils/logger';
import requestLogger from './middleware/requestLogger';
import ErrorHandler from './middleware/errorHandler';
import snmpRoutes from './routes/snmpRoutes';
import apiKeyAuth from './middleware/auth';
import apiRateLimiter from './middleware/rateLimiter';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Apply rate limiter and API key auth to API routes
// Health route stays public; API routes require auth when API_KEY is set
app.use('/api', apiRateLimiter, apiKeyAuth);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'snmp-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/snmp', snmpRoutes);

// 404 handler
app.use(ErrorHandler.notFound);

// Error handler (must be last)
app.use(ErrorHandler.handle);

// Start server
app.listen(port, () => {
  logger.info(`SNMP API server started on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
  });
});

export default app;
