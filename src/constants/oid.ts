// Common SNMP OIDs
export const OID = {
  // System OIDs
  hostname: "1.3.6.1.2.1.1.5.0",
  sysDescr: "1.3.6.1.2.1.1.1.0",
  sysObjectID: "1.3.6.1.2.1.1.2.0",
  sysUpTime: "1.3.6.1.2.1.1.3.0",
  sysContact: "1.3.6.1.2.1.1.4.0",
  sysName: "1.3.6.1.2.1.1.5.0",
  sysLocation: "1.3.6.1.2.1.1.6.0",

  // Interface OIDs
  ifEntry: "1.3.6.1.2.1.2.2", // IF-MIB::ifEntry (table)
  ifIndex: "1.3.6.1.2.1.2.2.1.1",
  ifDescr: "1.3.6.1.2.1.2.2.1.2",
  ifType: "1.3.6.1.2.1.2.2.1.3",
  ifMtu: "1.3.6.1.2.1.2.2.1.4",
  ifSpeed: "1.3.6.1.2.1.2.2.1.5",
  ifPhysAddress: "1.3.6.1.2.1.2.2.1.6",
  ifAdminStatus: "1.3.6.1.2.1.2.2.1.7",
  ifOperStatus: "1.3.6.1.2.1.2.2.1.8",
  ifLastChange: "1.3.6.1.2.1.2.2.1.9",
  ifInOctets: "1.3.6.1.2.1.2.2.1.10",
  ifInUcastPkts: "1.3.6.1.2.1.2.2.1.11",
  ifInErrors: "1.3.6.1.2.1.2.2.1.13",

  // IP OIDs
  ipAddrTable: "1.3.6.1.2.1.4.20", // IP-MIB::ipAddrTable
  ipAddrEntry: "1.3.6.1.2.1.4.20.1", // IP-MIB::ipAddrEntry (table)
  ipAdEntAddr: "1.3.6.1.2.1.4.20.1.1",
  ipAdEntIfIndex: "1.3.6.1.2.1.4.20.1.2",
  ipAdEntNetMask: "1.3.6.1.2.1.4.20.1.3",

  // TCP OIDs
  tcpConnTable: "1.3.6.1.2.1.6.13",
  tcpConnEntry: "1.3.6.1.2.1.6.13.1",

  // UDP OIDs
  udpTable: "1.3.6.1.2.1.7.5",
  udpEntry: "1.3.6.1.2.1.7.5.1",
};

export default OID;
