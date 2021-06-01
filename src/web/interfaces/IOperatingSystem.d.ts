export interface IOperatingSystem {
  type: () => string;
  arch: () => string;
  release:() => string;
  networkInterfaces: () => { [id: string]: INetwork[] };
}

export interface INetwork {
  address: string,
  netmask: string,
  family: string,
  mac: string,
  internal: boolean,
  scopeid: number,
  cidr: string
}
