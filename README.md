# SNMP API - Production-Grade Express Server

A production-grade Node.js Express API for SNMP GET/WALK/BULK operations with vendor-specific device support (Cisco, Juniper, generic) using **friendly command names instead of OIDs**.

## 🚀 Quick Start

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

### List Available Commands
```bash
curl "http://localhost:3000/api/snmp/commands"
```

## ✨ Features

- **User-Friendly Commands**: Use `systemName`, `interfaces`, `ciscoVLAN` instead of OIDs
- **Vendor Support**: Built-in commands for Cisco, Juniper, and generic devices
- **Unified Endpoint**: Single `/api/snmp` endpoint for all queries
- **Command Discovery**: `/api/snmp/commands` endpoint to explore available commands
- **Smart Operations**: Auto-detects GET vs WALK vs BULK based on command type
- **Table Handling**: Automatic detection and proper formatting of table OIDs
- **Error Handling**: HTTP status codes with descriptive error messages
- **Production Logging**: Winston logger for all SNMP operations
- **Type Safe**: Full TypeScript with proper type definitions
- **Extensible**: Easy to add new vendor-specific commands
- **Backward Compatible**: Legacy OID-based endpoints still available

## 📋 Installation

```bash
npm install
```

## 🔧 Configuration

Update `.env` file:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
SNMP_TIMEOUT=5000
SNMP_RETRIES=1
```

## ▶️ Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

## 🌐 API Endpoints

### Unified Query Endpoint: `GET /api/snmp`

The easiest way to query SNMP devices. Just provide hostname and command name.

**Parameters:**
- `hostname` (required): Target device IP or hostname
- `cmd` (optional): Command name (e.g., `systemName`, `interfaces`, `ciscoVLAN`)
- `oid` (optional): Direct OID if preferred (numeric format)
- `community` (optional): SNMP community (default: `public`)
- `port` (optional): SNMP port (default: `161`)
- `timeout` (optional): Timeout in ms
- `retries` (optional): Number of retries
- `asTable` (optional): Force table format

**Examples:**
```bash
# Get system name
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName"

# Get interfaces
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfaces"

# Get Cisco VLAN info (structured table)
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=ciscoVLAN&asTable=true"

# Use direct OID if preferred
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"
```

### Command Discovery: `GET /api/snmp/commands`

List and search available commands.

```bash
# List all commands
curl "http://localhost:3000/api/snmp/commands"

# Search for commands
curl "http://localhost:3000/api/snmp/commands?search=interface"
curl "http://localhost:3000/api/snmp/commands?search=cisco"
```

### Legacy Endpoints (Backward Compatible)

```bash
# Legacy GET
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"

# Legacy WALK
curl "http://localhost:3000/api/snmp/walk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2"

# Legacy BULK
curl "http://localhost:3000/api/snmp/bulk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2"
```

## 📚 Available Commands

### Generic Commands (All Devices)

**System:**
- `systemInfo` - System description
- `systemName` / `hostname` - Device hostname
- `systemUptime` / `uptime` - Uptime in ticks
- `systemContact` - Contact info
- `systemLocation` - Physical location

**Interfaces:**
- `interfaces` / `ifList` - All interfaces (flat)
- `interfacesTable` - All interfaces (structured)
- `interfaceStatus` / `portStatus` - Status
- `interfaceSpeed` - Speeds
- `interfaceTraffic` - Traffic stats

**Network:**
- `ipAddresses` / `ips` - IP addresses & netmasks
- `arpTable` / `arp` - ARP table
- `routingTable` / `routes` - Routing table

**Performance:**
- `cpuUsage` - CPU utilization
- `memoryUsage` - Memory usage
- `diskUsage` - Disk usage

### Cisco-Specific

- `ciscoInterfaceNames` / `switchInterfaces` - Interface names
- `ciscoPortSpeed` - Port speeds
- `ciscoPortDuplex` - Port duplex
- `ciscoVLAN` / `vlan` - VLAN info
- `ciscoPortVLAN` - Port VLAN assignments
- `ciscoCPU` - CPU usage
- `ciscoMemory` - Memory stats
- `ciscoModuleStatus` - Module status

### Juniper-Specific

- `juniperInterfaces` - Interface details
- `juniperInterfaceStatistics` - Statistics
- `juniperCPU` - CPU utilization
- `juniperMemory` - Memory usage
- `juniperChassis` - Chassis info
- `juniperAlarms` - Active alarms

See `API_USAGE_GUIDE.md` for complete documentation and examples.

## 📁 Project Structure

```
snmp-api/
├── src/
│   ├── constants/
│   │   ├── oid.ts                 # Standard OIDs
│   │   └── snmpCommands.ts        # Command definitions & vendor mappings
│   ├── controllers/
│   │   └── snmpController.ts      # HTTP handlers
│   ├── services/
│   │   ├── snmpService.ts         # SNMP operations
│   │   └── commandResolver.ts     # Command name -> OID resolution
│   ├── middleware/
│   │   ├── errorHandler.ts        # Error handling
│   │   └── requestLogger.ts       # Request logging
│   ├── routes/
│   │   └── snmpRoutes.ts          # Route definitions
│   ├── types/
│   │   └── snmp.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── logger.ts              # Winston logger
│   └── index.ts                   # App entry point
├── logs/                          # Log files
├── dist/                          # Compiled JavaScript
├── API_USAGE_GUIDE.md            # API documentation
├── INTEGRATION_TESTS.md           # Test examples
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 How It Works

1. **User sends request** with hostname and command name:
   ```
   GET /api/snmp?hostname=192.168.1.1&cmd=ciscoVLAN
   ```

2. **CommandResolver** translates the command to OID and operation type:
   ```
   ciscoVLAN → OID: 1.3.6.1.4.1.9.9.46.1.3.1.1.2 → WALK operation
   ```

3. **SnmpService** executes the appropriate SNMP operation (GET/WALK/BULK)

4. **Response** is formatted and returned to the user:
   ```json
   {
     "status": "success",
     "data": [...],
     "operation": "WALK",
     "timestamp": "..."
   }
   ```

## 📝 Response Format

**Success:**
```json
{
  "status": "success",
  "data": [
    {"oid": "1.3.6.1.2.1.1.5.0", "type": 4, "value": "my-router"}
  ],
  "hostname": "192.168.1.1",
  "operation": "GET",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

**Error:**
```json
{
  "status": "error",
  "error": "Unknown SNMP command: 'badCmd'",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## 🛠️ Extensibility

Add new vendor commands by editing `src/constants/snmpCommands.ts`:

```typescript
export const SNMP_COMMANDS: { [key: string]: CommandDefinition } = {
  'myNewCommand': {
    name: 'myNewCommand',
    description: 'Description of what this does',
    oid: '1.3.6.1.2.1.1.1.0',
    operation: 'get', // or 'walk' or 'bulk'
    vendor: 'cisco', // or 'juniper' or 'generic'
    alternatives: ['alias1', 'alias2'],
  },
  // ... more commands
};
```

## 📊 Logging

All operations are logged to `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs

Console output in development mode.

## 🧪 Testing

```bash
npm test
npm run test:watch
```

Tests cover:
- Command resolution
- OID validation
- Table OID detection
- Error handling
- Response formatting

## ⚙️ Production Deployment

1. Build:
   ```bash
   npm run build
   ```

2. Configure environment:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export LOG_LEVEL=warn
   ```

3. Start:
   ```bash
   npm start
   ```

## 📚 Documentation

- **API_USAGE_GUIDE.md** - Complete API documentation with examples
- **INTEGRATION_TESTS.md** - Real-world test cases
- **README.md** - This file

## 🤝 Technologies

- **Express.js** - Web framework
- **net-snmp** - SNMP client
- **Winston** - Logging
- **TypeScript** - Type safety
- **Jest** - Testing

## 📄 License

ISC

---

## 🚀 Get Started Now

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Try it out
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName"

# List all available commands
curl "http://localhost:3000/api/snmp/commands"
```

See `API_USAGE_GUIDE.md` for comprehensive examples and use cases!
