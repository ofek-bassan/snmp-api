# SNMP API - User-Friendly Query System

## Quick Start Examples

The easiest way to use the API is through the unified `/api/snmp` endpoint with friendly command names:

### Get System Hostname
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName"
```

### Get All Interfaces
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfaces"
```

### Get Cisco VLAN Info
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=ciscoVLAN"
```

### Get Juniper CPU Usage
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=juniperCPU"
```

### Use Direct OID
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"
```

## Available Commands

### Generic Commands (Work on Any Device)

#### System Information
- `systemInfo` - Get system description and details
- `systemName` / `hostname` - Get system hostname/name
- `systemUptime` / `uptime` - Get system uptime
- `systemContact` - Get system contact information
- `systemLocation` / `location` - Get system location

#### Interfaces
- `interfaceCount` - Get number of network interfaces
- `interfaces` / `ifList` / `networkInterfaces` - Get all interfaces (flat list)
- `interfacesTable` - Get all interfaces (structured table)
- `interfaceStatus` / `ifStatus` / `portStatus` - Get interface status
- `interfaceSpeed` - Get interface speeds
- `interfaceTraffic` - Get interface traffic statistics

#### IP & Network
- `ipAddresses` / `ipAddrTable` / `ips` - Get all IP addresses and netmasks
- `arpTable` / `arp` - Get ARP table (IP to MAC mappings)
- `routingTable` / `routes` - Get IP routing table

#### Performance & Monitoring
- `cpuUsage` - Get CPU usage
- `memoryUsage` - Get memory usage
- `diskUsage` - Get disk/storage usage

### Cisco-Specific Commands

#### Interfaces & Ports
- `ciscoInterfaceNames` / `switchInterfaces` / `ciscoInterfaces` - Get Cisco interface names/descriptions
- `ciscoPortSpeed` - Get port speeds
- `ciscoPortDuplex` - Get port duplex mode

#### Network & VLAN
- `ciscoVLAN` / `vlan` / `vlans` - Get VLAN information
- `ciscoPortVLAN` - Get port VLAN assignments

#### Performance
- `ciscoCPU` / `cpuUsage` / `cpuUtilization` - Get CPU utilization
- `ciscoMemory` / `memoryUsage` - Get memory statistics

#### System
- `ciscoModuleStatus` - Get module/card status

### Juniper-Specific Commands

#### Interfaces & Ports
- `juniperInterfaces` / `juniperPorts` - Get Juniper interface details
- `juniperInterfaceStatistics` - Get interface statistics

#### Performance
- `juniperCPU` - Get CPU utilization
- `juniperMemory` - Get memory usage

#### System
- `juniperChassis` - Get chassis information
- `juniperAlarms` - Get active alarms

## Unified Query Endpoint: `GET /api/snmp`

### Query Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `hostname` | Yes | Target device IP or hostname | - |
| `cmd` | No* | Command name/alias | - |
| `oid` | No* | Direct OID (numeric format) | - |
| `community` | No | SNMP community string | `public` |
| `port` | No | SNMP port | `161` |
| `timeout` | No | Request timeout in ms | `5000` |
| `retries` | No | Number of retries | `1` |
| `asTable` | No | Force table format | auto-detect |

*Either `cmd` or `oid` must be provided

### Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": [
    {
      "oid": "1.3.6.1.2.1.1.5.0",
      "type": 4,
      "value": "my-router"
    }
  ],
  "hostname": "192.168.1.1",
  "operation": "GET",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": "Unknown SNMP command: 'badCommand'",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Command Discovery Endpoint: `GET /api/snmp/commands`

List all available commands or search for specific ones.

### List All Commands
```bash
curl "http://localhost:3000/api/snmp/commands"
```

Response:
```json
{
  "status": "success",
  "count": 50,
  "commands": {
    "systemName": {
      "name": "systemName",
      "description": "Get system hostname/name",
      "operation": "get",
      "vendor": "generic",
      "alternatives": ["hostname", "sysName"]
    },
    ...
  },
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

### Search Commands
```bash
curl "http://localhost:3000/api/snmp/commands?search=interface"
```

Response:
```json
{
  "status": "success",
  "searchTerm": "interface",
  "resultCount": 5,
  "results": [
    {
      "name": "interfaces",
      "description": "Get all network interfaces (flat list)",
      "operation": "walk",
      "vendor": "generic",
      "alternatives": ["ifList", "networkInterfaces"]
    },
    ...
  ],
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Real-World Examples

### Example 1: Get Interface Names on Cisco Switch

```bash
# Get interface descriptions/names
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoInterfaceNames&community=public"

# Response shows all interface names
{
  "status": "success",
  "data": [
    {"oid": "1.3.6.1.4.1.9.2.2.1.1.28.1", "type": 4, "value": "Fa0/1"},
    {"oid": "1.3.6.1.4.1.9.2.2.1.1.28.2", "type": 4, "value": "Fa0/2"},
    ...
  ],
  "operation": "WALK",
  "timestamp": "..."
}
```

### Example 2: Get VLAN Information on Cisco Switch

```bash
# Get VLAN IDs and names
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoVLAN&community=public&asTable=true"

# Returns structured table with VLAN data
{
  "status": "success",
  "data": {
    "1": {
      "col_1": {"oid": "...", "type": 2, "value": 1},
      "col_2": {"oid": "...", "type": 4, "value": "default"}
    },
    "10": {
      "col_1": {"oid": "...", "type": 2, "value": 10},
      "col_2": {"oid": "...", "type": 4, "value": "VLAN0010"}
    }
  },
  "operation": "WALK",
  "timestamp": "..."
}
```

### Example 3: Get CPU Usage on Juniper Device

```bash
# Get CPU utilization
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=juniperCPU&community=public"

# Response with CPU data
{
  "status": "success",
  "data": [
    {
      "oid": "1.3.6.1.4.1.2636.3.1.13.1.5.0",
      "type": 67,
      "value": 35
    }
  ],
  "operation": "GET",
  "timestamp": "..."
}
```

### Example 4: Get All Interfaces (Structured)

```bash
# Auto-detects table format for interface OID
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfacesTable"

# Returns interfaces in structured format
{
  "status": "success",
  "data": {
    "1": {
      "col_1": {"oid": "...", "type": 2, "value": 1},
      "col_2": {"oid": "...", "type": 4, "value": "eth0"},
      "col_5": {"oid": "...", "type": 67, "value": 1000000000}
    },
    "2": {
      "col_1": {"oid": "...", "type": 2, "value": 2},
      "col_2": {"oid": "...", "type": 4, "value": "eth1"}
    }
  },
  "operation": "WALK",
  "timestamp": "..."
}
```

## Vendor-Specific Note

When working with specific device vendors:

### Cisco Devices
- Always include correct community string (usually `public` for read)
- Interface names use the Cisco-specific OIDs
- VLAN information is vendor-specific
- Module status available for modular devices

### Juniper Devices
- Use Juniper-specific command names for optimal results
- CPU and memory use different OIDs than Cisco
- Chassis information provides system-level details

### Generic Devices
- Use generic commands that work on most SNMP-enabled devices
- Falls back to standard MIB-II OIDs
- Interfaces and IP addresses available on nearly all devices

## Legacy Endpoints (Still Available)

For backward compatibility, the old endpoints are still supported:

```bash
# Legacy GET endpoint
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"

# Legacy WALK endpoint
curl "http://localhost:3000/api/snmp/walk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2"

# Legacy BULK endpoint
curl "http://localhost:3000/api/snmp/bulk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2"
```

## Error Handling

### Missing Parameters
```bash
curl "http://localhost:3000/api/snmp"

# Response
{
  "status": "error",
  "error": "hostname parameter is required",
  "example": "/?hostname=192.168.1.1&cmd=systemName",
  "timestamp": "..."
}
```

### Unknown Command
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=unknownCmd"

# Response
{
  "status": "error",
  "error": "Unknown SNMP command: 'unknownCmd'. Run GET /api/snmp/commands for available commands.",
  "timestamp": "..."
}
```

### Connection Issues
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.999&cmd=systemName&timeout=2000"

# Response
{
  "status": "error",
  "error": "SNMP GET failed: Request timed out",
  "timestamp": "..."
}
```

## Tips & Best Practices

1. **Start with generic commands** - They work on most devices
2. **Search for commands** - Use `/commands?search=keyword` to find what you need
3. **Use command names, not OIDs** - Much easier and less error-prone
4. **Check device vendor** - Use vendor-specific commands for better results
5. **Leverage aliases** - Many commands have multiple names (e.g., `hostname`, `systemName`)
6. **Table detection** - Most table queries auto-detect format, use `asTable=true` to force
7. **Logs** - Check application logs for detailed operation information
8. **Timeouts** - Increase timeout for slow/distant devices
9. **Community strings** - Default is `public`, adjust if your device requires different

## Performance Tips

- Use WALK for table queries (auto-detected)
- Use BULK for large datasets with `maxRepetitions=50+`
- Reduce retries for faster failures on unreachable devices
- Use structured table format when possible for easier parsing
