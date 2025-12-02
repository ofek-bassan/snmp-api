import { Request, Response, NextFunction } from 'express';
import snmpService from '../services/snmpService';
import commandResolver from '../services/commandResolver';
import logger from '../utils/logger';
import { SnmpError } from '../types/snmp';
import { listAllCommands } from '../constants/snmpCommands';

export class SnmpController {
  /**
   * GET /api/snmp
   * Simplified unified endpoint - handles both GET and WALK operations
   * 
   * Query parameters:
   * - hostname (required): Target hostname or IP
   * - cmd (optional): Command name or alias (e.g., 'systemName', 'interfaces', 'ciscoVLAN')
   * - oid (optional): Direct OID if cmd not provided (e.g., '1.3.6.1.2.1.1.5.0')
   * - community (optional): SNMP community string (default: 'public')
   * - port (optional): SNMP port (default: 161)
   * - timeout (optional): Request timeout in ms
   * - retries (optional): Number of retries
   * - asTable (optional): Force table format for walk operations
   * 
   * Examples:
   * GET /?hostname=192.168.1.1&cmd=systemName
   * GET /?hostname=192.168.1.1&cmd=interfaces
   * GET /?hostname=192.168.1.1&cmd=ciscoVLAN
   * GET /?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0
   */
  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostname, cmd, oid: directOid, community, port, timeout, retries, asTable } = req.query;

      // Validation
      if (!hostname) {
        logger.warn('Missing hostname parameter');
        res.status(400).json({
          status: 'error',
          error: 'hostname parameter is required',
          example: '/?hostname=192.168.1.1&cmd=systemName',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Must provide either cmd or oid
      if (!cmd && !directOid) {
        logger.warn('Missing cmd or oid parameter');
        res.status(400).json({
          status: 'error',
          error: 'Either cmd or oid parameter is required',
          example: '/?hostname=192.168.1.1&cmd=systemName',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Resolve command to OID and operation
      const cmdInput = (cmd || directOid) as string;
      let resolved;
      try {
        resolved = commandResolver.resolve(cmdInput);
      } catch (error) {
        if (error instanceof SnmpError) {
          res.status(error.statusCode).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        throw error;
      }

      logger.info('SNMP query received', {
        hostname,
        command: cmd || 'direct_oid',
        oid: resolved.oid,
        operation: resolved.operation,
      });

      const baseRequest = {
        hostname: hostname as string,
        community: (community as string) || 'public',
        port: port ? parseInt(port as string, 10) : 161,
        timeout: timeout ? parseInt(timeout as string, 10) : undefined,
        retries: retries ? parseInt(retries as string, 10) : undefined,
      };

      let response;

      if (resolved.operation === 'get') {
        response = await snmpService.get({
          ...baseRequest,
          oid: resolved.oid,
        });
      } else if (resolved.operation === 'walk') {
        // Auto-detect table or use asTable param
        const useTableFormat = asTable === 'true' || commandResolver.isTableOid(resolved.oid);
        response = useTableFormat
          ? await snmpService.walkTable({
              ...baseRequest,
              oid: resolved.oid,
            })
          : await snmpService.walk({
              ...baseRequest,
              oid: resolved.oid,
            });
      } else {
        // bulk operation
        response = await snmpService.bulk({
          ...baseRequest,
          oid: resolved.oid,
        });
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/snmp/get
   * Legacy endpoint - Retrieve specific OID values
   */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostname, oid, community, port, timeout, retries } = req.query;

      if (!hostname) {
        res.status(400).json({
          status: 'error',
          error: 'hostname parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!oid) {
        res.status(400).json({
          status: 'error',
          error: 'oid parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const oids = Array.isArray(oid) ? (oid as string[]) : [(oid as string)];

      for (const o of oids) {
        if (!commandResolver.isValidOid(o)) {
          logger.warn('Invalid OID format', { oid: o });
          res.status(400).json({
            status: 'error',
            error: `Invalid OID format: ${o}`,
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const response = await snmpService.get({
        hostname: hostname as string,
        oid: oids,
        community: (community as string) || 'public',
        port: port ? parseInt(port as string, 10) : 161,
        timeout: timeout ? parseInt(timeout as string, 10) : undefined,
        retries: retries ? parseInt(retries as string, 10) : undefined,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/snmp/walk
   * Legacy endpoint - Retrieve all OID values under a subtree
   */
  async walk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostname, oid, community, port, timeout, retries, asTable } = req.query;

      if (!hostname) {
        res.status(400).json({
          status: 'error',
          error: 'hostname parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!oid) {
        res.status(400).json({
          status: 'error',
          error: 'oid parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const oidStr = oid as string;
      if (!commandResolver.isValidOid(oidStr)) {
        logger.warn('Invalid OID format in WALK', { oid: oidStr });
        res.status(400).json({
          status: 'error',
          error: `Invalid OID format: ${oidStr}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const walkRequest = {
        hostname: hostname as string,
        oid: oidStr,
        community: (community as string) || 'public',
        port: port ? parseInt(port as string, 10) : 161,
        timeout: timeout ? parseInt(timeout as string, 10) : undefined,
        retries: retries ? parseInt(retries as string, 10) : undefined,
      };

      const useTableWalk = asTable === 'true' || commandResolver.isTableOid(oidStr);
      const response = useTableWalk
        ? await snmpService.walkTable(walkRequest)
        : await snmpService.walk(walkRequest);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/snmp/bulk
   * Legacy endpoint - Retrieve large datasets efficiently using GETBULK
   */
  async bulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostname, oid, community, port, timeout, retries, maxRepetitions, nonRepeaters } = req.query;

      if (!hostname) {
        res.status(400).json({
          status: 'error',
          error: 'hostname parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!oid) {
        res.status(400).json({
          status: 'error',
          error: 'oid parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const oidStr = oid as string;
      if (!commandResolver.isValidOid(oidStr)) {
        logger.warn('Invalid OID format in BULK', { oid: oidStr });
        res.status(400).json({
          status: 'error',
          error: `Invalid OID format: ${oidStr}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response = await snmpService.bulk({
        hostname: hostname as string,
        oid: oidStr,
        community: (community as string) || 'public',
        port: port ? parseInt(port as string, 10) : 161,
        timeout: timeout ? parseInt(timeout as string, 10) : undefined,
        retries: retries ? parseInt(retries as string, 10) : undefined,
        maxRepetitions: maxRepetitions ? parseInt(maxRepetitions as string, 10) : 20,
        nonRepeaters: nonRepeaters ? parseInt(nonRepeaters as string, 10) : 0,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/snmp/commands
   * List all available SNMP commands
   */
  listCommands(req: Request, res: Response): void {
    const { vendor, search } = req.query;

    logger.info('Commands list requested', { vendor, search });

    if (search) {
      const searchTerm = search as string;
      const results = commandResolver.searchCommands(searchTerm);
      res.status(200).json({
        status: 'success',
        searchTerm,
        resultCount: results.length,
        results,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const allCommands = listAllCommands();
    res.status(200).json({
      status: 'success',
      count: Object.keys(allCommands).length,
      commands: allCommands,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * POST /api/snmp/validate-oid
   * Validate OID format and check if it's a table OID
   */
  validateOid(req: Request, res: Response): void {
    try {
      const { oid } = req.body;

      if (!oid) {
        logger.warn('Missing oid in validation request');
        res.status(400).json({
          status: 'error',
          error: 'oid is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isValid = commandResolver.isValidOid(oid);
      const isTable = commandResolver.isTableOid(oid);

      logger.info('OID validation', { oid, isValid, isTable });

      res.status(200).json({
        status: 'success',
        oid,
        isValid,
        isTable,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('OID validation error', { error });
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Health check endpoint
   */
  health(req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'snmp-api',
      timestamp: new Date().toISOString(),
    });
  }
}

export default new SnmpController();
