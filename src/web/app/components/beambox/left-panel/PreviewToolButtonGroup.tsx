import * as React from 'react';
import classNames from 'classnames';

import beamboxStore from 'app/stores/beambox-store';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import useForceUpdate from 'helpers/use-force-update';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.left_panel;

interface Props {
  id: string;
  className: string;
  title: string;
  iconName: string;
  onClick: () => void;
}

const PreviewToolButton = ({ id, className, title, iconName, onClick }: Props) => (
  <div id={id} className={className} title={title} onClick={onClick}>
    <img src={`img/left-bar/icon-${iconName}.svg`} draggable="false" />
  </div>
);

const PreviewToolButtonGroup = ({
  className,
  endPreviewMode,
  setShouldStartPreviewController,
}: {
  className: string;
  endPreviewMode: () => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
}): JSX.Element => {
  const renderToolButton = (
    iconName: string,
    id: string,
    label: string,
    onClick: () => void,
    active = false,
    disabled = false
  ) => (
    <PreviewToolButton
      id={`left-${id}`}
      className={classNames('tool-btn', { active, disabled })}
      title={label}
      iconName={iconName}
      onClick={disabled ? () => {} : onClick}
    />
  );
  const forceUpdate = useForceUpdate();

  const startImageTrace = () => {
    endPreviewMode();
    svgCanvas.clearSelection();
    beamboxStore.emitShowCropper();
    $('#left-Cursor').addClass('active');
  };

  const clearPreview = () => {
    if (!PreviewModeBackgroundDrawer.isClean()) {
      PreviewModeBackgroundDrawer.resetCoordinates();
      PreviewModeBackgroundDrawer.clear();
    }
    $('#left-Shoot').addClass('active');
  };

  const disabled = PreviewModeController.isDrawing || PreviewModeBackgroundDrawer.isClean();
  const isLiveMode = PreviewModeController.isLiveModeOn();
  console.log(isLiveMode);
  return (
    <div className={className}>
      {renderToolButton('back', 'Exit-Preview', LANG.label.end_preview, endPreviewMode)}
      {renderToolButton(
        'shoot',
        'Shoot',
        LANG.label.preview,
        () => {
          if (!PreviewModeController.isPreviewMode()) {
            setShouldStartPreviewController(true);
          }
        },
        true
      )}
      {isDev() &&
        renderToolButton(
          'oval',
          'Live',
          'Live',
          () => {
            if (PreviewModeController.isPreviewMode()) {
              PreviewModeController.toggleFullWorkareaLiveMode();
              forceUpdate();
            }
          },
          isLiveMode
        )}
      {renderToolButton('trace', 'Trace', LANG.label.trace, startImageTrace, false, disabled)}
      {renderToolButton('trash', 'Trash', LANG.label.clear_preview, clearPreview, false, disabled)}
    </div>
  );
};

export default PreviewToolButtonGroup;
