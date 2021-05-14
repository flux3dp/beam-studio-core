/* eslint-disable no-console */
/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
import Websocket from 'helpers/websocket';
import DeviceList from 'helpers/device-list';
import storage from 'helpers/storage-helper';
import Logger from 'helpers/logger';
import sentryHelper from 'helpers/sentry-helper';
import SmartUpnp from 'helpers/smart-upnp';
import { IDeviceInfo } from 'interfaces/IDevice';

import CloudApi from './cloud';

const dns = requireNode('dns');

const dnsPromise = dns.promises;
let lastSendMessage = 0;
const BUFFER = 100;
let timer;
const SEND_DEVICES_INTERVAL = 5000;
const discoverLogger = Logger('discover');
let printers = [];
const dispatchers = [];
const idList = [];
let devices = {};
const sendFoundPrinter = () => {
  discoverLogger.clear();
  discoverLogger.append(devices);

  dispatchers.forEach((dispatcher) => {
    dispatcher.sender(printers);
  });
};
const ws = Websocket({
  method: 'discover',
});
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

    devices[device.uuid] = device;
    sentryHelper.sendDeviceInfo(device);
    // SmartUpnp.addSolidIP(device.ip);
  } else if (typeof devices[device.uuid] === 'undefined') {
    delete devices[device.uuid];
  }

  clearTimeout(timer);
  if (Date.now() - lastSendMessage > BUFFER) {
    printers = DeviceList(devices);
    sendFoundPrinter();
    lastSendMessage = Date.now();
  } else {
    timer = setTimeout(() => {
      printers = DeviceList(devices);
      sendFoundPrinter();
      lastSendMessage = Date.now();
    }, BUFFER);
  }
};
const poke = (targetIP: string) => {
  if (!targetIP) return;
  printers = [];
  devices = {};
  ws.send(JSON.stringify({ cmd: 'poke', ipaddr: targetIP }));
};
const pokeTcp = (targetIP: string) => {
  if (!targetIP) return;
  printers = [];
  ws.send(JSON.stringify({ cmd: 'poketcp', ipaddr: targetIP }));
};
const testTcp = (targetIP: string) => {
  if (!targetIP) return;
  ws.send(JSON.stringify({ cmd: 'testtcp', ipaddr: targetIP }));
};
const pokeIPAddr = storage.get('poke-ip-addr');
let pokeIPs = (pokeIPAddr ? pokeIPAddr.split(/[,;] ?/) : ['']);

if (pokeIPs[0] === '') {
  storage.set('poke-ip-addr', '192.168.1.1');
  pokeIPs = ['192.168.1.1'];
}

setInterval(() => {
  if (Date.now() - lastSendMessage > BUFFER) {
    sendFoundPrinter();
    lastSendMessage = Date.now();
  }
}, SEND_DEVICES_INTERVAL);

ws.onMessage(onMessage);

const startTcpPoke = () => {
  let i = 0;
  setInterval(() => {
    pokeTcp(pokeIPs[i]);
    i = i + 1 < pokeIPs.length ? i + 1 : 0;
  }, 1000);
};
startTcpPoke();

CloudApi.getDevices().then((resp) => {
  if (resp.ok) {
    resp.json().then((content) => {
      if (content.devices) {
        content.devices.forEach((device) => {
          console.log(device.alias, device.ip_addr);
          if (device.ip_addr) {
            // console.log("Start poking cloud device IP:", device.ip_addr);
            // eslint-disable-next-line no-control-regex
            SmartUpnp.startPoke(device.ip_addr.trim().replace(/\u0000/g, ''));
          }
        });
      }
    });
  }
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Discover = (id: string, getPrinters: (printers: IDeviceInfo[]) => void) => {
  console.log('Register Discover', id, printers);
  const index = idList.indexOf(id);

  if (idList.length === 0 || index === -1) {
    idList.push(id);
    dispatchers.push({
      id,
      sender: getPrinters,
    });
  } else {
    dispatchers[index] = {
      id,
      sender: getPrinters,
    };
  }

  // force callback always executed after return
  setTimeout(() => {
    if (printers.length > 0) {
      getPrinters(printers);
    }
  }, 0);

  return {
    connection: ws,
    poke, // UDP poke
    pokeTcp, // Add to tcp poke list
    testTcp, // Test tcp poke
    countDevices() {
      return Object.keys(devices).length;
    },
    removeListener(listenerId) {
      const listenerIndex = idList.indexOf(listenerId);
      idList.splice(listenerIndex, 1);
      dispatchers.splice(listenerIndex, 1);
    },
    sendAggressive() {
      ws.send('aggressive');
    },
    getLatestPrinter(printer) {
      return devices[printer.uuid];
    },
  };
};

const initSmartUpnp = async () => {
  try {
    const lookupOptions = {
      all: true,
    };
    const res = await dnsPromise.lookup('raspberrypi.local', lookupOptions);
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

export default Discover;
