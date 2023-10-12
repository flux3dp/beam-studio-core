import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import Constant, { WorkAreaModel } from 'app/actions/beambox/constant';
import diodeBoundaryDrawer from 'app/actions/beambox/diode-boundary-drawer';
import i18n from 'helpers/i18n';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';

const LANG = i18n.lang;
let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const showResizeAlert = (device: IDeviceInfo): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.popUp({
      message: sprintf(LANG.beambox.popup.change_workarea_before_preview, device.name),
      buttonType: AlertConstants.YES_NO,
      onYes: () => {
        BeamboxPreference.write('workarea', device.model);
        BeamboxPreference.write('model', device.model);
        const width = Constant.dimension.getWidth(device.model as WorkAreaModel);
        const height = Constant.dimension.getHeight(device.model as WorkAreaModel);
        svgCanvas.setResolution(width, height);
        svgEditor.resetView();
        toggleFullColorAfterWorkareaChange();
        PreviewModeBackgroundDrawer.updateCanvasSize();
        diodeBoundaryDrawer.updateCanvasSize();
        beamboxStore.emitUpdateWorkArea();
        OpenBottomBoundaryDrawer.update();
        resolve(true);
      },
      onNo: () => resolve(false),
    });
  });

export default showResizeAlert;
