import classNames from 'classnames';
import React, { useContext } from 'react';

import { getAllLayerNames, getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { SettingOutlined } from '@ant-design/icons';
import { useIsMobile } from 'helpers/system-helper';

import styles from './LayerList.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  draggingDestIndex: number | null;
  onLayerClick: (e: React.MouseEvent, layerName: string) => void;
  highlightLayer: (layerName?: string) => void;
  onLayerDragStart: (layerName: string, e: React.DragEvent) => void;
  onlayerDragEnd: (e: React.DragEvent) => void;
  onLayerTouchStart: (layerName: string, e: React.TouchEvent) => void;
  onLayerTouchMove: (e: React.TouchEvent) => void;
  onLayerTouchEnd: (e: React.TouchEvent) => void;
  onSensorAreaDragEnter: (index: number) => void;
  onLayerCenterDragEnter: (layerName: string) => void;
  onLayerDoubleClick: () => void;
  openLayerColorPanel: (e: React.MouseEvent, layerName: string) => void;
  setLayerVisibility: (layerName: string) => void;
  unLockLayers: (layerName: string) => void;
  openLayerSettings: (e: React.MouseEvent, layerName: string) => void;
}

const renderDragBar = (): JSX.Element => <div key="drag-bar" className={styles['drag-bar']} />;

const LayerList = ({
  draggingDestIndex,
  onLayerClick,
  highlightLayer,
  onLayerDragStart,
  onlayerDragEnd,
  onLayerTouchStart,
  onLayerTouchMove,
  onLayerTouchEnd,
  onSensorAreaDragEnter,
  onLayerCenterDragEnter,
  onLayerDoubleClick,
  openLayerColorPanel,
  setLayerVisibility,
  unLockLayers,
  openLayerSettings,
}: Props): JSX.Element => {
  const { selectedLayers } = useContext(LayerPanelContext);
  const items: React.ReactNode[] = [];
  const drawing = svgCanvas.getCurrentDrawing();
  const currentLayerName = drawing.getCurrentLayerName();
  const isMobile = useIsMobile();

  const isAnyLayerMissing = drawing.all_layers.some((layer) => {
    // eslint-disable-next-line no-underscore-dangle
    if (!layer.group_.parentNode) return true;
    return false;
  });
  if (isAnyLayerMissing) drawing.identifyLayers();

  const allLayerNames = getAllLayerNames();
  if (draggingDestIndex === allLayerNames.length) items.push(renderDragBar());

  for (let i = allLayerNames.length - 1; i >= 0; i -= 1) {
    const layerName = allLayerNames[i];
    const layer = getLayerElementByName(layerName);
    if (layer) {
      const isLocked = layer.getAttribute('data-lock') === 'true';
      const isSelected = selectedLayers.includes(layerName);
      const isVis = drawing.getLayerVisibility(layerName);
      items.push(
        <div
          data-testid={layerName}
          data-layer={layerName}
          key={layerName}
          className={classNames('layer-item', styles.item, {
            [styles.selected]: isSelected,
            [styles.locked]: isLocked,
            [styles.current]: currentLayerName === layerName,
          })}
          onClick={(e: React.MouseEvent) => onLayerClick(e, layerName)}
          onMouseOver={() => highlightLayer(layerName)}
          onMouseOut={() => highlightLayer()}
          draggable
          onDragStart={(e: React.DragEvent) => onLayerDragStart(layerName, e)}
          onDragEnd={onlayerDragEnd}
          onTouchStart={(e: React.TouchEvent) => onLayerTouchStart(layerName, e)}
          onTouchMove={onLayerTouchMove}
          onTouchEnd={onLayerTouchEnd}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          <div
            className={styles['drag-sensor-area']}
            data-index={i + 1}
            onDragEnter={() => onSensorAreaDragEnter(i + 1)}
          />
          <div
            className={styles.row}
            data-layer={layerName}
            onDragEnter={() => onLayerCenterDragEnter(layerName)}
          >
            <div className={styles.color}>
              <div
                id={`layerbackgroundColor-${i}`}
                style={{ backgroundColor: drawing.getLayerColor(layerName) }}
                onClick={(e: React.MouseEvent) => openLayerColorPanel(e, layerName)}
              />
            </div>
            <div
              id={`layerdoubleclick-${i}`}
              className={styles.name}
              onDoubleClick={(e: React.MouseEvent) => {
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey) onLayerDoubleClick();
              }}
            >
              {layerName}
            </div>
            <div
              id={`layervis-${i}`}
              className={styles.vis}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setLayerVisibility(layerName);
              }}
            >
              <img
                className={styles.icon}
                src={
                  isVis ? 'img/right-panel/icon-eyeopen.svg' : 'img/right-panel/icon-eyeclose.svg'
                }
                alt="vis-icon"
              />
            </div>
            {isMobile
            && (
              <div
                id={`layer-config-${i}`}
                className={styles.config}
                onClick={(e) => openLayerSettings(e, layerName)}
              >
                <SettingOutlined />
              </div>
            )}
            <div
              id={`layerlock-${i}`}
              className={styles.lock}
              onClick={(e: React.MouseEvent) => {
                if (isLocked) {
                  e.stopPropagation();
                  unLockLayers(layerName);
                }
              }}
            >
              <img src="img/right-panel/icon-layerlock.svg" alt="lock-icon" />
            </div>
          </div>
          <div
            className={styles['drag-sensor-area']}
            data-index={i}
            onDragEnter={() => onSensorAreaDragEnter(i)}
          />
        </div>
      );
      if (draggingDestIndex === i) {
        items.push(renderDragBar());
      }
    }
  }

  return (
    <div id="layerlist" className={styles.list} onDragOver={(e) => e.preventDefault()}>
      {items}
    </div>
  );
};

export default LayerList;
