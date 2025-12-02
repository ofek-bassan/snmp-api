/**
 * CommandResolver Service
 * Translates user-friendly SNMP commands into OIDs and determines operation type
 */

import { getCommandByName, CommandDefinition } from '../constants/snmpCommands';
import logger from '../utils/logger';
import { SnmpError } from '../types/snmp';

export interface ResolvedCommand {
  oid: string;
  operation: 'get' | 'walk' | 'bulk';
  command: CommandDefinition;
}

export class CommandResolver {
  /**
   * Resolve a command name to OID and operation
   * Examples: 'systemName' -> OID for hostname, 'interfaces' -> walk interface table
   */
  resolve(cmdOrOid: string): ResolvedCommand {
    // Check if it's a direct OID (numeric format)
    if (this.isDirectOid(cmdOrOid)) {
      logger.info('Using direct OID', { oid: cmdOrOid });
      return {
        oid: cmdOrOid,
        operation: 'get',
        command: {
          name: 'direct_oid',
          description: 'Direct OID query',
          oid: cmdOrOid,
          operation: 'get',
          vendor: 'generic',
        },
      };
    }

    // Try to find command by name or alias
    const command = getCommandByName(cmdOrOid);
    if (!command) {
      logger.warn('Unknown SNMP command', { command: cmdOrOid });
      throw new SnmpError(
        `Unknown SNMP command: '${cmdOrOid}'. Run GET /api/snmp/commands for available commands.`,
        undefined,
        400
      );
    }

    logger.info('Command resolved', {
      command: cmdOrOid,
      oid: command.oid,
      operation: command.operation,
    });

    return {
      oid: command.oid,
      operation: command.operation,
      command,
    };
  }

  /**
   * Check if input is a valid OID (numeric dot notation)
   */
  private isDirectOid(input: string): boolean {
    const oidRegex = /^(\d+\.)*\d+$/;
    return oidRegex.test(input);
  }

  /**
   * Validate OID format
   */
  isValidOid(oid: string): boolean {
    const oidRegex = /^(\d+\.)*\d+$/;
    return oidRegex.test(oid);
  }

  /**
   * Check if OID is a table OID (typically ends with .1 for entry or has .2.1 pattern)
   */
  isTableOid(oid: string): boolean {
    return oid.endsWith('.1') || oid.endsWith('.2.1');
  }

  /**
   * Get command suggestions for search term
   */
  searchCommands(searchTerm: string): CommandDefinition[] {
    const term = searchTerm.toLowerCase();
    const { getCommandByName, SNMP_COMMANDS } = require('../constants/snmpCommands');

    const results: CommandDefinition[] = [];
    
    for (const [, cmd] of Object.entries(SNMP_COMMANDS)) {
      const command = cmd as CommandDefinition;
      if (
        command.name.toLowerCase().includes(term) ||
        command.description.toLowerCase().includes(term) ||
        command.alternatives?.some((alt) => alt.toLowerCase().includes(term))
      ) {
        results.push(command);
      }
    }

    return results;
  }
}

export default new CommandResolver();
