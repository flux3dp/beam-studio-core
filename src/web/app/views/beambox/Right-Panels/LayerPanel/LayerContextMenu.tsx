import React, { useContext } from 'react';

import LayerPanelIcons from 'app/icons/layer-panel/LayerPanelIcons';
import ObjectPanelIcons from 'app/icons/object-panel/ObjectPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import useI18n from 'helpers/useI18n';
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
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './LayerContextMenu.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  drawing: any;
  selectOnlyLayer: (name: string) => void;
  renameLayer: () => void;
}

const LayerContextMenu = ({ drawing, selectOnlyLayer, renameLayer }: Props): JSX.Element => {
  const LANG = useI18n().beambox.right_panel.layer_panel.layers;
  const { selectedLayers, setSelectedLayers, forceUpdate } = useContext(LayerPanelContext);
  const isMobile = useIsMobile();
  const isLocked =
    selectedLayers.length > 0
      ? getLayerElementByName(selectedLayers[0])?.getAttribute('data-lock') === 'true'
      : false;
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

  const handleMergeDown = () => {
    const layer = selectedLayers[0];
    const layerPosition = getLayerPosition(layer);
    if (layerPosition === 0) return;
    const baseLayerName = drawing.getLayerName(layerPosition - 1);
    mergeLayers([layer], baseLayerName);
    selectOnlyLayer(baseLayerName);
  };

  const handleMergeAll = () => {
    const allLayerNames = getAllLayerNames();
    const baseLayerName = mergeLayers(allLayerNames);
    selectOnlyLayer(baseLayerName);
  };

  const handleMergeSelected = () => {
    const currentLayerName = drawing.getCurrentLayerName();
    const baseLayer = mergeLayers(selectedLayers, currentLayerName);
    setSelectedLayers([baseLayer]);
  };

  const isMultiSelecting = selectedLayers.length > 1;
  const isSelectingLast = (selectedLayers.length === 1) && (drawing.getLayerName(0) === selectedLayers[0]);

  return isMobile ? (
    <div className={styles['item-group']}>
      <ObjectPanelItem.Divider />
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
        content={isLocked ? <ObjectPanelIcons.Unlock /> : <ObjectPanelIcons.Lock />}
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
      <MenuItem attributes={{ id: 'renameLayer' }} disabled={isMultiSelecting} onClick={handleRename}>
        {LANG.rename}
      </MenuItem>
      <MenuItem attributes={{ id: 'dupelayer' }} onClick={handleCloneLayers}>{LANG.dupe}</MenuItem>
      <MenuItem attributes={{ id: 'locklayer' }} onClick={handleLockLayers}>{LANG.lock}</MenuItem>
      <MenuItem attributes={{ id: 'deletelayer' }} onClick={handleDeleteLayers}>{LANG.del}</MenuItem>
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
    </ContextMenu>
  );
};

export default LayerContextMenu;
