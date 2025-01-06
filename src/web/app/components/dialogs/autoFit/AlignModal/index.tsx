import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Layer, Path, Stage } from 'react-konva';
import { Button, Modal } from 'antd';

import useI18n from 'helpers/useI18n';
import { AutoFitContour } from 'interfaces/IAutoFit';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';

import styles from './index.module.scss';

interface Props {
  contour: AutoFitContour;
  element: SVGElement;
  onClose?: () => void;
}

const AlignModal = ({ contour, element, onClose }: Props) => {
  const { auto_fit: t, global: tGlobal } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  useEffect(() => {
    const observer = new ResizeObserver((elements) => {
      const stage = stageRef.current;
      if (!stage) return;

      elements.forEach(({ contentRect: { width, height } }) => {
        stage.width(width);
        stage.height(height);
        stage.batchDraw();
      });
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const pathD = useMemo(() => {
    const { contour: contourPoints, bbox } = contour;
    return contourPoints
      .map(([x, y], k) => {
        const pointStr = `${x - bbox[0]},${y - bbox[1]}`;
        if (k === 0) return `M${pointStr}`;
        if (k === contourPoints.length - 1) return `${pointStr} z`;
        return `${pointStr}`;
      })
      .join(' L');
  }, [contour]);
  console.log(pathD);

  const zoomToFitContour = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let stageWidth = stage.width();
    let stageHeight = stage.height();
    if (!stageWidth || !stageHeight) {
      stageWidth = containerRef.current?.clientWidth || 0;
      stageHeight = containerRef.current?.clientHeight || 0;
    }
    if (!stageWidth || !stageHeight) return;
    const { bbox } = contour;
    const [, , width, height] = bbox;
    const scale = Math.min(stageWidth / width, stageHeight / height) * 0.8;
    stage.position({ x: (stageWidth - width * scale) / 2, y: (stageHeight - height * scale) / 2 });
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }, [contour]);
  useEffect(() => zoomToFitContour(), [zoomToFitContour]);

  return (
    <Modal width={660} open centered maskClosable={false} title={t.title} onCancel={onClose}>
      <div className={styles.container}>
        <div className={styles.controls}>
          Position Artwork:
          <Button onClick={zoomToFitContour}>reset</Button>
        </div>
        <div className={styles.canvas}>
          <div ref={containerRef} className={styles['konva-container']}>
            <Stage ref={stageRef}>
              <Layer ref={layerRef}>
                {/* <Line points={pathPoints} stroke="#9babba" fill="#ffffff" /> */}
                <Path data={pathD} stroke="#9babba" fill="#ffffff" />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const showAlignModal = (element: SVGElement, contour: AutoFitContour): void => {
  const dialogId = 'auto-fit-align';
  if (!isIdExist(dialogId)) {
    addDialogComponent(
      dialogId,
      <AlignModal onClose={() => popDialogById(dialogId)} element={element} contour={contour} />
    );
  }
};

export default AlignModal;
