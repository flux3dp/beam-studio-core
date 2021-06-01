export interface ICommunicator {
  on(channel: string, listener: any): void;
  send(channel: string, ...args: any[]): void;
}
