#!/usr/bin/env pwsh
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "Preparing SNMP simulator environment in $PWD"

# Create virtual environment
if (-Not (Test-Path .\.venv)) {
    python -m venv .\.venv
}

# Use venv python to install packages
$venvPython = Join-Path $scriptDir '.venv\Scripts\python.exe'
$venvScripts = Join-Path $scriptDir '.venv\Scripts'
Write-Host "Using Python: $venvPython"

Write-Host "Installing dependencies (snmpsim-lextudio) into virtualenv..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r .\requirements.txt

# Create data directories
$dataCisco = Join-Path $scriptDir 'data_cisco'
$dataJuniper = Join-Path $scriptDir 'data_juniper'
New-Item -ItemType Directory -Force -Path $dataCisco | Out-Null
New-Item -ItemType Directory -Force -Path $dataJuniper | Out-Null

# Write sample public.snmprec for Cisco
$ciscoLines = @(
    '1.3.6.1.2.1.1.1.0|4|Cisco IOS Software, C3750 Software',
    '1.3.6.1.2.1.1.2.0|6|1.3.6.1.4.1.9.1.516',
    '1.3.6.1.2.1.1.5.0|4|cisco-switch-01',
    '1.3.6.1.2.1.2.2.1.2.1|4|GigabitEthernet1/0/1',
    '1.3.6.1.2.1.2.2.1.2.2|4|GigabitEthernet1/0/2',
    '1.3.6.1.2.1.2.2.1.8.1|2|1',
    '1.3.6.1.2.1.2.2.1.8.2|2|2'
)
$ciscoLines | Set-Content -Encoding ASCII -Path (Join-Path $dataCisco 'public.snmprec')

# Write sample public.snmprec for Juniper
$juniperLines = @(
    '1.3.6.1.2.1.1.1.0|4|JunOS 18.4R1.10',
    '1.3.6.1.2.1.1.2.0|6|1.3.6.1.4.1.2636.1.1',
    '1.3.6.1.2.1.1.5.0|4|juniper-router-01',
    '1.3.6.1.2.1.2.2.1.2.1|4|ge-0/0/0',
    '1.3.6.1.2.1.2.2.1.2.2|4|ge-0/0/1',
    '1.3.6.1.2.1.2.2.1.8.1|2|1',
    '1.3.6.1.2.1.2.2.1.8.2|2|1'
)
$juniperLines | Set-Content -Encoding ASCII -Path (Join-Path $dataJuniper 'public.snmprec')

Write-Host "Data files created:`n - $dataCisco`n - $dataJuniper"

# Use the lextudio command (without -lite suffix)
$responder = Join-Path $venvScripts 'snmpsim-command-responder.exe'

if (Test-Path $responder) {
    Write-Host "Found responder: $responder"
    
    Write-Host "Starting Cisco simulator on UDP port 1161..."
    Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","& '$responder' --data-dir='$dataCisco' --agent-udpv4-endpoint=0.0.0.0:1161" -WorkingDirectory $scriptDir
    
    Write-Host "Starting Juniper simulator on UDP port 1162..."
    Start-Process -FilePath powershell -ArgumentList "-NoExit","-Command","& '$responder' --data-dir='$dataJuniper' --agent-udpv4-endpoint=0.0.0.0:1162" -WorkingDirectory $scriptDir
    
    Write-Host "Simulators launched. Use Ctrl-C in simulator windows to stop them."
} else {
    Write-Host "ERROR: snmpsim-command-responder.exe not found at $responder"
    Write-Host "Please verify snmpsim-lextudio installation completed successfully."
    Write-Host "`nTry running: & '$venvPython' -m pip list | Select-String snmpsim"
}