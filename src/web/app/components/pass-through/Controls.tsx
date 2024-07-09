import classNames from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';

import browser from 'implementations/browser';
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
    guideMark,
    setGuideMark,
  } = useContext(PassThroughContext);

  const { max, min } = useMemo(
    () => ({
      max: workareaObj.passThroughMaxHeight ?? workareaObj.height,
      min: 120,
    }),
    [workareaObj]
  );
  const handleWorkareaHeightChange = useCallback((val) => {
    setPassThroughHeight(Math.max(min, Math.min(val, max)));
  }, [max, min, setPassThroughHeight]);

  const { show, x: guideMarkX, width: guideMarkWidth } = guideMark;
  const setX = useCallback(
    (val) => {
      setGuideMark((cur) => ({
        ...cur,
        x: Math.max(0, Math.min(val, workareaObj.width - cur.width)),
      }));
    },
    [workareaObj, setGuideMark]
  );
  const setWidth = useCallback(
    (val) => {
      setGuideMark((cur) => ({
        ...cur,
        width: Math.max(0, Math.min(val, workareaObj.width - cur.x)),
      }));
    },
    [workareaObj, setGuideMark]
  );

  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const objectSize = useMemo(() => {
    const svgcontent = document.getElementById('svgcontent') as unknown as SVGSVGElement;
    if (!svgcontent) return { width: 0, height: 0 };
    const bbox = svgcontent.getBBox();
    let { height } = bbox;
    if (bbox.y + height > workareaManager.height) height = workareaManager.height - bbox.y;
    if (bbox.y < 0) height += bbox.y;
    return {
      width: Math.round((bbox.width / constant.dpmm / (isInch ? 25.4 : 1)) * 100) / 100,
      height: Math.round((height / constant.dpmm / (isInch ? 25.4 : 1)) * 100) / 100,
    };
  }, [isInch]);
  return (
    <div className={styles.controls}>
      <div className={styles.link} onClick={() => browser.open(lang.help_link)}>
        {lang.help_text}
      </div>
      <div className={styles.size}>
        <div>
          {lang.object_length}
          <span className={styles.bold}>
            {objectSize.height} {isInch ? 'in' : 'mm'}
          </span>
        </div>
        <div>
          {lang.workarea_height}
          <div>
            <div className={styles['input-container']}>
              <UnitInput
                className={styles.input}
                value={passThroughHeight}
                onChange={handleWorkareaHeightChange}
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
            <div className={styles.hint}>
              {isInch
                ? `${(min / 25.4).toFixed(2)}' ~ ${(max / 25.4).toFixed(2)}'`
                : `${min}mm ~ ${max}mm`}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.options}>
        <div className={styles.row}>
          <div className={classNames(styles.cell, styles.title)}>{lang.ref_layer}</div>
          <div className={styles.cell}>
            <Switch
              disabled={objectSize.width === 0 || objectSize.height === 0}
              checked={referenceLayer}
              onChange={() => setReferenceLayer((val) => !val)}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={classNames(styles.cell, styles.title)}>{lang.guide_mark}</div>
          <div className={styles.cell}>
            <Switch
              disabled={objectSize.width === 0 || objectSize.height === 0}
              checked={show}
              onChange={(val) => setGuideMark((cur) => ({ ...cur, show: val }))}
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
                  value={guideMarkWidth}
                  onChange={setWidth}
                  max={workareaObj.width - guideMarkX}
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
                  value={guideMarkX}
                  onChange={setX}
                  max={workareaObj.width - guideMarkWidth}
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
        <div>1. {lang.ref_layer_desc}</div>
        <br />
        <div>2. {lang.guide_mark_desc}</div>
      </div>
    </div>
  );
};

export default Controls;
