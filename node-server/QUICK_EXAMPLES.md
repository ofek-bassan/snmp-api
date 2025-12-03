# Quick Examples - SNMP API

## Start the Server

```bash
npm install
npm run dev
```

Server will start on `http://localhost:3000`

---

## Basic Queries

### 1. Get Device Hostname
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName"
```

### 2. Get System Uptime
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemUptime"
```

### 3. Get System Description
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemInfo"
```

### 4. Get All Interfaces
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfaces"
```

### 5. Get Interfaces as Structured Table
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfacesTable"
```

---

## Cisco Device Examples

### Get Interface Names/Descriptions
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=switchInterfaces&community=public"
```

### Get VLAN Information
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoVLAN&community=public"
```

### Get VLAN Assignments (Structured)
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoPortVLAN&asTable=true&community=public"
```

### Get CPU Usage
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoCPU&community=public"
```

### Get Memory Usage
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoMemory&community=public"
```

### Get Port Speeds
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoPortSpeed&community=public"
```

### Get Port Duplex Mode
```bash
curl "http://localhost:3000/api/snmp?hostname=10.1.1.254&cmd=ciscoPortDuplex&community=public"
```

---

## Juniper Device Examples

### Get Interface Details
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperInterfaces&community=public"
```

### Get Interface Statistics
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperInterfaceStatistics&community=public"
```

### Get CPU Utilization
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperCPU&community=public"
```

### Get Memory Usage
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperMemory&community=public"
```

### Get Chassis Information
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperChassis&community=public"
```

### Get Active Alarms
```bash
curl "http://localhost:3000/api/snmp?hostname=10.2.2.1&cmd=juniperAlarms&community=public"
```

---

## Discovery & Validation

### List All Available Commands
```bash
curl "http://localhost:3000/api/snmp/commands"
```

### Search for Interface Commands
```bash
curl "http://localhost:3000/api/snmp/commands?search=interface"
```

### Search for Cisco Commands
```bash
curl "http://localhost:3000/api/snmp/commands?search=cisco"
```

### Search for Juniper Commands
```bash
curl "http://localhost:3000/api/snmp/commands?search=juniper"
```

### Validate OID Format
```bash
curl -X POST http://localhost:3000/api/snmp/validate-oid \
  -H "Content-Type: application/json" \
  -d '{"oid": "1.3.6.1.2.1.2.2.1"}'
```

### Health Check
```bash
curl "http://localhost:3000/api/snmp/health"
```

---

## Advanced Examples

### Use Direct OID Instead of Command Name
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"
```

### Customize SNMP Parameters
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName&community=private&port=161&timeout=10000&retries=3"
```

### Force Table Format
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfaces&asTable=true"
```

### Get IP Addresses Table
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=ipAddresses&asTable=true"
```

### Get ARP Table
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=arpTable"
```

### Get Routing Table
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=routingTable"
```

---

## Using Legacy Endpoints

### Legacy GET Endpoint
```bash
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0"
```

### Legacy WALK Endpoint
```bash
curl "http://localhost:3000/api/snmp/walk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2"
```

### Legacy BULK Endpoint
```bash
curl "http://localhost:3000/api/snmp/bulk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2&maxRepetitions=30"
```

---

## Error Handling Examples

### Missing Required Parameter
```bash
curl "http://localhost:3000/api/snmp?cmd=systemName"
# Error: "hostname parameter is required"
```

### Unknown Command
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=unknownCommand"
# Error: "Unknown SNMP command: 'unknownCommand'"
```

### Device Not Reachable
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.999&cmd=systemName&timeout=2000"
# Error: "SNMP GET failed: Request timed out"
```

### Invalid Community String
```bash
curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=systemName&community=wrongcommunity"
# Error: "SNMP GET failed: No response from remote engine"
```

---

## Tips

1. **Test Connectivity First**
   ```bash
   curl "http://localhost:3000/api/snmp?hostname=YOUR_DEVICE&cmd=systemName"
   ```

2. **Use Command Discovery**
   ```bash
   curl "http://localhost:3000/api/snmp/commands?search=keyword"
   ```

3. **Check Logs**
   - Look in `logs/` directory for detailed operation logs
   - Useful for debugging SNMP issues

4. **Adjust Timeouts for Slow Devices**
   ```bash
   curl "http://localhost:3000/api/snmp?hostname=slowdevice.local&cmd=systemName&timeout=15000"
   ```

5. **Use Table Format for Complex Data**
   ```bash
   curl "http://localhost:3000/api/snmp?hostname=192.168.1.1&cmd=interfaces&asTable=true"
   ```

6. **Search by Vendor**
   - Search for "cisco" or "juniper" to find vendor-specific commands
   - Use "generic" for universal commands

---

## Response Examples

### Successful GET Response
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

### Successful WALK Response (Flat)
```json
{
  "status": "success",
  "data": [
    {"oid": "1.3.6.1.2.1.2.2.1.1.1", "type": 2, "value": 1},
    {"oid": "1.3.6.1.2.1.2.2.1.2.1", "type": 4, "value": "eth0"},
    {"oid": "1.3.6.1.2.1.2.2.1.1.2", "type": 2, "value": 2},
    {"oid": "1.3.6.1.2.1.2.2.1.2.2", "type": 4, "value": "eth1"}
  ],
  "operation": "WALK",
  "timestamp": "..."
}
```

### Successful WALK Response (Table)
```json
{
  "status": "success",
  "data": {
    "1": {
      "col_1": {"oid": "...", "type": 2, "value": 1},
      "col_2": {"oid": "...", "type": 4, "value": "eth0"}
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

### Error Response
```json
{
  "status": "error",
  "error": "Unknown SNMP command: 'badCmd'",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

---

## Commands by Category

### System Commands
```bash
systemInfo, systemName, systemUptime, systemContact, systemLocation
```

### Interface Commands
```bash
interfaces, interfacesTable, interfaceStatus, interfaceSpeed, interfaceTraffic
```

### Network Commands
```bash
ipAddresses, arpTable, routingTable
```

### Performance Commands
```bash
cpuUsage, memoryUsage, diskUsage
```

### Cisco Commands
```bash
ciscoInterfaceNames, ciscoVLAN, ciscoPortVLAN, ciscoCPU, ciscoMemory, 
ciscoPortSpeed, ciscoPortDuplex, ciscoModuleStatus
```

### Juniper Commands
```bash
juniperInterfaces, juniperInterfaceStatistics, juniperCPU, juniperMemory, 
juniperChassis, juniperAlarms
```

---

Enjoy using the SNMP API! See API_USAGE_GUIDE.md for more details.
