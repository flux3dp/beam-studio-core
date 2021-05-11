/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable react/sort-comp */
import * as React from 'react';
import $ from 'jquery';

import * as i18n from 'helpers/i18n';
import alert from 'app/actions/alert-caller';
import Alert from 'app/widgets/Alert';
import alertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import CameraCalibration from 'helpers/api/camera-calibration';
import CheckDeviceStatus from 'helpers/check-device-status';
import Config from 'helpers/api/config';
import Constant from 'app/actions/beambox/constant';
import DeviceErrorHandler from 'helpers/device-error-handler';
import DeviceMaster from 'helpers/device-master';
import dialog from 'app/actions/dialog-caller';
import Modal from 'app/widgets/Modal';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import progress from 'app/actions/progress-caller';
import UnitInput from 'app/widgets/Unit-Input-v2';
import VersionChecker from 'helpers/version-checker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const classNames = requireNode('classnames');
const { useState, useEffect, useRef } = React;
const LANG = i18n.lang.camera_calibration;

const cameraCalibrationWebSocket = CameraCalibration();

// View render the following steps
const STEP_ASK_READJUST = Symbol('STEP_ASK_READJUST');
const STEP_REFOCUS = Symbol('STEP_REFOCUS');
const STEP_PUT_PAPER = Symbol('STEP_PUT_PAPER');
const STEP_BEFORE_ANALYZE_PICTURE = Symbol('STEP_BEFORE_ANALYZE_PICTURE');
const STEP_FINISH = Symbol('STEP_FINISH');

let cameraPosition = {
  x: 0,
  y: 0,
};
const calibratedMachineUUIDs = [];

const doAnalyzeResult = async (imgBlobUrl, x, y, angle, squareWidth, squareHeight) => {
  const blobImgSize = await new Promise<{ width: number, height: number }>((resolve) => {
    const img = new Image();
    img.src = imgBlobUrl;
    img.onload = () => {
      console.log('Blob size', img.width, img.height);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });

  const {
    offsetX_ideal: offsetXIdeal,
    offsetY_ideal: offsetYIdeal,
    scaleRatio_ideal: scaleRatioIdeal,
  } = Constant.camera;
  const squareSize = Constant.camera.calibrationPicture.size;

  const scaleRatioX = (squareSize * Constant.dpmm) / squareWidth;
  const scaleRatioY = (squareSize * Constant.dpmm) / squareHeight;
  const deviationX = x - blobImgSize.width / 2;
  const deviationY = y - blobImgSize.height / 2;

  const offsetX = -(deviationX * scaleRatioX) / Constant.dpmm + offsetXIdeal;
  const offsetY = -(deviationY * scaleRatioY) / Constant.dpmm + offsetYIdeal;

  if ((scaleRatioX / scaleRatioIdeal < 0.8) || (scaleRatioX / scaleRatioIdeal > 1.2)) {
    return false;
  }
  if ((scaleRatioY / scaleRatioIdeal < 0.8) || (scaleRatioY / scaleRatioIdeal > 1.2)) {
    return false;
  }
  if ((Math.abs(deviationX) > 400) || (Math.abs(deviationY) > 400)) {
    return false;
  }
  if (Math.abs(angle) > (10 * Math.PI) / 180) {
    return false;
  }
  return {
    X: offsetX,
    Y: offsetY,
    R: -angle,
    SX: scaleRatioX,
    SY: scaleRatioY,
  };
};

const doSendPictureTask = async (imgBlobUrl: string) => {
  const d = $.Deferred();
  fetch(imgBlobUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        cameraCalibrationWebSocket.upload(e.target.result)
          .done((resp) => {
            d.resolve(resp);
          })
          .fail((resp) => {
            d.reject(resp.toString());
          });
      };
      fileReader.readAsArrayBuffer(blob);
    })
    .catch((err) => {
      d.reject(err);
    });

  const resp = await d.promise();
  const {
    status, x, y, angle, width, height,
  } = resp;
  let result = null;
  switch (status) {
    case 'ok':
      result = await doAnalyzeResult(imgBlobUrl, x, y, angle, width, height);
      break;
    case 'fail':
    case 'none':
    default:
      break;
  }
  return result;
};

const doGetOffsetFromPicture = async (imgBlobUrl, updateOffsetCb) => {
  let sdata = await doSendPictureTask(imgBlobUrl);
  let hadGotOffsetFromPicture = true;
  if (!sdata) {
    sdata = {
      X: 20,
      Y: 30,
      R: 0,
      SX: 1.625,
      SY: 1.625,
    };
    hadGotOffsetFromPicture = false;
  }
  updateOffsetCb({ currentOffset: sdata });
  return hadGotOffsetFromPicture;
};

interface StepAskReadjustProps {
  device: IDeviceInfo;
  parent: any;
  gotoNextStep: (step: symbol) => void;
  updateImgBlobUrl: (url: string) => void;
  updateOffsetDataCb: (offset: any) => void;
  onClose: (completed?: boolean) => void;
}

const StepAskReadjust = (
  {
    device,
    parent,
    gotoNextStep,
    updateImgBlobUrl,
    updateOffsetDataCb,
    onClose,
  }: StepAskReadjustProps,
) => (
  <Alert
    caption={LANG.camera_calibration}
    message={LANG.ask_for_readjust}
    buttons={
      [{
        label: LANG.cancel,
        className: 'btn-default pull-left',
        onClick: onClose,
      },
      {
        label: LANG.skip,
        className: 'btn-default pull-right primary',
        onClick: async () => {
          try {
            await PreviewModeController.start(device, () => { console.log('camera fail. stop preview mode'); });
            // eslint-disable-next-line no-underscore-dangle
            parent.lastConfig = PreviewModeController._getCameraOffset();
            progress.openNonstopProgress({
              id: 'taking-picture',
              message: LANG.taking_picture,
              timeout: 30000,
            });
            const x = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
            const y = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
            const blobUrl = await PreviewModeController.takePictureAfterMoveTo(x, y);
            cameraPosition = { x, y };
            await doGetOffsetFromPicture(blobUrl, updateOffsetDataCb);
            updateImgBlobUrl(blobUrl);
            gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
          } catch (error) {
            console.log(error);
            alert.popUp({
              id: 'menu-item',
              type: alertConstants.SHOW_POPUP_ERROR,
              message: `#815 ${(error.message || DeviceErrorHandler.translate(error) || 'Fail to cut and capture')}`,
              callbacks: async () => {
                const report = await DeviceMaster.getReport();
                device.st_id = report.st_id;
                await CheckDeviceStatus(device, false, true);
              },
            });
          } finally {
            progress.popById('taking-picture');
          }
        },
      },
      {
        label: LANG.do_engraving,
        className: 'btn-default pull-right',
        onClick: () => gotoNextStep(STEP_PUT_PAPER),
      }]
    }
  />
);

interface StepPutPaperProps {
  gotoNextStep: (step: symbol) => void;
  onClose: (completed?: boolean) => void;
}

const StepPutPaper = (
  { gotoNextStep, onClose }: StepPutPaperProps,
) => {
  const video = (
    <video className="video" autoPlay loop>
      <source src="video/put_paper.webm" type="video/webm" />
    </video>
  );

  return (
    <Alert
      caption={LANG.camera_calibration}
      message={LANG.please_place_paper}
      buttons={
        [{
          label: LANG.next,
          className: 'btn-default pull-right primary',
          onClick: () => gotoNextStep(STEP_REFOCUS),
        },
        {
          label: LANG.cancel,
          className: 'btn-default pull-left',
          onClick: onClose,
        }]
      }
    >
      {video}
    </Alert>
  );
};

interface StepRefocusProps {
  parent: any;
  device: IDeviceInfo;
  model: string,
  gotoNextStep: (step: symbol) => void;
  onClose: (completed?: boolean) => void;
  updateImgBlobUrl: (url: string) => void;
  updateOffsetDataCb: (offset: any) => void;
}

const StepRefocus = ({
  parent, device, model, gotoNextStep, onClose, updateImgBlobUrl, updateOffsetDataCb,
}: StepRefocusProps) => {
  const doCuttingTask = async () => {
    const res = await DeviceMaster.select(device);
    if (!res.success) {
      throw new Error('Fail to select device');
    }
    const laserPower = Number((await DeviceMaster.getLaserPower()).value);
    const fanSpeed = Number((await DeviceMaster.getFan()).value);
    parent.origFanSpeed = fanSpeed;
    const vc = VersionChecker(device.version);
    const tempCmdAvailable = vc.meetRequirement('TEMP_I2C_CMD');
    if (tempCmdAvailable) {
      await DeviceMaster.setFanTemp(100);
    } else if (fanSpeed > 100) {
      await DeviceMaster.setFan(100);
    }
    if (laserPower !== 1) {
      await DeviceMaster.setLaserPower(1);
    }
    await DeviceMaster.runBeamboxCameraTest();
    if (laserPower !== 1) {
      await DeviceMaster.setLaserPower(Number(laserPower));
    }
    if (!tempCmdAvailable) {
      await DeviceMaster.setFan(fanSpeed);
    }
  };
  const doCaptureTask = async () => {
    let blobUrl;
    try {
      await PreviewModeController.start(device, () => console.log('camera fail. stop preview mode'));
      // eslint-disable-next-line no-underscore-dangle
      parent.lastConfig = PreviewModeController._getCameraOffset();
      progress.openNonstopProgress({
        id: 'taking-picture',
        message: LANG.taking_picture,
        timeout: 30000,
      });
      const movementX = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
      const movementY = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
      blobUrl = await PreviewModeController.takePictureAfterMoveTo(movementX, movementY);
      cameraPosition = { x: movementX, y: movementY };
    } finally {
      progress.popById('taking-picture');
    }
    return blobUrl;
  };
  const cutThenCapture = async () => {
    await doCuttingTask();
    const blobUrl = await doCaptureTask();
    await doGetOffsetFromPicture(blobUrl, updateOffsetDataCb);
    updateImgBlobUrl(blobUrl);
  };

  const [isAutoFocus, setIsAutoFocus] = useState(false);
  const [isCutButtonDisabled, setIsCutButtonDisabled] = useState(false);
  const videoElem = useRef(null);
  useEffect(() => {
    if (videoElem.current) {
      videoElem.current.load();
    }
  }, [isAutoFocus]);

  let child = null;
  let message = LANG.please_refocus.beambox;
  if (model === 'beamo') {
    child = (
      <div className="video-container">
        <div className="tab-container">
          <div className={classNames('tab', 'left', { selected: !isAutoFocus })} onClick={() => setIsAutoFocus(false)}>{LANG.without_af}</div>
          <div className={classNames('tab', 'right', { selected: isAutoFocus })} onClick={() => setIsAutoFocus(true)}>{LANG.with_af}</div>
        </div>
        <video className="video" ref={videoElem} autoPlay loop>
          <source src={isAutoFocus ? 'video/autofocus.webm' : 'video/bm_focus.webm'} type="video/webm" />
        </video>
      </div>
    );
    message = isAutoFocus ? LANG.please_refocus.beamo_af : LANG.please_refocus.beamo;
  } else {
    child = (
      <video className="video" ref={videoElem} autoPlay loop>
        <source src="video/bb_focus.webm" type="video/webm" />
      </video>
    );
  }
  return (
    <Alert
      caption={LANG.camera_calibration}
      message={message}
      buttons={
        [{
          label: LANG.start_engrave,
          className: classNames('btn-default pull-right primary', { disabled: isCutButtonDisabled }),
          onClick: async () => {
            if (isCutButtonDisabled) {
              return;
            }
            try {
              setIsCutButtonDisabled(true);
              await cutThenCapture();
              if (!calibratedMachineUUIDs.includes(device.uuid)) {
                calibratedMachineUUIDs.push(device.uuid);
              }
              gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
            } catch (error) {
              setIsCutButtonDisabled(false);
              console.log(error);
              alert.popUp({
                id: 'menu-item',
                type: alertConstants.SHOW_POPUP_ERROR,
                message: `#815 ${(error.message || DeviceErrorHandler.translate(error) || 'Fail to cut and capture')}`,
                callbacks: async () => {
                  const report = await DeviceMaster.getReport();
                  device.st_id = report.st_id;
                  await CheckDeviceStatus(device, false, true);
                },
              });
            }
          },
        },
        {
          label: LANG.cancel,
          className: 'btn-default pull-left',
          onClick: onClose,
        }]
      }
    >
      {child}
    </Alert>
  );
};

const doSetConfigTask = async (device, X, Y, R, SX, SY, borderless) => {
  const parameterName = borderless ? 'camera_offset_borderless' : 'camera_offset';
  const vc = VersionChecker(device.version);
  if (vc.meetRequirement('BEAMBOX_CAMERA_CALIBRATION_XY_RATIO')) {
    await DeviceMaster.setDeviceSetting(parameterName, `Y:${Y} X:${X} R:${R} S:${(SX + SY) / 2} SX:${SX} SY:${SY}`);
  } else {
    await DeviceMaster.setDeviceSetting(parameterName, `Y:${Y} X:${X} R:${R} S:${(SX + SY) / 2}`);
  }
};

const sendPictureThenSetConfig = async (result, device, borderless) => {
  result.X = Math.round(result.X * 10) / 10;
  result.Y = Math.round(result.Y * 10) / 10;
  console.log('Setting camera_offset', borderless ? 'borderless' : '', result);
  if (result) {
    await doSetConfigTask(device, result.X, result.Y, result.R, result.SX, result.SY, borderless);
  } else {
    throw new Error(LANG.analyze_result_fail);
  }
};

interface StepBeforeAnalyzePictureProps {
  currentOffset: { X: number, Y: number, SX: number, SY: number, R: number, },
  updateOffsetDataCb: (offset: any) => void,
  updateImgBlobUrl: (url: string) => void,
  imgBlobUrl: string,
  gotoNextStep: (step: symbol) => void,
  onClose: (completed?: boolean) => void,
  unit: string,
  device: IDeviceInfo,
  parent: any,
}

const StepBeforeAnalyzePicture = ({
  currentOffset,
  updateOffsetDataCb,
  updateImgBlobUrl,
  imgBlobUrl,
  gotoNextStep,
  onClose,
  unit,
  device,
  parent,
}: StepBeforeAnalyzePictureProps) => {
  const [showHint, setShowHint] = useState(false);
  const [showLastConfig, setShowLastConfig] = useState(false);

  useEffect(() => {
    setShowHint(true);
  }, []);

  const renderHintModal = () => {
    const virtualSquare = $('.modal-camera-calibration .virtual-square');
    const position1 = virtualSquare.offset();
    position1.top += virtualSquare.height() + 5;
    const controls = $('.modal-camera-calibration .controls');
    const position2 = controls.offset();
    position2.left += 30;
    position2.top -= 45;
    return (
      <div className="hint-modal-background" onClick={() => setShowHint(false)}>
        <div className="hint-box" style={position1}>
          <div className="arrowup" />
          <div className="hint-body">
            {LANG.hint_red_square}
          </div>
        </div>
        <div className="hint-box" style={position2}>
          <div className="hint-body">
            {LANG.hint_adjust_parameters}
          </div>
          <div className="arrowdown" />
        </div>
      </div>
    );
  };

  const moveAndRetakePicture = async (dir: string) => {
    try {
      progress.openNonstopProgress({
        id: 'taking-picture',
        message: LANG.taking_picture,
        timeout: 30000,
      });
      let { x, y } = cameraPosition;
      switch (dir) {
        case 'up':
          y -= 3;
          break;
        case 'down':
          y += 3;
          break;
        case 'left':
          x -= 3;
          break;
        case 'right':
          x += 3;
          break;
        default:
          break;
      }
      const blobUrl = await PreviewModeController.takePictureAfterMoveTo(x, y);
      console.log(x, y);
      cameraPosition = { x, y };
      updateImgBlobUrl(blobUrl);
    } finally {
      progress.popById('taking-picture');
    }
  };

  const imageScale = 200 / 280;
  const mmToImage = 10 * imageScale;
  const imgBackground = {
    background: `url(${imgBlobUrl})`,
  };

  const calculateSquarePosition = (x: number, y: number, sx: number, sy: number, r: number) => {
    const width = (25 * mmToImage) / sx;
    const height = (25 * mmToImage) / sy;
    const { centerX, centerY } = Constant.camera.calibrationPicture;
    const left = 100 - (width / 2) - ((x - centerX + cameraPosition.x) * mmToImage) / sx;
    const top = 100 - (height / 2) - ((y - centerY + cameraPosition.y) * mmToImage) / sy;
    return {
      width,
      height,
      left,
      top,
      transform: `rotate(${-r * (180 / Math.PI)}deg)`,
    };
  };
  const squareStyle = calculateSquarePosition(
    currentOffset.X,
    currentOffset.Y,
    currentOffset.SX,
    currentOffset.SY,
    currentOffset.R,
  );
  console.log('SquareStyle', squareStyle);
  const lastConfigSquareStyle = calculateSquarePosition(
    parent.lastConfig.x,
    parent.lastConfig.y,
    parent.lastConfig.scaleRatioX,
    parent.lastConfig.scaleRatioY,
    parent.lastConfig.angle,
  );

  const handleValueChange = (key: string, val: number) => {
    console.log('Key', key, '=', val);
    currentOffset[key] = val;
    updateOffsetDataCb({ currentOffset });
  };

  const hintModal = showHint ? renderHintModal() : null;
  const lastConfigSquare = showLastConfig ? <div className="virtual-square last-config" style={lastConfigSquareStyle} /> : null;
  const manualCalibration = (
    <div>
      <div className="img-center" style={imgBackground}>
        <div className="virtual-square" style={squareStyle} />
        {lastConfigSquare}
        <div className="camera-control up" onClick={() => moveAndRetakePicture('up')} />
        <div className="camera-control down" onClick={() => moveAndRetakePicture('down')} />
        <div className="camera-control left" onClick={() => moveAndRetakePicture('left')} />
        <div className="camera-control right" onClick={() => moveAndRetakePicture('right')} />
      </div>
      <div className="hint-icon" onClick={() => setShowHint(true)}>
        ?
      </div>
      <div className="controls">
        <div className="control">
          <label>{LANG.dx}</label>
          <UnitInput
            type="number"
            min={-50}
            max={50}
            unit="mm"
            defaultValue={currentOffset.X - 15}
            getValue={(val) => handleValueChange('X', val + 15)}
            decimal={unit === 'inches' ? 3 : 1}
            step={unit === 'inches' ? 0.005 : 0.1}
            isDoOnInput
          />
        </div>
        <div className="control">
          <label>{LANG.dy}</label>
          <UnitInput
            type="number"
            min={-50}
            max={50}
            unit="mm"
            defaultValue={currentOffset.Y - 30}
            getValue={(val) => handleValueChange('Y', val + 30)}
            decimal={unit === 'inches' ? 3 : 1}
            step={unit === 'inches' ? 0.005 : 0.1}
            isDoOnInput
          />
        </div>
        <div className="control">
          <label>{LANG.rotation_angle}</label>
          <UnitInput
            type="number"
            min={-180}
            max={180}
            unit="deg"
            defaultValue={currentOffset.R * (180 / Math.PI)}
            getValue={(val) => handleValueChange('R', val * (Math.PI / 180))}
            decimal={1}
            step={0.1}
            isDoOnInput
          />
        </div>
        <div className="control">
          <label>{LANG.x_ratio}</label>
          <UnitInput
            type="number"
            min={10}
            max={200}
            unit="%"
            defaultValue={(3.25 - currentOffset.SX) * (100 / 1.625)}
            getValue={(val) => handleValueChange('SX', (200 - val) * (1.625 / 100))}
            decimal={1}
            step={0.5}
            isDoOnInput
          />
        </div>
        <div className="control">
          <label>{LANG.y_ratio}</label>
          <UnitInput
            type="number"
            min={10}
            max={200}
            unit="%"
            defaultValue={(3.25 - currentOffset.SY) * (100 / 1.625)}
            getValue={(val) => handleValueChange('SY', (200 - val) * (1.625 / 100))}
            decimal={1}
            step={0.5}
            isDoOnInput
          />
        </div>
        <div className="checkbox-container" onClick={() => setShowLastConfig(!showLastConfig)}>
          <input type="checkbox" checked={showLastConfig} onChange={() => { }} />
          <div className="title">{LANG.show_last_config}</div>
        </div>
      </div>
      {hintModal}
    </div>
  );

  return (
    <Alert
      caption={LANG.camera_calibration}
      message={manualCalibration}
      buttons={
        [{
          label: LANG.next,
          className: 'btn-default btn-right primary',
          onClick: async () => {
            try {
              await PreviewModeController.end();
              await sendPictureThenSetConfig(currentOffset, device, parent.props.borderless);
              gotoNextStep(STEP_FINISH);
            } catch (error) {
              console.log(error);
              alert.popUp({
                id: 'menu-item',
                type: alertConstants.SHOW_POPUP_ERROR,
                message: `#816 ${error.toString().replace('Error: ', '')}`,
                callbacks: () => gotoNextStep(STEP_REFOCUS),
              });
            }
          },
        },
        {
          label: LANG.back,
          className: 'btn-default btn-right',
          onClick: async () => {
            await PreviewModeController.end();
            gotoNextStep(STEP_REFOCUS);
          },
        },
        {
          label: LANG.cancel,
          className: 'btn-default pull-left',
          onClick: onClose,
        }]
      }
    />
  );
};

interface StepFinishProps {
  parent: any,
  onClose: (completed?: boolean) => void,
}

const StepFinish = ({ parent, onClose }: StepFinishProps) => (
  <Alert
    caption={LANG.camera_calibration}
    message={LANG.calibrate_done}
    buttons={
      [{
        label: LANG.finish,
        className: 'btn-default pull-right primary',
        onClick: () => {
          BeamboxPreference.write('should_remind_calibrate_camera', false);
          svgCanvas.toggleBorderless(parent.props.borderless);
          onClose(true);
        },
      }]
    }
  />
);

interface Props {
  device: IDeviceInfo;
  borderless: boolean;
  onClose: (completed: boolean) => void;
}

interface State {
  currentStep: symbol;
  currentOffset: {
    X: number;
    Y: number;
    R: number;
    SX: number;
    SY: number;
  };
  imgBlobUrl: string;
}

class CameraCalibrationComponent extends React.Component<Props, State> {
  private unit: string;

  origFanSpeed: number;

  constructor(props: Props) {
    super(props);
    const didCalibrate = calibratedMachineUUIDs.includes(props.device.uuid);

    this.state = {
      currentStep: didCalibrate ? STEP_ASK_READJUST : STEP_PUT_PAPER,
      currentOffset: {
        X: 15, Y: 30, R: 0, SX: 1.625, SY: 1.625,
      },
      imgBlobUrl: '',
    };
    this.unit = Config().read('default-units') as string || 'mm';
    this.updateCurrentStep = this.updateCurrentStep.bind(this);
    this.onClose = this.onClose.bind(this);
    this.updateImgBlobUrl = this.updateImgBlobUrl.bind(this);
  }

  updateCurrentStep(nextStep: symbol): void {
    this.setState({
      currentStep: nextStep,
    });
  }

  async onClose(completed?: boolean): Promise<void> {
    const { onClose } = this.props;
    onClose(completed);
    await PreviewModeController.end();
    if (this.origFanSpeed) {
      await DeviceMaster.setFan(this.origFanSpeed);
    }
  }

  updateImgBlobUrl(val: string): void {
    const { imgBlobUrl } = this.state;
    URL.revokeObjectURL(imgBlobUrl);
    this.setState({
      imgBlobUrl: val,
    });
  }

  updateOffsetData = (data: State): void => {
    this.setState(data);
  };

  render(): JSX.Element {
    const { device } = this.props;
    const model = device.model === 'fbm1' ? 'beamo' : 'beambox';
    const { currentStep, currentOffset, imgBlobUrl } = this.state;
    let currentStepComponent = null;
    if (currentStep === STEP_ASK_READJUST) {
      currentStepComponent = (
        <StepAskReadjust
          device={device}
          parent={this}
          updateImgBlobUrl={this.updateImgBlobUrl}
          updateOffsetDataCb={this.updateOffsetData}
          gotoNextStep={this.updateCurrentStep}
          onClose={this.onClose}
        />
      );
    } else if (currentStep === STEP_PUT_PAPER) {
      currentStepComponent = (
        <StepPutPaper
          gotoNextStep={this.updateCurrentStep}
          onClose={this.onClose}
        />
      );
    } else if (currentStep === STEP_REFOCUS) {
      currentStepComponent = (
        <StepRefocus
          parent={this}
          device={device}
          model={model}
          gotoNextStep={this.updateCurrentStep}
          onClose={this.onClose}
          updateImgBlobUrl={this.updateImgBlobUrl}
          updateOffsetDataCb={this.updateOffsetData}
        />
      );
    } else if (currentStep === STEP_BEFORE_ANALYZE_PICTURE) {
      currentStepComponent = (
        <StepBeforeAnalyzePicture
          currentOffset={currentOffset}
          gotoNextStep={this.updateCurrentStep}
          onClose={this.onClose}
          imgBlobUrl={imgBlobUrl}
          updateImgBlobUrl={this.updateImgBlobUrl}
          updateOffsetDataCb={this.updateOffsetData}
          device={device}
          unit={this.unit}
          parent={this}
        />
      );
    } else if (currentStep === STEP_FINISH) {
      currentStepComponent = (
        <StepFinish
          parent={this}
          onClose={this.onClose}
        />
      );
    }
    return (
      <div className="always-top">
        <Modal className={{ 'modal-camera-calibration': true }} content={currentStepComponent} disabledEscapeOnBackground={false} />
      </div>
    );
  }
}

export default CameraCalibrationComponent;

// Not putting this in dialog-caller to avoid circular import because DeviceMaster imports dialog
export const showCameraCalibration = (
  device: IDeviceInfo, isBorderless: boolean,
): Promise<boolean> | boolean => {
  if (dialog.isIdExist('camera-cali')) return false;
  return new Promise<boolean>((resolve) => {
    console.log(device);
    dialog.addDialogComponent('camera-cali',
      <CameraCalibrationComponent
        device={device}
        borderless={isBorderless}
        onClose={(completed = false) => {
          dialog.popDialogById('camera-cali');
          resolve(completed);
        }}
      />);
  });
};
