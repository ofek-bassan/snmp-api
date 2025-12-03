# How to Explain This to Your AI Agent

## The Problem We Solved

**Before:** Users had to know specific SNMP OIDs to query devices
```
GET /api/snmp/get?hostname=192.168.1.1&oid=1.3.6.1.2.1.1.5.0
```

**After:** Users can use friendly command names
```
GET /api/snmp?hostname=192.168.1.1&cmd=systemName
```

## How to Brief Your AI Agent

Here's a clear explanation to give to your AI agent:

---

### Core Architecture

**1. Command Definition Layer** (`src/constants/snmpCommands.ts`)
- Contains ~50 predefined SNMP commands
- Maps command names to OIDs (e.g., `systemName` → `1.3.6.1.2.1.1.5.0`)
- Each command specifies:
  - OID value
  - Operation type (GET, WALK, BULK)
  - Vendor (cisco, juniper, generic)
  - Aliases (alternative command names)

**2. Command Resolution Layer** (`src/services/commandResolver.ts`)
- Translates user input to OID and operation
- Accepts either:
  - Command names (e.g., `ciscoVLAN`)
  - Direct OIDs (e.g., `1.3.6.1.2.1.1.5.0`)
- Handles command search and discovery
- Validates OID format

**3. SNMP Execution Layer** (`src/services/snmpService.ts`)
- Executes actual SNMP operations (GET/WALK/BULK)
- Returns structured responses
- Auto-detects and formats table OIDs
- Handles all error cases

**4. HTTP Layer** (`src/controllers/snmpController.ts` + `src/routes/snmpRoutes.ts`)
- Unified endpoint: `GET /api/snmp`
- Command discovery endpoint: `GET /api/snmp/commands`
- Legacy endpoints for backward compatibility

### Data Flow

```
User Request
    ↓
HTTP Route Handler
    ↓
Command Resolver (maps "ciscoVLAN" → OID + operation)
    ↓
SNMP Service (executes GET/WALK/BULK)
    ↓
Response Formatter (structures data)
    ↓
HTTP Response
```

---

## Key Features to Understand

### 1. Vendor Support

**Generic Commands** (work on all devices)
- system info, interfaces, IP addresses, ARP, routing tables

**Cisco Specific**
- Interface names, VLAN info, port settings
- Uses Cisco proprietary OIDs
- Aliases like `switchInterfaces` for easier discovery

**Juniper Specific**
- Interface details, chassis info, alarms
- Uses Juniper proprietary OIDs

### 2. Operation Auto-Detection

The system automatically determines whether to use GET, WALK, or BULK:
- GET for scalar values (hostname, uptime, CPU usage)
- WALK for table data (interfaces, routes, ARP table)
- BULK for efficient large data retrieval

### 3. Table Handling

Table OIDs are auto-detected and formatted nicely:
```
Input:  cmd=interfaces
Output: Structured table with rows indexed by interface number
```

### 4. Error Handling

- Missing parameters → 400 Bad Request
- Unknown commands → 400 with suggestions
- SNMP failures → 500 with error message
- All errors logged with context

---

## How to Extend It

### Adding New Commands

Edit `src/constants/snmpCommands.ts`:

```typescript
'myCommand': {
  name: 'myCommand',
  description: 'What this gets',
  oid: '1.3.6.1.2.1.1.1.0',
  operation: 'get', // or 'walk' or 'bulk'
  vendor: 'cisco', // or 'juniper' or 'generic'
  alternatives: ['alias1', 'alias2'],
}
```

That's it! The resolver automatically picks it up.

### Adding New Vendors

1. Create vendor section in `snmpCommands.ts`
2. Define OIDs specific to that vendor
3. Set `vendor: 'myvendor'` in command definitions
4. Use in any query:
   ```
   GET /api/snmp?hostname=device&cmd=myVendorCommand
   ```

---

## What to Tell Your AI Agent

### If Working on Bug Fixes
"The SNMP API has a unified endpoint `/api/snmp` that translates command names to OIDs. The CommandResolver service maps command names like `systemName` to their corresponding OIDs. All SNMP operations are in the `snmpService.ts` file."

### If Working on New Features
"Add new commands to `src/constants/snmpCommands.ts`. The system auto-detects whether to use GET, WALK, or BULK based on the operation field. Use vendor-specific OIDs for targeted behavior."

### If Working on Vendor Support
"Look at `src/constants/snmpCommands.ts` for command definitions. Each command has a `vendor` field (cisco, juniper, or generic). Cisco commands use OIDs starting with 1.3.6.1.4.1.9. Juniper uses 1.3.6.1.4.1.2636. Generic uses standard MIB-II OIDs (1.3.6.1.2.1)."

### If Working on Error Handling
"The CommandResolver throws SnmpError for unknown commands. The SnmpService throws SnmpError for operation failures. All errors are caught by the global error handler in `middleware/errorHandler.ts` and formatted with appropriate HTTP status codes."

---

## Important File Relationships

```
User sends: GET /?cmd=systemName
        ↓
    snmpRoutes.ts
        ↓
snmpController.ts (query method)
        ↓
commandResolver.resolve("systemName")
        ↓
searches SNMP_COMMANDS in snmpCommands.ts
        ↓
returns { oid: "1.3.6.1.2.1.1.5.0", operation: "get" }
        ↓
snmpService.get({ oid, ... })
        ↓
returns structured response
        ↓
formatted and sent to user
```

---

## Environment Variables

```
PORT=3000                 # Server port
NODE_ENV=development      # development or production
LOG_LEVEL=info           # debug, info, warn, error
SNMP_TIMEOUT=5000        # milliseconds
SNMP_RETRIES=1           # number of retries
```

---

## Testing Strategy for AI Agent

### Unit Tests
- Test command resolution: "systemName" → OID
- Test OID validation
- Test table OID detection

### Integration Tests
- Test GET operations
- Test WALK operations
- Test error cases (timeouts, unknown commands)

### Real-world Tests
- Test against actual Cisco switch
- Test against actual Juniper router
- Test against generic SNMP device

---

## Performance Considerations

1. **Command Lookup**: O(1) - direct object lookup
2. **OID Validation**: O(1) - regex test
3. **SNMP Operations**: Depends on device response time
4. **Table Parsing**: O(n) where n = number of rows

---

## Security Notes

1. Community strings are passed as query parameters (transport layer security recommended)
2. No SQL injection (no database)
3. OID validation prevents malformed requests
4. Timeout protection against slow/malicious devices
5. Error messages don't leak sensitive info in production

---

## When to Use Each Endpoint

### `GET /api/snmp` (Recommended for Most Use Cases)
- User knows friendly command name
- Auto-detects operation type
- Handles table formatting
- Better error messages

### `GET /api/snmp/get` (Legacy, Direct OID)
- User has OID already
- Needs exact control
- Querying custom/unknown OIDs

### `GET /api/snmp/commands` (Discovery)
- Don't know what commands available
- Need to search
- Building dynamic UI

---

## How to Brief for Specific Tasks

### Task: "Fix SNMP timeout issues"
→ Look in `snmpService.ts`, the timeout is set in session options. Check the default in `.env`.

### Task: "Add Fortinet support"
→ Add new commands to `snmpCommands.ts` with `vendor: 'fortinet'`. Map Fortinet OIDs to command names.

### Task: "Improve error messages"
→ Edit `errorHandler.ts` for formatting, or `commandResolver.ts` for validation errors, or `snmpService.ts` for operation errors.

### Task: "Add rate limiting"
→ Add middleware before routes in `index.ts`. Plug into request logger in `requestLogger.ts`.

### Task: "Support authentication"
→ Add auth middleware in `index.ts`. Store credentials securely, don't pass in query params.

---

## Summary

The API is a **command translation layer** that:
1. Takes user-friendly command names
2. Maps them to vendor-specific OIDs
3. Executes appropriate SNMP operations
4. Returns well-formatted responses

Everything flows through the **CommandResolver** → **SnmpService** → **Response Formatter** pipeline.

To understand any part, trace through those three layers.
