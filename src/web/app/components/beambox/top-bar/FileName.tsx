import React from 'react';

import ISVGCanvas from 'interfaces/ISVGCanvas';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './FileName.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  fileName: string;
  hasUnsavedChange: boolean;
  isTitle?: boolean;
}

function FileName({ fileName, hasUnsavedChange, isTitle = false }: Props): JSX.Element {
  const lang = useI18n().topbar;
  const isCloudFile = svgCanvas?.currentFilePath?.startsWith('cloud:');
  return (
    <div className={isTitle ? styles.title : styles['file-name']}>
      {isCloudFile && <TopBarIcons.CloudFile />}
      {(fileName || lang.untitled) + (hasUnsavedChange ? '*' : '')}
    </div>
  );
}

export default FileName;
