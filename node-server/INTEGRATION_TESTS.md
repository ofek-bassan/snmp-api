# Integration Test Examples

These are example requests for testing the SNMP API with a real SNMP device.

## Prerequisites

- SNMP-enabled device (router, switch, server, etc.)
- Device IP address
- SNMP community string (usually "public" for read-only)

## Example 1: Get System Hostname

```bash
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0&community=public"
```

Expected Response:
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

## Example 2: Get Multiple System OIDs

```bash
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.1.0&oid=1.3.6.1.2.1.1.3.0&oid=1.3.6.1.2.1.1.5.0&community=public"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "oid": "1.3.6.1.2.1.1.1.0",
      "type": 4,
      "value": "System Description"
    },
    {
      "oid": "1.3.6.1.2.1.1.3.0",
      "type": 67,
      "value": 12345678
    },
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

## Example 3: Walk Interface Table (Flat Format)

```bash
curl "http://localhost:3000/api/snmp/walk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2&community=public"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {"oid": "1.3.6.1.2.1.2.2.1.1.1", "type": 2, "value": 1},
    {"oid": "1.3.6.1.2.1.2.2.1.2.1", "type": 4, "value": "eth0"},
    {"oid": "1.3.6.1.2.1.2.2.1.3.1", "type": 2, "value": 6},
    {"oid": "1.3.6.1.2.1.2.2.1.1.2", "type": 2, "value": 2},
    {"oid": "1.3.6.1.2.1.2.2.1.2.2", "type": 4, "value": "eth1"}
  ],
  "hostname": "192.168.1.1",
  "operation": "WALK",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Example 4: Walk Interface Table (Structured Format)

```bash
curl "http://localhost:3000/api/snmp/walk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2.1&asTable=true&community=public"
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "1": {
      "col_1": {
        "oid": "1.3.6.1.2.1.2.2.1.1.1",
        "type": 2,
        "value": 1
      },
      "col_2": {
        "oid": "1.3.6.1.2.1.2.2.1.2.1",
        "type": 4,
        "value": "eth0"
      },
      "col_3": {
        "oid": "1.3.6.1.2.1.2.2.1.3.1",
        "type": 2,
        "value": 6
      },
      "col_5": {
        "oid": "1.3.6.1.2.1.2.2.1.5.1",
        "type": 67,
        "value": 1000000000
      }
    },
    "2": {
      "col_1": {
        "oid": "1.3.6.1.2.1.2.2.1.1.2",
        "type": 2,
        "value": 2
      },
      "col_2": {
        "oid": "1.3.6.1.2.1.2.2.1.2.2",
        "type": 4,
        "value": "eth1"
      }
    }
  },
  "hostname": "192.168.1.1",
  "operation": "WALK",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Example 5: BULK Operation

```bash
curl "http://localhost:3000/api/snmp/bulk?hostname=192.168.1.1&oid=1.3.6.1.2.1.2.2.1&maxRepetitions=30&community=public"
```

## Example 6: Validate OID

```bash
curl -X POST http://localhost:3000/api/snmp/validate-oid \
  -H "Content-Type: application/json" \
  -d '{
    "oid": "1.3.6.1.2.1.2.2.1"
  }'
```

Response:
```json
{
  "status": "success",
  "oid": "1.3.6.1.2.1.2.2.1",
  "isValid": true,
  "isTable": true,
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Example 7: Health Check

```bash
curl http://localhost:3000/api/snmp/health
```

Response:
```json
{
  "status": "healthy",
  "service": "snmp-api",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Error Cases

### Missing Required Parameter

```bash
curl "http://localhost:3000/api/snmp/get?oid=1.3.6.1.2.1.1.5.0"
```

Response:
```json
{
  "status": "error",
  "error": "hostname parameter is required",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

### Invalid OID Format

```bash
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.1&oid=invalid.oid"
```

Response:
```json
{
  "status": "error",
  "error": "Invalid OID format: invalid.oid",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

### SNMP Operation Timeout

```bash
curl "http://localhost:3000/api/snmp/get?hostname=192.168.1.999&oid=1.3.6.1.2.1.1.5.0&timeout=2000"
```

Response:
```json
{
  "status": "error",
  "error": "SNMP GET failed: Request timed out",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

## Tips

1. **Find SNMP OIDs**: Use `snmpwalk` command-line tool to discover available OIDs
   ```bash
   snmpwalk -v 2c -c public 192.168.1.1 1.3.6.1.2.1.1
   ```

2. **Test connectivity**: Ensure SNMP is enabled on the target device
   ```bash
   snmpget -v 2c -c public 192.168.1.1 1.3.6.1.2.1.1.5.0
   ```

3. **Check logs**: Review application logs in the `logs/` directory for detailed error information

4. **Performance**: For large datasets, use BULK operations with higher `maxRepetitions` values
