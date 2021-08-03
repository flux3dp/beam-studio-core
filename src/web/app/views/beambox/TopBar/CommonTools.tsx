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
      style={{
        position: 'absolute',
        marginLeft: '150px',
      }}
    >
      <div style={{
        cursor: 'pointer',
      }}
      >
        <img
          src="img/left-bar/icon-Cursor.svg"
          draggable="false"
          title={LANG.menu.undo}
          onClick={() => svgEditor.clickUndo()}
        />
        <img
          src="img/left-bar/icon-Cursor.svg"
          draggable="false"
          title={LANG.menu.redo}
          onClick={() => svgEditor.clickRedo()}
          style={{
            transform: 'rotate(90deg)',
          }}
        />
      </div>
    </div>
  );
}

export default CommonTools;
