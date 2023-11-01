import React, { useContext } from 'react';
import { Switch } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import colorConstants, { PrintingColors } from 'app/constants/color-constants';
import dialogCaller from 'app/actions/dialog-caller';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import LayerPanelIcons from 'app/icons/layer-panel/LayerPanelIcons';
import splitFullColorLayer from 'helpers/layer/full-color/splitFullColorLayer';
import toggleFullColorLayer from 'helpers/layer/full-color/toggleFullColorLayer';
import ObjectPanelIcons from 'app/icons/object-panel/ObjectPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import useI18n from 'helpers/useI18n';
import useWorkarea from 'helpers/hooks/useWorkarea';
import { ContextMenu, MenuItem } from 'helpers/react-contextmenu';
import {
  cloneLayers,
  deleteLayers,
  getAllLayerNames,
  getLayerElementByName,
  getLayerPosition,
  mergeLayers,
  setLayersLock,
} from 'helpers/layer/layer-helper';
import { DataType, getData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './LayerContextMenu.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  drawing: ISVGDrawing;
  selectOnlyLayer: (name: string) => void;
  renameLayer: () => void;
}

const LayerContextMenu = ({ drawing, selectOnlyLayer, renameLayer }: Props): JSX.Element => {
  const lang = useI18n().beambox.right_panel.layer_panel;
  const LANG = lang.layers;
  const LANG2 = lang.notification;
  const workarea = useWorkarea();
  const { selectedLayers, setSelectedLayers, forceUpdate } = useContext(LayerPanelContext);
  const isMobile = useIsMobile();
  const layerElem = getLayerElementByName(selectedLayers[0]);
  const isLocked = layerElem?.getAttribute('data-lock') === 'true';
  const onContextMenuShow = (e: CustomEvent) => {
    const trigger = e.detail.data?.target as Element;
    const layerItem = trigger?.closest('.layer-item');
    const layerName = layerItem?.getAttribute('data-layer');
    if (layerName && !selectedLayers.includes(layerName)) {
      selectOnlyLayer(layerName);
    }
  };

  const handleRename = () => {
    selectOnlyLayer(selectedLayers[0]);
    renameLayer();
  };

  const handleCloneLayers = () => {
    const newLayers = cloneLayers(selectedLayers);
    setSelectedLayers(newLayers);
  };

  const handleDeleteLayers = () => {
    deleteLayers(selectedLayers);
    setSelectedLayers([]);
  };

  const handleLockLayers = () => {
    svgCanvas.clearSelection();
    setLayersLock(selectedLayers, true);
    forceUpdate();
  };

  const toggleLayerLocked = () => {
    svgCanvas.clearSelection();
    setLayersLock(selectedLayers, !isLocked);
    forceUpdate();
  };

  const handleMergeDown = async () => {
    const layer = selectedLayers[0];
    const layerPosition = getLayerPosition(layer);
    if (layerPosition === 0) return;
    const baseLayerName = drawing.getLayerName(layerPosition - 1);
    const merged = await mergeLayers([layer], baseLayerName);
    if (merged) selectOnlyLayer(baseLayerName);
  };

  const handleMergeAll = async () => {
    const allLayerNames = getAllLayerNames();
    const baseLayerName = await mergeLayers(allLayerNames);
    if (!baseLayerName) return;
    const elem = getLayerElementByName(baseLayerName);
    toggleFullColorLayer(elem, { val: elem.getAttribute('data-fullcolor') === '1', force: true });
    selectOnlyLayer(baseLayerName);
  };

  const handleMergeSelected = async () => {
    const currentLayerName = drawing.getCurrentLayerName();
    const baseLayer = await mergeLayers(selectedLayers, currentLayerName);
    if (!baseLayer) return;
    const elem = getLayerElementByName(baseLayer);
    toggleFullColorLayer(elem, { val: elem.getAttribute('data-fullcolor') === '1', force: true });
    setSelectedLayers([baseLayer]);
  };

  const isSelectingPrinterLayer =
    selectedLayers.length === 1 &&
    layerElem &&
    modelsWithModules.includes(workarea) &&
    getData<LayerModule>(layerElem, DataType.module) === LayerModule.PRINTER;
  const isFullColor = layerElem?.getAttribute('data-fullcolor') === '1';

  const handleSplitColor = async () => {
    svgCanvas.clearSelection();
    if (!isSelectingPrinterLayer) return;
    const res = await new Promise<boolean>((resolve) => {
      alertCaller.popUp({
        id: 'split-color',
        caption: LANG2.splitColorTitle,
        message: LANG2.splitColorMsg,
        messageIcon: 'notice',
        buttonType: alertConstants.CONFIRM_CANCEL,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!res) return;
    const layer = selectedLayers[0];
    await splitFullColorLayer(layer);
    setSelectedLayers([]);
  };

  const handleLayerFullColor = () => {
    svgCanvas.clearSelection();
    if (!isSelectingPrinterLayer) return;
    if (
      isFullColor &&
      !colorConstants.printingLayerColor.includes(
        layerElem.getAttribute('data-color') as PrintingColors
      )
    ) {
      layerElem.setAttribute('data-color', colorConstants.printingLayerColor[0]);
    }
    toggleFullColorLayer(layerElem);
    setSelectedLayers([]);
  };

  const handleLayerFullColorToggle = () => {
    svgCanvas.clearSelection();
    if (!isSelectingPrinterLayer) return;
    if (isFullColor) {
      const layerPosition = getLayerPosition(selectedLayers[0]);
      const colorBlock = document.querySelector(`#layerbackgroundColor-${layerPosition}`);
      if (!colorBlock) return;
      const { left, top } = colorBlock.getBoundingClientRect();
      dialogCaller.showColorPicker({
        originalColor: 'fullcolor',
        left: left + 6,
        top: top + 6,
        isPrinting: true,
        onNewColor: (newColor: string) => {
          layerElem.removeAttribute('data-fullcolor');
          layerElem.setAttribute('data-color', newColor);
          svgCanvas.updateLayerColor(layerElem);
          setSelectedLayers([]);
        },
      });
    } else {
      handleLayerFullColor();
    }
  };

  const isMultiSelecting = selectedLayers.length > 1;
  const isSelectingLast =
    selectedLayers.length === 1 && drawing.getLayerName(0) === selectedLayers[0];

  return isMobile ? (
    <div className={styles['item-group']}>
      <ObjectPanelItem.Divider />
      {isSelectingPrinterLayer && (
        <ObjectPanelItem.Item
          id="split_color"
          content={<LayerPanelIcons.Expand />}
          label={LANG.splitFullColor}
          onClick={handleSplitColor}
          disabled={isMultiSelecting || !isFullColor}
        />
      )}
      {isSelectingPrinterLayer && (
        <ObjectPanelItem.Item
          id="toggle_fullcolor_layer"
          content={<Switch checked={isFullColor} />}
          // TODO: add translation
          label={LANG.fullColor}
          onClick={handleLayerFullColorToggle}
          disabled={isMultiSelecting}
        />
      )}
      <ObjectPanelItem.Item
        id="deletelayer"
        content={<ObjectPanelIcons.Trash />}
        label={LANG.del}
        onClick={handleDeleteLayers}
      />
      <ObjectPanelItem.Item
        id="merge_down_layer"
        content={<LayerPanelIcons.Merge />}
        label={LANG.merge_down}
        onClick={handleMergeDown}
        disabled={isMultiSelecting || isSelectingLast}
      />
      <ObjectPanelItem.Item
        id="locklayer"
        content={isLocked ? <LayerPanelIcons.Unlock /> : <LayerPanelIcons.Lock />}
        label={isLocked ? LANG.unlock : LANG.lock}
        onClick={toggleLayerLocked}
      />
      <ObjectPanelItem.Item
        id="dupelayer"
        content={<ObjectPanelIcons.Duplicate />}
        label={LANG.dupe}
        onClick={handleCloneLayers}
      />
      <ObjectPanelItem.Item
        id="renameLayer"
        content={<LayerPanelIcons.Rename />}
        label={LANG.rename}
        onClick={handleRename}
        disabled={isMultiSelecting}
      />
    </div>
  ) : (
    <ContextMenu id="layer-contextmenu" onShow={onContextMenuShow}>
      <MenuItem
        attributes={{ id: 'renameLayer' }}
        disabled={isMultiSelecting}
        onClick={handleRename}
      >
        {LANG.rename}
      </MenuItem>
      <MenuItem attributes={{ id: 'dupelayer' }} onClick={handleCloneLayers}>
        {LANG.dupe}
      </MenuItem>
      <MenuItem attributes={{ id: 'locklayer' }} onClick={handleLockLayers}>
        {LANG.lock}
      </MenuItem>
      <MenuItem attributes={{ id: 'deletelayer' }} onClick={handleDeleteLayers}>
        {LANG.del}
      </MenuItem>
      <MenuItem
        attributes={{ id: 'merge_down_layer' }}
        disabled={isMultiSelecting || isSelectingLast}
        onClick={handleMergeDown}
      >
        {LANG.merge_down}
      </MenuItem>
      <MenuItem
        attributes={{ id: 'merge_all_layer' }}
        disabled={isMultiSelecting}
        onClick={handleMergeAll}
      >
        {LANG.merge_all}
      </MenuItem>
      <MenuItem
        attributes={{ id: 'merge_selected_layer' }}
        disabled={!isMultiSelecting}
        onClick={handleMergeSelected}
      >
        {LANG.merge_selected}
      </MenuItem>
      {isSelectingPrinterLayer && (
        <>
          <MenuItem
            attributes={{ id: 'toggle_fullcolor_layer' }}
            disabled={isMultiSelecting}
            onClick={handleLayerFullColor}
          >
            {isFullColor ? LANG.switchToSingleColor : LANG.switchToFullColor}
          </MenuItem>
          <MenuItem
            attributes={{ id: 'split_color' }}
            disabled={isMultiSelecting}
            onClick={handleSplitColor}
          >
            {LANG.splitFullColor}
          </MenuItem>
        </>
      )}
    </ContextMenu>
  );
};

export default LayerContextMenu;
