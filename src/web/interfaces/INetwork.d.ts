export interface INetwork {
  dnsLookUpAll: (hostname: string, options?: {
    family?: number,
    hints?: number,
    verbatim?: boolean,
  }) => Promise<{
    address: string,
    family: number,
  }[]>;
  createPingSession: (options?: {
    retries?: number,
  }) => PingSession;
  listSerialPorts: () => Promise<{
    path: string;
  }[]>;
  createSerialPort: (path: string, options?: {
    baudRate?: number;
    dataBits?: number;
    lock?: boolean;
  }, callback?: any) => SerialPort;
}

export interface PingSession {
  on: (event: string, callback) => void;
  pingHost: (target: string, callback) => void;
  close: () => void;
}

export interface SerialPort {
  isOpen: boolean;
  on(event: string, callback: (data?: any) => void): void;
  close(callback?: (error?: Error | null) => void): void;
  write(data: string): boolean;
}
