import React, { useContext, useEffect, useRef } from 'react';

import constant from 'app/actions/beambox/constant';
import ZoomBlock from 'app/components/beambox/ZoomBlock';

import canvasManager from './canvasManager';
import styles from './PassThrough.module.scss';
import { PassThroughContext } from './PassThroughContext';

const Canvas = (): JSX.Element => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { passThroughHeight, guideMark } = useContext(PassThroughContext);

  useEffect(() => {
    if (canvasRef.current) {
      canvasManager.render(canvasRef.current);
    }
    return () => {
      canvasManager.clear();
    };
  }, []);

  useEffect(() => {
    canvasManager.setPassThroughHeight(passThroughHeight * constant.dpmm);
  }, [passThroughHeight]);
  useEffect(() => {
    canvasManager.setGuideMark(
      guideMark.show,
      guideMark.x * constant.dpmm,
      guideMark.width * constant.dpmm
    );
  }, [guideMark]);

  return (
    <div className={styles.container}>
      <div className={styles.canvas} ref={canvasRef} />
      <ZoomBlock
        className={styles['zoom-block']}
        getZoom={() => canvasManager.zoomRatio * constant.dpmm}
        setZoom={(ratio) => canvasManager.zoom(ratio / constant.dpmm)}
        resetView={canvasManager.resetView}
      />
    </div>
  );
};

export default Canvas;
