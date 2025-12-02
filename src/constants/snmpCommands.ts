/**
 * SNMP Command Aliases - Maps user-friendly command names to OIDs and operations
 * Supports Cisco, Juniper, and generic/standard devices
 */

export interface CommandDefinition {
  name: string;
  description: string;
  oid: string;
  operation: 'get' | 'walk' | 'bulk';
  vendor?: 'cisco' | 'juniper' | 'generic';
  alternatives?: string[]; // Alternative command names
}

export const SNMP_COMMANDS: { [key: string]: CommandDefinition } = {
  // ============= SYSTEM INFORMATION =============
  'systemInfo': {
    name: 'systemInfo',
    description: 'Get system description and details',
    oid: '1.3.6.1.2.1.1.1.0',
    operation: 'get',
    vendor: 'generic',
    alternatives: ['sysDescr', 'deviceInfo'],
  },
  'systemName': {
    name: 'systemName',
    description: 'Get system hostname/name',
    oid: '1.3.6.1.2.1.1.5.0',
    operation: 'get',
    vendor: 'generic',
    alternatives: ['hostname', 'sysName'],
  },
  'systemUptime': {
    name: 'systemUptime',
    description: 'Get system uptime in ticks (1/100 seconds)',
    oid: '1.3.6.1.2.1.1.3.0',
    operation: 'get',
    vendor: 'generic',
    alternatives: ['uptime', 'sysUpTime'],
  },
  'systemContact': {
    name: 'systemContact',
    description: 'Get system contact information',
    oid: '1.3.6.1.2.1.1.4.0',
    operation: 'get',
    vendor: 'generic',
  },
  'systemLocation': {
    name: 'systemLocation',
    description: 'Get system location',
    oid: '1.3.6.1.2.1.1.6.0',
    operation: 'get',
    vendor: 'generic',
    alternatives: ['location'],
  },

  // ============= INTERFACES - GENERIC =============
  'interfaceCount': {
    name: 'interfaceCount',
    description: 'Get number of network interfaces',
    oid: '1.3.6.1.2.1.2.1.0',
    operation: 'get',
    vendor: 'generic',
  },
  'interfaces': {
    name: 'interfaces',
    description: 'Get all network interfaces (flat list)',
    oid: '1.3.6.1.2.1.2.2',
    operation: 'walk',
    vendor: 'generic',
    alternatives: ['ifList', 'networkInterfaces'],
  },
  'interfacesTable': {
    name: 'interfacesTable',
    description: 'Get all network interfaces (structured table)',
    oid: '1.3.6.1.2.1.2.2.1',
    operation: 'walk',
    vendor: 'generic',
  },
  'interfaceStatus': {
    name: 'interfaceStatus',
    description: 'Get interface status (admin & operational)',
    oid: '1.3.6.1.2.1.2.2.1.7',
    operation: 'walk',
    vendor: 'generic',
    alternatives: ['ifStatus', 'portStatus'],
  },
  'interfaceSpeed': {
    name: 'interfaceSpeed',
    description: 'Get interface speeds',
    oid: '1.3.6.1.2.1.2.2.1.5',
    operation: 'walk',
    vendor: 'generic',
  },
  'interfaceTraffic': {
    name: 'interfaceTraffic',
    description: 'Get interface traffic statistics (in/out octets)',
    oid: '1.3.6.1.2.1.2.2.1.10',
    operation: 'walk',
    vendor: 'generic',
  },

  // ============= IP ADDRESSES - GENERIC =============
  'ipAddresses': {
    name: 'ipAddresses',
    description: 'Get all IP addresses and netmasks',
    oid: '1.3.6.1.2.1.4.20.1',
    operation: 'walk',
    vendor: 'generic',
    alternatives: ['ipAddrTable', 'ips'],
  },

  // ============= CISCO-SPECIFIC COMMANDS =============
  'ciscoInterfaceNames': {
    name: 'ciscoInterfaceNames',
    description: 'Get Cisco interface descriptions/names',
    oid: '1.3.6.1.4.1.9.2.2.1.1.28',
    operation: 'walk',
    vendor: 'cisco',
    alternatives: ['switchInterfaces', 'ciscoInterfaces'],
  },
  'ciscoVLAN': {
    name: 'ciscoVLAN',
    description: 'Get Cisco VLAN information',
    oid: '1.3.6.1.4.1.9.9.46.1.3.1.1.2',
    operation: 'walk',
    vendor: 'cisco',
    alternatives: ['vlan', 'vlans'],
  },
  'ciscoPortVLAN': {
    name: 'ciscoPortVLAN',
    description: 'Get Cisco port VLAN assignments',
    oid: '1.3.6.1.4.1.9.9.46.1.3.1.1.4',
    operation: 'walk',
    vendor: 'cisco',
  },
  'ciscoCPU': {
    name: 'ciscoCPU',
    description: 'Get Cisco CPU utilization',
    oid: '1.3.6.1.4.1.9.9.109.1.1.1.1.3.1',
    operation: 'get',
    vendor: 'cisco',
    alternatives: ['cpuUsage', 'cpuUtilization'],
  },
  'ciscoMemory': {
    name: 'ciscoMemory',
    description: 'Get Cisco memory statistics',
    oid: '1.3.6.1.4.1.9.9.48.1.1.1.5.1',
    operation: 'get',
    vendor: 'cisco',
    alternatives: ['memoryUsage'],
  },
  'ciscoPortSpeed': {
    name: 'ciscoPortSpeed',
    description: 'Get Cisco port speeds',
    oid: '1.3.6.1.4.1.9.9.87.1.4.1.1.32',
    operation: 'walk',
    vendor: 'cisco',
  },
  'ciscoPortDuplex': {
    name: 'ciscoPortDuplex',
    description: 'Get Cisco port duplex mode',
    oid: '1.3.6.1.4.1.9.9.87.1.4.1.1.40',
    operation: 'walk',
    vendor: 'cisco',
  },
  'ciscoModuleStatus': {
    name: 'ciscoModuleStatus',
    description: 'Get Cisco module/card status',
    oid: '1.3.6.1.4.1.9.9.46.1.6.1.1.5',
    operation: 'walk',
    vendor: 'cisco',
  },

  // ============= JUNIPER-SPECIFIC COMMANDS =============
  'juniperInterfaces': {
    name: 'juniperInterfaces',
    description: 'Get Juniper interface details',
    oid: '1.3.6.1.4.1.2636.3.4.2.3.1',
    operation: 'walk',
    vendor: 'juniper',
    alternatives: ['juniperPorts'],
  },
  'juniperInterfaceStatistics': {
    name: 'juniperInterfaceStatistics',
    description: 'Get Juniper interface statistics',
    oid: '1.3.6.1.4.1.2636.3.4.2.4.1',
    operation: 'walk',
    vendor: 'juniper',
  },
  'juniperCPU': {
    name: 'juniperCPU',
    description: 'Get Juniper CPU utilization',
    oid: '1.3.6.1.4.1.2636.3.1.13.1.5',
    operation: 'get',
    vendor: 'juniper',
  },
  'juniperMemory': {
    name: 'juniperMemory',
    description: 'Get Juniper memory usage',
    oid: '1.3.6.1.4.1.2636.3.1.13.1.11',
    operation: 'get',
    vendor: 'juniper',
  },
  'juniperChassis': {
    name: 'juniperChassis',
    description: 'Get Juniper chassis information',
    oid: '1.3.6.1.4.1.2636.3.1.2',
    operation: 'walk',
    vendor: 'juniper',
  },
  'juniperAlarms': {
    name: 'juniperAlarms',
    description: 'Get Juniper active alarms',
    oid: '1.3.6.1.4.1.2636.3.4.2.2.1',
    operation: 'walk',
    vendor: 'juniper',
  },

  // ============= PERFORMANCE & MONITORING =============
  'cpuUsage': {
    name: 'cpuUsage',
    description: 'Get device CPU usage (vendor-agnostic)',
    oid: '1.3.6.1.2.1.25.3.3.1.2',
    operation: 'walk',
    vendor: 'generic',
  },
  'memoryUsage': {
    name: 'memoryUsage',
    description: 'Get device memory usage (vendor-agnostic)',
    oid: '1.3.6.1.2.1.25.2.3.1',
    operation: 'walk',
    vendor: 'generic',
  },
  'diskUsage': {
    name: 'diskUsage',
    description: 'Get disk/storage usage',
    oid: '1.3.6.1.2.1.25.3.2.1',
    operation: 'walk',
    vendor: 'generic',
  },

  // ============= ROUTING =============
  'routingTable': {
    name: 'routingTable',
    description: 'Get IP routing table',
    oid: '1.3.6.1.2.1.4.21.1',
    operation: 'walk',
    vendor: 'generic',
    alternatives: ['routes'],
  },

  // ============= ARP TABLE =============
  'arpTable': {
    name: 'arpTable',
    description: 'Get ARP table (IP to MAC mappings)',
    oid: '1.3.6.1.2.1.4.22.1.3',
    operation: 'walk',
    vendor: 'generic',
    alternatives: ['arp'],
  },
};

/**
 * Get command definition by name or alias
 */
export function getCommandByName(name: string): CommandDefinition | undefined {
  const cmd = SNMP_COMMANDS[name];
  if (cmd) return cmd;

  // Search by alias
  for (const [, definition] of Object.entries(SNMP_COMMANDS)) {
    if (definition.alternatives?.includes(name)) {
      return definition;
    }
  }

  return undefined;
}

/**
 * Get all commands for a specific vendor
 */
export function getCommandsByVendor(vendor: 'cisco' | 'juniper' | 'generic'): CommandDefinition[] {
  return Object.values(SNMP_COMMANDS).filter((cmd) => cmd.vendor === vendor || cmd.vendor === 'generic');
}

/**
 * List all available commands
 */
export function listAllCommands(): { [key: string]: Omit<CommandDefinition, 'oid'> } {
  const result: { [key: string]: Omit<CommandDefinition, 'oid'> } = {};
  for (const [key, cmd] of Object.entries(SNMP_COMMANDS)) {
    result[key] = {
      name: cmd.name,
      description: cmd.description,
      operation: cmd.operation,
      vendor: cmd.vendor,
      alternatives: cmd.alternatives,
    };
  }
  return result;
}
