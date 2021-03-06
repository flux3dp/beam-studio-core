import { IDeviceInfo } from 'interfaces/IDevice';
import versionCompare from './version-compare';

const infoMap = {
  delta: {
    firmware: {
      api_key: 'fluxmonitor',
      downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw',
    },
    toolhead: {
      api_key: 'toolhead',
      downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxhead_v[version].bin',
    },
  },
  beambox: {
    firmware: {
      api_key: 'beambox-firmware',
      downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/firmware/beambox/beamboxfirmware-[version].fxfw',
    },
  },
};

function checkMachineSeries(model) {
  switch (model) {
    case 'fhexa1':
    case 'fbb1b':
    case 'fbb1p':
    case 'fbm1':
    case 'darwin-dev':
    case 'laser-b1':
    case 'laser-b2':
      return 'beambox';
    case 'delta-1':
    case 'delta-1p':
      return 'delta';
    default:
      return 'beambox';
  }
}

export default async function checkFirmware(
  device: IDeviceInfo,
  type: string,
): Promise<{ needUpdate: boolean, [key: string]: string | boolean }> {
  if (!navigator.onLine) {
    throw new Error('Offline');
  }

  return new Promise<{ needUpdate: boolean, [key: string]: string | boolean }>((resolve) => {
    const series = checkMachineSeries(device.model);
    const info = infoMap[series][type];
    const requestData = {
      feature: 'check_update',
      key: info.api_key,
    };

    $.ajax({
      url: 'https://flux3dp.com/api_entry/',
      data: requestData,
    })
      .done((response) => {
        // eslint-disable-next-line no-console
        console.log(response);
        try {
          response.needUpdate = versionCompare(device.version, response.latest_version);
          // eslint-disable-next-line no-console
          console.log('response.needUpdate: ', response.needUpdate);
          response.latestVersion = response.latest_version;
          if (response.changelog_en) {
            response.changelog_en = response.changelog_en.replace(/[\r]/g, '<br/>');
          }
          if (response.changelog_zh) {
            response.changelog_zh = response.changelog_zh.replace(/[\r]/g, '<br/>');
          }
          response.downloadUrl = info.downloadUrl.replace('[version]', response.latest_version);
          resolve(response);
        } catch {
          resolve({
            needUpdate: false,
          });
        }
      })
      .fail(() => {
        resolve({
          needUpdate: false,
        });
      });
  });
}
