import Konva from 'konva';
import React, { Dispatch, MutableRefObject, SetStateAction, useCallback, useMemo } from 'react';
import { Button, Flex } from 'antd';

import constant from 'app/actions/beambox/constant';
import round from 'helpers/math/round';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { AutoFitContour } from 'interfaces/IAutoFit';

import styles from './Controls.module.scss';
import { ImageDimension } from './type';

interface Props {
  imageRef: MutableRefObject<Konva.Image>;
  contour: AutoFitContour;
  initDimension: ImageDimension;
  dimension: ImageDimension;
  setDimension: Dispatch<SetStateAction<ImageDimension>>;
}

const Controls = ({
  imageRef,
  contour,
  initDimension,
  dimension,
  setDimension,
}: Props): JSX.Element => {
  const { auto_fit: t } = useI18n();
  const { dpmm } = constant;
  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const initialCenter = useMemo(() => {
    const { x, y, width, height } = initDimension;
    return { x: x + width / 2, y: y + height / 2 };
  }, [initDimension]);

  const handleResetPosition = useCallback(() => {
    if (imageRef.current) {
      const { x, y, width, height, rotation } = initDimension;
      const image = imageRef.current;
      image.position({ x, y });
      image.width(width);
      image.height(height);
      image.rotation(rotation);
      setDimension({ ...initDimension });
    }
  }, [imageRef, initDimension, setDimension]);

  const { x, y, width, height, rotation } = dimension;
  const rad = (rotation * Math.PI) / 180;
  const { centerX, centerY } = useMemo(
    () => ({
      centerX: x + (width / 2) * Math.cos(rad) - (height / 2) * Math.sin(rad),
      centerY: y + (width / 2) * Math.sin(rad) + (height / 2) * Math.cos(rad),
    }),
    [x, y, width, height, rad]
  );
  const getSizeStr = useCallback(
    (w: number, h: number) => {
      const getDisplayValue = (val: number) => round(val / dpmm / (isInch ? 25.4 : 1), 2);
      return `${getDisplayValue(w)} x ${getDisplayValue(h)} ${isInch ? 'in' : 'mm'}`;
    },
    [dpmm, isInch]
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t.position_artwork}:</div>
      <ol className={styles.steps}>
        <li>{t.position_step1}</li>
        <li>{t.position_step2}</li>
      </ol>
      <div className={styles.controls}>
        <Flex justify="space-between" align="center">
          <div>{t.offset_x}:</div>
          <UnitInput
            className={styles.input}
            size="small"
            isInch={isInch}
            value={(centerX - initialCenter.x) / dpmm}
            onChange={(val) => {
              const targetCenterX = val * dpmm + initialCenter.x;
              const targetX =
                targetCenterX - (width / 2) * Math.cos(rad) + (height / 2) * Math.sin(rad);
              imageRef.current?.x(targetX);
              setDimension((prev) => ({ ...prev, x: targetX }));
            }}
            step={isInch ? 2.54 : 1}
            addonAfter={isInch ? 'in' : 'mm'}
            precision={isInch ? 4 : 2}
          />
        </Flex>
        <Flex justify="space-between" align="center">
          <div>{t.offset_y}:</div>
          <UnitInput
            className={styles.input}
            size="small"
            isInch={isInch}
            value={(centerY - initialCenter.y) / dpmm}
            onChange={(val) => {
              const targetCenterY = val * dpmm + initialCenter.y;
              const targetY =
                targetCenterY - (width / 2) * Math.sin(rad) - (height / 2) * Math.cos(rad);
              imageRef.current?.y(targetY);
              setDimension((prev) => ({ ...prev, y: targetY }));
            }}
            step={isInch ? 2.54 : 1}
            addonAfter={isInch ? 'in' : 'mm'}
            precision={isInch ? 4 : 2}
          />
        </Flex>
        <Flex justify="space-between" align="center">
          <div>{t.rotation}:</div>
          <UnitInput
            className={styles.input}
            size="small"
            value={dimension.rotation}
            onChange={(val) => {
              const newRad = (val * Math.PI) / 180;
              const newX =
                centerX - (width / 2) * Math.cos(newRad) + (height / 2) * Math.sin(newRad);
              const newY =
                centerY - (width / 2) * Math.sin(newRad) - (height / 2) * Math.cos(newRad);
              imageRef.current?.rotation(val);
              imageRef.current?.x(newX);
              imageRef.current?.y(newY);
              setDimension((prev) => ({ ...prev, rotation: val, x: newX, y: newY }));
            }}
            addonAfter="deg"
            precision={0}
          />
        </Flex>
      </div>
      <Button className={styles.reset} onClick={handleResetPosition}>
        {t.reset_position}
      </Button>
      <div className={styles.info}>
        <div>
          {t.artwork_size}: {getSizeStr(width, height)}
        </div>
        <div>
          {t.pattern_size}: {getSizeStr(contour.bbox[2], contour.bbox[3])}
        </div>
      </div>
    </div>
  );
};

export default Controls;
