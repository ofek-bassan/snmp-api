export interface SnmpGetRequest {
  hostname: string;
  oid: string | string[];
  community?: string;
  port?: number;
  timeout?: number;
  retries?: number;
}

export interface SnmpWalkRequest {
  hostname: string;
  oid: string;
  community?: string;
  port?: number;
  timeout?: number;
  retries?: number;
}

export interface SnmpBulkRequest {
  hostname: string;
  oid: string;
  community?: string;
  port?: number;
  timeout?: number;
  retries?: number;
  maxRepetitions?: number;
  nonRepeaters?: number;
}

export interface SnmpVarbind {
  oid: string;
  type: number;
  value: any;
}

export interface SnmpResponse {
  status: 'success' | 'error';
  data?: SnmpVarbind[] | Record<string, any>;
  error?: string;
  errorCode?: number;
  hostname: string;
  operation: 'GET' | 'WALK' | 'BULK';
  timestamp: string;
}

export interface TableRow {
  [key: string]: any;
}

export interface TableData {
  [index: string]: TableRow;
}

export class SnmpError extends Error {
  constructor(
    message: string,
    public errorCode?: number,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SnmpError';
  }
}
