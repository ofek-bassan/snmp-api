import { Router } from 'express';
import snmpController from '../controllers/snmpController';

const router = Router();

/**
 * GET /api/snmp
 * Unified simplified endpoint for SNMP queries
 * 
 * Query parameters:
 * - hostname (required): Target hostname or IP
 * - cmd (optional): SNMP command name/alias (e.g., 'systemName', 'interfaces', 'ciscoVLAN')
 * - oid (optional): Direct OID if cmd not provided
 * - community (optional): SNMP community string (default: 'public')
 * - port (optional): SNMP port (default: 161)
 * - timeout (optional): Request timeout in ms
 * - retries (optional): Number of retries
 * - asTable (optional): Force table format
 * 
 * Examples:
 * GET / - Shows this help
 * GET /?hostname=192.168.1.1&cmd=systemName
 * GET /?hostname=192.168.1.1&cmd=interfaces
 * GET /?hostname=192.168.1.1&cmd=ciscoVLAN
 * GET /?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0
 */
router.get('/', (req, res, next) => snmpController.query(req, res, next));

/**
 * GET /api/snmp/commands
 * List all available SNMP commands with descriptions
 * 
 * Query parameters:
 * - search (optional): Search for commands by name or description
 * 
 * Examples:
 * GET /commands - List all commands
 * GET /commands?search=interface
 * GET /commands?search=cisco
 */
router.get('/commands', (req, res) => snmpController.listCommands(req, res));

/**
 * GET /api/snmp/get
 * Legacy endpoint - Retrieve specific OID values
 */
router.get('/get', (req, res, next) => snmpController.get(req, res, next));

/**
 * GET /api/snmp/walk
 * Legacy endpoint - Retrieve all OID values under a subtree
 */
router.get('/walk', (req, res, next) => snmpController.walk(req, res, next));

/**
 * GET /api/snmp/bulk
 * Legacy endpoint - Retrieve large datasets efficiently using GETBULK
 */
router.get('/bulk', (req, res, next) => snmpController.bulk(req, res, next));

/**
 * POST /api/snmp/validate-oid
 * Validate OID format
 */
router.post('/validate-oid', (req, res) => snmpController.validateOid(req, res));

/**
 * GET /api/snmp/health
 * Health check endpoint
 */
router.get('/health', (req, res) => snmpController.health(req, res));

export default router;
