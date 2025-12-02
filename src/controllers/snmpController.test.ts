import snmpController from '../../src/controllers/snmpController';
import snmpService from '../../src/services/snmpService';
import logger from '../../src/utils/logger';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/services/snmpService');
jest.mock('../../src/utils/logger');

describe('SnmpController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('GET /api/snmp/get', () => {
    it('should return 400 when hostname is missing', async () => {
      req.query = { oid: '1.3.6.1.2.1.1.5.0' };

      await snmpController.get(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: 'hostname parameter is required',
        })
      );
    });

    it('should return 400 when oid is missing', async () => {
      req.query = { hostname: '192.168.1.1' };

      await snmpController.get(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: 'oid parameter is required',
        })
      );
    });

    it('should return 400 for invalid OID format', async () => {
      req.query = { hostname: '192.168.1.1', oid: 'invalid.oid' };
      ((snmpService as any).isValidOid as jest.Mock).mockReturnValue(false);

      await snmpController.get(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: expect.stringContaining('Invalid OID format'),
        })
      );
    });

    it('should call snmpService.get with correct parameters', async () => {
      req.query = {
        hostname: '192.168.1.1',
        oid: '1.3.6.1.2.1.1.5.0',
        community: 'public',
        port: '161',
      };

      const mockResponse = {
        status: 'success',
        data: [{ oid: '1.3.6.1.2.1.1.5.0', type: 4, value: 'test' }],
        hostname: '192.168.1.1',
        operation: 'GET' as const,
        timestamp: new Date().toISOString(),
      };

      ((snmpService as any).isValidOid as jest.Mock).mockReturnValue(true);
      ((snmpService as any).get as jest.Mock).mockResolvedValue(mockResponse);

      await snmpController.get(req as Request, res as Response, next as NextFunction);

      expect(snmpService.get).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: '192.168.1.1',
          oid: ['1.3.6.1.2.1.1.5.0'],
          community: 'public',
          port: 161,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('GET /api/snmp/walk', () => {
    it('should return 400 when hostname is missing', async () => {
      req.query = { oid: '1.3.6.1.2.1.2.2' };

      await snmpController.walk(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when oid is missing', async () => {
      req.query = { hostname: '192.168.1.1' };

      await snmpController.walk(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should auto-detect table OIDs', async () => {
      req.query = {
        hostname: '192.168.1.1',
        oid: '1.3.6.1.2.1.2.2.1',
      };

      const mockResponse = {
        status: 'success',
        data: {},
        hostname: '192.168.1.1',
        operation: 'WALK' as const,
        timestamp: new Date().toISOString(),
      };

      ((snmpService as any).isValidOid as jest.Mock).mockReturnValue(true);
      ((snmpService as any).isTableOid as jest.Mock).mockReturnValue(true);
      ((snmpService as any).walkTable as jest.Mock).mockResolvedValue(mockResponse);

      await snmpController.walk(req as Request, res as Response, next as NextFunction);

      expect(snmpService.walkTable).toHaveBeenCalled();
    });
  });

  describe('POST /api/snmp/validate-oid', () => {
    it('should return 400 when oid is missing', () => {
      req.body = {};

      snmpController.validateOid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate OID correctly', () => {
      req.body = { oid: '1.3.6.1.2.1.1.5.0' };

      ((snmpService as any).isValidOid as jest.Mock).mockReturnValue(true);
      ((snmpService as any).isTableOid as jest.Mock).mockReturnValue(false);

      snmpController.validateOid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          oid: '1.3.6.1.2.1.1.5.0',
          isValid: true,
          isTable: false,
        })
      );
    });
  });

  describe('GET /api/snmp/health', () => {
    it('should return healthy status', () => {
      snmpController.health(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'snmp-api',
        })
      );
    });
  });
});
