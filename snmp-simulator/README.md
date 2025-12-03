SNMP Simulator (snmpsim)
=========================

This folder contains a simple snmpsim-based SNMP agent simulator for testing the `node-server` SNMP API.

Overview
- Two simulated agents are provided:
  - Cisco simulator listening on UDP port `1161` (community `public`).
  - Juniper simulator listening on UDP port `1162` (community `public`).

Files
- `run-simulator.ps1` - PowerShell script that sets up a venv, installs `snmpsim`, creates example data files and launches two simulator instances.
- `requirements.txt` - Python dependency (`snmpsim`).
- `data_cisco/public.snmprec` - Example SNMP data for a Cisco device (community `public`).
- `data_juniper/public.snmprec` - Example SNMP data for a Juniper device (community `public`).

How to run (Windows PowerShell)
1. Open an elevated PowerShell (recommended if you need low ports; not required for the default ports used here).
2. From the repository root run:

```powershell
cd .\snmp-simulator
.\run-simulator.ps1
```

The script will create a virtual environment in `./.venv`, install `snmpsim`, create the data files, and open two new PowerShell windows each running a simulator instance.

How to call from the node server
- Cisco: use query parameters `hostname=127.0.0.1&port=1161&community=public` (e.g. GET `/api/snmp?hostname=127.0.0.1&cmd=systemName&port=1161`).
- Juniper: use `hostname=127.0.0.1&port=1162&community=public`.

Notes
- The `node-server` is not modified. It defaults to port `161` — when testing against the simulator pass `port=1161` or `1162` in the query.
- If you prefer Docker, you can install `snmpsim` in a container instead; the included script is for a local Python venv.

If you want, I can also add a lightweight test script that calls your API endpoints and verifies results. Want me to add that?
