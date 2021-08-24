import React from 'react';

import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

const LANG = i18n.lang.topbar;

interface Props {
  isWeb: boolean;
  isPreviewing: boolean;
}

function CommonTools({ isWeb, isPreviewing }: Props): JSX.Element {
  if (!isWeb || isPreviewing) return null;
  return (
    <div
      className="common-tools-container"
    >
      <img
        src="img/left-bar/icon-cursor.svg"
        draggable="false"
        title={LANG.menu.undo}
        onClick={() => svgEditor.clickUndo()}
      />
      <img
        src="img/left-bar/icon-cursor.svg"
        draggable="false"
        title={LANG.menu.redo}
        onClick={() => svgEditor.clickRedo()}
        style={{
          transform: 'scaleX(-1)',
        }}
      />
      <img
        src="img/left-bar/icon-trash.svg"
        draggable="false"
        title={LANG.menu.delete}
        onClick={() => svgEditor.deleteSelected()}
      />
    </div>
  );
}

export default CommonTools;
