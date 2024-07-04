import classNames from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';

import constant from 'app/actions/beambox/constant';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import workareaManager from 'app/svgedit/workarea';

import styles from './PassThrough.module.scss';
import { PassThroughContext } from './PassThroughContext';

const Controls = (): JSX.Element => {
  const lang = useI18n().pass_through;

  const {
    workareaObj,
    passThroughHeight,
    setPassThroughHeight,
    referenceLayer,
    setReferenceLayer,
    guideLine,
    setGuideLine,
  } = useContext(PassThroughContext);

  const { max, min } = useMemo(
    () => ({
      max: workareaObj.passThroughMaxHeight ?? workareaObj.height,
      min: 120,
    }),
    [workareaObj]
  );

  const { show, x: guideLineX, width: guideLineWidth } = guideLine;
  const setX = useCallback(
    (val) => {
      setGuideLine((cur) => ({
        ...cur,
        x: Math.max(0, Math.min(val, workareaObj.width - cur.width)),
      }));
    },
    [workareaObj, setGuideLine]
  );
  const setWidth = useCallback(
    (val) => {
      setGuideLine((cur) => ({
        ...cur,
        width: Math.max(0, Math.min(val, workareaObj.width - cur.x)),
      }));
    },
    [workareaObj, setGuideLine]
  );

  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const objectHeight = useMemo(() => {
    const svgcontent = document.getElementById('svgcontent') as unknown as SVGSVGElement;
    if (!svgcontent) return 0;
    const bbox = svgcontent.getBBox();
    let { height } = bbox;
    if (bbox.y + height > workareaManager.height) height = workareaManager.height - bbox.y;
    if (bbox.y < 0) height += bbox.y;
    return Math.round((height / constant.dpmm / (isInch ? 25.4 : 1)) * 100) / 100;
  }, [isInch]);
  return (
    <div className={styles.controls}>
      <div className={styles.link}>{lang.help_text}</div>
      <div className={styles.size}>
        <div>
          {lang.object_length}
          <span className={styles.bold}>
            {objectHeight} {isInch ? 'in' : 'mm'}
          </span>
        </div>
        <div>
          {lang.workaea_height}
          <UnitInput
            className={styles.input}
            value={passThroughHeight}
            onChange={(val) => setPassThroughHeight(val)}
            max={max}
            min={min}
            addonAfter={isInch ? 'in' : 'mm'}
            isInch={isInch}
            controls={false}
          />
          <Tooltip title={lang.height_desc}>
            <QuestionCircleOutlined className={styles.hint} />
          </Tooltip>
        </div>
      </div>
      <div className={styles.options}>
        <div className={styles.row}>
          <div className={classNames(styles.cell, styles.title)}>{lang.ref_layer}</div>
          <div className={styles.cell}>
            <Switch checked={referenceLayer} onChange={() => setReferenceLayer((val) => !val)} />
            <Tooltip title={lang.ref_layer_desc}>
              <QuestionCircleOutlined className={styles.hint} />
            </Tooltip>
          </div>
        </div>
        <div className={styles.row}>
          <div className={classNames(styles.cell, styles.title)}>{lang.guide_mark}</div>
          <div className={styles.cell}>
            <Switch
              checked={show}
              onChange={(val) => setGuideLine((cur) => ({ ...cur, show: val }))}
            />
          </div>
        </div>
        {show && (
          <>
            <div className={styles.row}>
              <div className={classNames(styles.cell, styles.title)}>{lang.guide_mark_length}</div>
              <div className={styles.cell}>
                <UnitInput
                  className={styles.input}
                  value={guideLineWidth}
                  onChange={setWidth}
                  max={workareaObj.width - guideLineX}
                  min={0}
                  addonAfter={isInch ? 'in' : 'mm'}
                  isInch={isInch}
                  controls={false}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={classNames(styles.cell, styles.title)}>{lang.guide_mark_x}</div>
              <div className={styles.cell}>
                <UnitInput
                  className={styles.input}
                  value={guideLineX}
                  onChange={setX}
                  max={workareaObj.width - guideLineWidth}
                  min={0}
                  addonAfter={isInch ? 'in' : 'mm'}
                  isInch={isInch}
                  controls={false}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.hint}>
        {lang.guide_mark_desc}
      </div>
    </div>
  );
};

export default Controls;
