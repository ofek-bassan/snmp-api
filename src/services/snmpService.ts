import * as snmp from 'net-snmp';
import logger from '../utils/logger';
import {
  SnmpGetRequest,
  SnmpWalkRequest,
  SnmpBulkRequest,
  SnmpResponse,
  SnmpVarbind,
  SnmpError,
  TableData,
} from '../types/snmp';

export class SnmpService {
  private readonly defaultTimeout = parseInt(process.env.SNMP_TIMEOUT || '5000', 10);
  private readonly defaultRetries = parseInt(process.env.SNMP_RETRIES || '1', 10);

  /**
   * Perform SNMP GET operation to retrieve specific OID values
   */
  async get(request: SnmpGetRequest): Promise<SnmpResponse> {
    const { hostname, oid, community = 'public', port = 161, timeout = this.defaultTimeout, retries = this.defaultRetries } = request;
    const oids = Array.isArray(oid) ? oid : [oid];

    logger.info('SNMP GET operation started', { hostname, oids, port });

    return new Promise((resolve, reject) => {
      const options = {
        timeout,
        retries,
      };

      const session = snmp.createSession(hostname, community, options);

      session.get(oids, (error: Error | null, varbinds: any[] | undefined) => {
        session.close();

        if (error) {
          logger.error('SNMP GET operation failed', {
            hostname,
            oids,
            error: error.message,
          });
          reject(
            new SnmpError(
              `SNMP GET failed: ${error.message}`,
              undefined,
              500
            )
          );
        } else if (!varbinds) {
          logger.error('SNMP GET operation returned no data', { hostname, oids });
          reject(new SnmpError('SNMP GET returned no data', undefined, 500));
        } else {
          logger.info('SNMP GET operation completed successfully', {
            hostname,
            oidCount: varbinds.length,
          });

          resolve({
            status: 'success',
            data: varbinds,
            hostname,
            operation: 'GET',
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
  }

  /**
   * Perform SNMP WALK operation to retrieve all OID values under a subtree
   */
  async walk(request: SnmpWalkRequest): Promise<SnmpResponse> {
    const { hostname, oid, community = 'public', port = 161, timeout = this.defaultTimeout, retries = this.defaultRetries } = request;

    logger.info('SNMP WALK operation started', { hostname, oid, port });

    return new Promise((resolve, reject) => {
      const options = {
        timeout,
        retries,
      };

      const session = snmp.createSession(hostname, community, options);
      const varbinds: any[] = [];

      session.walk(oid, 10, (varbind: any): boolean => {
        if (Array.isArray(varbind)) {
          varbinds.push(...varbind);
        } else {
          if (snmp.isVarbindError(varbind)) {
            logger.warn('Varbind error in WALK', { hostname, oid, varbind });
          } else {
            varbinds.push(varbind);
          }
        }
        return true;
      }, (error: Error | null) => {
        session.close();

        if (error) {
          logger.error('SNMP WALK operation failed', {
            hostname,
            oid,
            error: error.message,
          });
          reject(
            new SnmpError(
              `SNMP WALK failed: ${error.message}`,
              undefined,
              500
            )
          );
        } else {
          logger.info('SNMP WALK operation completed successfully', {
            hostname,
            oid,
            varbindCount: varbinds.length,
          });

          resolve({
            status: 'success',
            data: varbinds,
            hostname,
            operation: 'WALK',
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
  }

  /**
   * Perform SNMP GETBULK operation for efficient retrieval of large datasets
   */
  async bulk(request: SnmpBulkRequest): Promise<SnmpResponse> {
    const {
      hostname,
      oid,
      community = 'public',
      port = 161,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      maxRepetitions = 20,
      nonRepeaters = 0,
    } = request;

    logger.info('SNMP BULK operation started', { hostname, oid, port, maxRepetitions });

    return new Promise((resolve, reject) => {
      const options = {
        timeout,
        retries,
      };

      const session = snmp.createSession(hostname, community, options);
      const varbinds: any[] = [];

      // Use bulkSimultaneous if available, otherwise fall back to walk
      if (typeof (session as any).bulkSimultaneous === 'function') {
        (session as any).bulkSimultaneous([oid], nonRepeaters, maxRepetitions, (varbind: any): boolean => {
          if (Array.isArray(varbind)) {
            varbinds.push(...varbind);
          } else {
            if (snmp.isVarbindError(varbind)) {
              logger.warn('Varbind error in BULK', { hostname, oid, varbind });
            } else {
              varbinds.push(varbind);
            }
          }
          return true;
        }, (error: Error | null) => {
          session.close();

          if (error) {
            logger.error('SNMP BULK operation failed', {
              hostname,
              oid,
              error: error.message,
            });
            reject(
              new SnmpError(
                `SNMP BULK failed: ${error.message}`,
                undefined,
                500
              )
            );
          } else {
            logger.info('SNMP BULK operation completed successfully', {
              hostname,
              oid,
              varbindCount: varbinds.length,
            });

            resolve({
              status: 'success',
              data: varbinds,
              hostname,
              operation: 'BULK',
              timestamp: new Date().toISOString(),
            });
          }
        });
      } else {
        // Fallback to walk
        logger.info('SNMP BULK not available, using WALK instead', { hostname, oid });
        session.walk(oid, maxRepetitions, (varbind: any): boolean => {
          if (Array.isArray(varbind)) {
            varbinds.push(...varbind);
          } else {
            if (!snmp.isVarbindError(varbind)) {
              varbinds.push(varbind);
            }
          }
          return true;
        }, (error: Error | null) => {
          session.close();

          if (error) {
            logger.error('SNMP BULK (WALK fallback) failed', {
              hostname,
              oid,
              error: error.message,
            });
            reject(
              new SnmpError(
                `SNMP BULK failed: ${error.message}`,
                undefined,
                500
              )
            );
          } else {
            resolve({
              status: 'success',
              data: varbinds,
              hostname,
              operation: 'BULK',
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
    });
  }

  /**
   * Walk a table OID and convert results to structured table data
   * This correctly handles table OIDs by indexing results by instance identifier
   */
  async walkTable(request: SnmpWalkRequest): Promise<SnmpResponse> {
    const { hostname, oid } = request;

    logger.info('SNMP table walk started', { hostname, oid });

    try {
      const walkResponse = await this.walk(request);
      const varbinds = walkResponse.data as any[];

      // Convert flat varbind list to structured table
      const tableData: TableData = {};

      for (const varbind of varbinds) {
        const parts = varbind.oid.split('.');
        const baseOidParts = oid.split('.');

        // Extract the index part (everything after the base OID)
        const indexPart = parts.slice(baseOidParts.length).join('.');

        if (!tableData[indexPart]) {
          tableData[indexPart] = {};
        }

        // Extract column number and value
        const colNum = parts[baseOidParts.length];
        tableData[indexPart][`col_${colNum}`] = {
          oid: varbind.oid,
          type: varbind.type,
          value: varbind.value,
        };
      }

      logger.info('SNMP table walk converted to structured format', {
        hostname,
        oid,
        rows: Object.keys(tableData).length,
      });

      return {
        status: 'success',
        data: tableData,
        hostname,
        operation: 'WALK',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('SNMP table walk failed', { hostname, oid, error });
      throw error;
    }
  }

  /**
   * Determine if an OID is a table OID (ends with .1 for the entry)
   */
  isTableOid(oid: string): boolean {
    return oid.endsWith('.1') || oid.endsWith('.2.1');
  }
}

export default new SnmpService();
