import { IDeviceDetailInfo, IDeviceInfo } from "interfaces/IDevice";
import deviceMaster from "helpers/device-master";
import constant from "../constant";

const getAdorPaddingAccel = async (device: IDeviceInfo | null): Promise<number | null> => {
  if (!constant.adorModels.includes(device?.model)) return null;
  try {
    await deviceMaster.select(device);
    const deviceDetailInfo = await deviceMaster.getDeviceDetailInfo();
    const xAcc = parseInt(deviceDetailInfo.x_acc, 10);
    // handle nan and 0
    return Number.isNaN(xAcc) || !xAcc ? null : xAcc;
  } catch (error) {
    console.error(error);
    return null;
  }
};


export {
  // eslint-disable-next-line import/prefer-default-export
  getAdorPaddingAccel,
};
