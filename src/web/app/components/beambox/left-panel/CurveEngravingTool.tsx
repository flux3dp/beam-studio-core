import React, { useContext, useEffect, useMemo } from 'react';

import curveEngravingModeController from 'app/actions/canvas/curveEngravingModeController';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LeftPanelButton from 'app/components/beambox/left-panel/LeftPanelButton';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  className: string;
}

const CurveEngravingTool = ({ className }: Props): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const canvasEventEmitter = useMemo(() => eventEmitterFactory.createEventEmitter('canvas'), []);
  useEffect(() => {
    canvasEventEmitter.on('CURVE_ENGRAVING_AREA_SET', forceUpdate);
    return () => {
      canvasEventEmitter.removeListener('CURVE_ENGRAVING_AREA_SET', forceUpdate);
    };
  }, [canvasEventEmitter, forceUpdate]);

  const lang = useI18n().beambox.left_panel;
  const currentCursorMode = svgCanvas.getMode();

  // TODO: add i18n
  return (
    <div className={className}>
      <LeftPanelButton
        id="back"
        icon={<LeftPanelIcons.Back />}
        title={'tExit'}
        onClick={() => curveEngravingModeController.backToPreview()}
      />
      <LeftPanelButton
        id="cursor"
        icon={<LeftPanelIcons.Cursor />}
        title={lang.label.cursor}
        active={currentCursorMode === 'select'}
        onClick={() => {
          curveEngravingModeController.toCanvasSelectMode();
          forceUpdate();
        }}
      />
      <LeftPanelButton
        id="curve-select"
        icon={<LeftPanelIcons.CurveSelect />}
        title={'tCurve Area Select'}
        active={currentCursorMode === 'curve-engraving'}
        onClick={() => {
          curveEngravingModeController.toAreaSelectMode();
          forceUpdate();
        }}
      />
      <LeftPanelButton
        id="curve-preview"
        icon={<LeftPanelIcons.CuverPreview />}
        title={'Preview Selected Area'}
        disabled={!curveEngravingModeController.hasArea()}
        onClick={() => curveEngravingModeController.preview()}
      />
      <LeftPanelButton
        id="delete"
        icon={<LeftPanelIcons.Delete />}
        title={'tDelete'}
        onClick={() => curveEngravingModeController.clearArea()}
      />
    </div>
  );
};

export default CurveEngravingTool;
