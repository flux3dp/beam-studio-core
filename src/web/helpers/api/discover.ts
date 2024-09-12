/* eslint-disable no-console */
/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
import DeviceList from 'helpers/device-list';
import Logger from 'helpers/logger';
import network from 'implementations/network';
import sentryHelper from 'helpers/sentry-helper';
import SmartUpnp from 'helpers/smart-upnp';
import storage from 'implementations/storage';
import Websocket from 'helpers/websocket';
import { IDeviceInfo } from 'interfaces/IDevice';
import { swiftrayClient } from './swiftray-client';

const BUFFER = 100;
const SEND_DEVICES_INTERVAL = 5000;
const CLEAR_DEVICES_INTERVAL = 60000;
const discoverLogger = Logger('discover');

let lastSendMessage = 0;
let timer;
let devices = [];
const dispatchers = [];
const idList = [];
let deviceMap = {};
let swiftrayDevices = {};

// Open up FLUX wrapped websocket
const ws = Websocket({
  method: 'discover',
});

const sendFoundDevices = () => {
  discoverLogger.clear();
  discoverLogger.append(deviceMap);

  dispatchers.forEach((dispatcher) => {
    dispatcher.sender(devices);
  });
};

const updatePokeIPAddr = (device: IDeviceInfo): void => {
  let pokeIPAddr = storage.get('poke-ip-addr');

  if (pokeIPAddr && pokeIPAddr !== '') {
    const pokeIPAddrArr = pokeIPAddr.split(/[,;] ?/);

    if (device.ipaddr && pokeIPAddrArr.indexOf(device.ipaddr) === -1 && device.ipaddr !== 'raspberrypi.local') {
      if (pokeIPAddrArr.length > 19) {
        pokeIPAddr = pokeIPAddrArr.slice(pokeIPAddrArr.length - 19, pokeIPAddrArr.length).join();
      }

      storage.set('poke-ip-addr', `${pokeIPAddr}, ${device.ipaddr}`);
    }
  } else {
    storage.set('poke-ip-addr', device.ipaddr);
  }
}

const onMessage = (device) => {
  if (device.alive) {
    if (device.source === 'h2h') {
      // eslint-disable-next-line no-param-reassign
      device = {
        ...device,
        h2h_uuid: device.uuid,
        uuid: device.addr.toString(),
      };
    }
    updatePokeIPAddr(device);

    deviceMap[device.uuid] = device;
    sentryHelper.sendDeviceInfo(device);
    // SmartUpnp.addSolidIP(device.ip);
  } else if (typeof deviceMap[device.uuid] === 'undefined') {
    delete deviceMap[device.uuid];
  }

  clearTimeout(timer);
  if (Date.now() - lastSendMessage > BUFFER) {
    devices = DeviceList({ ...deviceMap, ...swiftrayDevices });
    sendFoundDevices();
    lastSendMessage = Date.now();
  } else {
    timer = setTimeout(() => {
      devices = DeviceList({ ...deviceMap, ...swiftrayDevices });
      sendFoundDevices();
      lastSendMessage = Date.now();
    }, BUFFER);
  }
};

const startIntervals = () => {
  setInterval(() => {
    devices = [];
    deviceMap = {};
  }, CLEAR_DEVICES_INTERVAL);

  setInterval(() => {
    if (Date.now() - lastSendMessage > BUFFER) {
      sendFoundDevices();
      lastSendMessage = Date.now();
    }
  }, SEND_DEVICES_INTERVAL);

  setInterval(() => {
    swiftrayClient.listDevices().then((res) => {
      swiftrayDevices = res.devices.reduce((acc, device) => {
        acc[device.uuid] = device;
        return acc;
      }, {});
      devices = DeviceList({ ...deviceMap, ...swiftrayDevices });
      sendFoundDevices();
    });
  }, 15000);
  setTimeout(() => {
    swiftrayClient.listDevices().then((res) => {
      swiftrayDevices = res.devices.reduce((acc, device) => {
        acc[device.uuid] = device;
        return acc;
      }, {});
      devices = DeviceList({ ...deviceMap, ...swiftrayDevices });
      sendFoundDevices();
    });
  }, 5000);
};

startIntervals();

ws.onMessage(onMessage);

const poke = (targetIP: string) => {
  if (!targetIP) return;
  ws?.send(JSON.stringify({ cmd: 'poke', ipaddr: targetIP }));
};
const pokeTcp = (targetIP: string) => {
  if (!targetIP) return;
  ws?.send(JSON.stringify({ cmd: 'poketcp', ipaddr: targetIP }));
};
const testTcp = (targetIP: string) => {
  if (!targetIP) return;
  ws?.send(JSON.stringify({ cmd: 'testtcp', ipaddr: targetIP }));
};

// Init Poke IPs
const pokeIPAddr = storage.get('poke-ip-addr');
let pokeIPs = (pokeIPAddr ? pokeIPAddr.split(/[,;] ?/) : ['']);

if (pokeIPs[0] === '') {
  storage.set('poke-ip-addr', '192.168.1.1');
  pokeIPs = ['192.168.1.1'];
}

const startPokeIps = () => {
  let i = 0;
  setInterval(() => {
    pokeTcp(pokeIPs[i]);
    i = i + 1 < pokeIPs.length ? i + 1 : 0;
  }, 1000);
};

startPokeIps();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Discover = (id: string, getDevices: (devices: IDeviceInfo[]) => void) => {
  // console.log('Register Discover', id, printers);
  const index = idList.indexOf(id);

  if (idList.length === 0 || index === -1) {
    idList.push(id);
    dispatchers.push({
      id,
      sender: getDevices,
    });
  } else {
    dispatchers[index] = {
      id,
      sender: getDevices,
    };
  }

  // force callback always executed after return
  setTimeout(() => {
    if (devices.length > 0) {
      getDevices(devices);
    }
  }, 0);

  return {
    connection: ws,
    poke, // UDP poke
    pokeTcp, // Add to tcp poke list
    testTcp, // Test tcp poke
    countDevices() {
      return Object.keys(deviceMap).length;
    },
    removeListener(listenerId) {
      const listenerIndex = idList.indexOf(listenerId);
      idList.splice(listenerIndex, 1);
      dispatchers.splice(listenerIndex, 1);
    },
    sendAggressive() {
      ws.send('aggressive');
    },
    getDevice(uuid: string) {
      return deviceMap[uuid];
    },
  };
};

const initSmartUpnp = async () => {
  try {
    const res = await network.dnsLookUpAll('raspberrypi.local');
    res.forEach((ipAddress) => {
      if (ipAddress.family === 4 && !pokeIPs.includes(ipAddress.address)) {
        console.log(`Add ${ipAddress.address} to Poke ips`);
        pokeIPs.push(ipAddress.address);
      }
    });
  } catch (e) {
    if (e.toString().includes('ENOTFOUND')) {
      console.log('raspberrypi.local not found by DNS server.');
    } else {
      console.log(`Error when dns looking up raspberrypi:\n${e}`);
    }
  }
  // TODO: Fix this init...  no id and getPrinters?
  SmartUpnp.init(Discover(
    'smart-upnp',
    () => {},
  ));
  for (let i = 0; i < pokeIPs.length; i += 1) {
    SmartUpnp.startPoke(pokeIPs[i]);
  }
};
initSmartUpnp();

export const checkConnection = (): boolean => ws?.currentState === ws?.readyState.OPEN;

export const getLatestDeviceInfo = (uuid: string): IDeviceInfo => deviceMap[uuid];

export default Discover;
