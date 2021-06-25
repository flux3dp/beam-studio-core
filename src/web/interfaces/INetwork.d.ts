export interface INetwork {
  dnsLookUpAll: (hostname: string, options?: {
    family?: number,
    hints?: number,
    verbatim?: boolean,
  }) => Promise<{
    address: string,
    family: number,
  }[]>;
  listSerialPorts: () => Promise<{
    path: string;
  }[]>;
  createSerialPort: (path: string, options?: {
    baudRate?: number;
    dataBits?: number;
    lock?: boolean;
  }, callback?: any) => SerialPort;
  checkIPExist: (ip: string, trial: number) => Promise<{ error?: string, isExisting: boolean }>,
  networkTest: (
    ip: string,
    time: number,
    onProgress: (percentage: number) => void,
  ) => Promise<{
    err?: string,
    reason?: string,
    successRate?: number,
    avgRRT?: number,
    quality?: number,
  }>;
}

export interface SerialPort {
  isOpen: boolean;
  on(event: string, callback: (data?: any) => void): void;
  close(callback?: (error?: Error | null) => void): void;
  write(data: string): boolean;
}
