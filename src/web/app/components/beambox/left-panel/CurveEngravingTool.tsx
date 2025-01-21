import React from 'react';

import curveEngravingModeController from 'app/actions/canvas/curveEngravingModeController';
import LeftPanelButton from 'app/components/beambox/left-panel/LeftPanelButton';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import useForceUpdate from 'helpers/use-force-update';
import useHasCurveEngraving from 'helpers/hooks/useHasCurveEngraving';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  className: string;
}

// TODO add unit tests
const CurveEngravingTool = ({ className }: Props): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const hasCurveEngraving = useHasCurveEngraving();

  const lang = useI18n().beambox.left_panel.label;
  const currentCursorMode = svgCanvas.getMode();

  // TODO: add i18n
  return (
    <div className={className}>
      <LeftPanelButton
        id="back"
        icon={<LeftPanelIcons.Back />}
        title={lang.curve_engraving.exit}
        onClick={() => curveEngravingModeController.back()}
      />
      <LeftPanelButton
        id="cursor"
        icon={<LeftPanelIcons.Cursor />}
        title={lang.cursor}
        active={currentCursorMode === 'select'}
        onClick={() => {
          curveEngravingModeController.toCanvasSelectMode();
          forceUpdate();
        }}
      />
      <LeftPanelButton
        id="curve-select"
        icon={<LeftPanelIcons.CurveSelect />}
        title={lang.curve_engraving.select_area}
        active={currentCursorMode === 'curve-engraving'}
        onClick={() => {
          curveEngravingModeController.toAreaSelectMode();
          forceUpdate();
        }}
      />
      <LeftPanelButton
        id="curve-preview"
        icon={<LeftPanelIcons.CuverPreview />}
        title={lang.curve_engraving.preview_3d_curve}
        disabled={!hasCurveEngraving}
        onClick={() => curveEngravingModeController.preview()}
      />
      <LeftPanelButton
        id="delete"
        icon={<LeftPanelIcons.Delete />}
        title={lang.curve_engraving.clear_area}
        onClick={() => curveEngravingModeController.clearArea()}
      />
    </div>
  );
};

export default CurveEngravingTool;
