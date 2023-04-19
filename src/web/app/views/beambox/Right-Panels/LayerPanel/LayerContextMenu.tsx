import React, { useContext } from 'react';

import useI18n from 'helpers/useI18n';
import { ContextMenu, MenuItem } from 'helpers/react-contextmenu';
import {
  cloneLayers,
  deleteLayers,
  getAllLayerNames,
  getLayerPosition,
  mergeLayers,
  setLayersLock,
} from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';

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
  const { selectedLayers, setSelectedLayers } = useContext(LayerPanelContext);
  const [targetLayers, setTargetLayers] = React.useState<string[]>(selectedLayers);

  const onContextMenuShow = (e: CustomEvent) => {
    const trigger = e.detail.data?.target as Element;
    const layerItem = trigger?.closest('.layer-item');
    const layerName = layerItem?.getAttribute('data-layer');
    const names = (layerName && !selectedLayers.includes(layerName)) ? [layerName] : selectedLayers;
    setTargetLayers(names);
  };

  const handleRename = () => {
    selectOnlyLayer(targetLayers[0]);
    renameLayer();
  };

  const handleCloneLayers = () => {
    const newLayers = cloneLayers(targetLayers);
    setSelectedLayers(newLayers);
  };

  const handleDeleteLayers = () => {
    deleteLayers(targetLayers);
    if (targetLayers.every((name, i) => selectedLayers[i] === name)) setSelectedLayers([]);
    else setSelectedLayers([...selectedLayers]);
  };

  const handleLockLayers = () => {
    svgCanvas.clearSelection();
    setLayersLock(targetLayers, true);
    setSelectedLayers([...selectedLayers]);
  };

  const handleMergeDown = () => {
    const layer = targetLayers[0];
    const layerPosition = getLayerPosition(layer);
    if (layerPosition === 0) return;
    const baseLayerName = drawing.getLayerName(layerPosition - 1);
    mergeLayers([layer], baseLayerName);
    setSelectedLayers([baseLayerName]);
  };

  const handleMergeAll = () => {
    const allLayerNames = getAllLayerNames();
    const baseLayer = mergeLayers(allLayerNames);
    setSelectedLayers([baseLayer]);
  };

  const handleMergeSelected = () => {
    const currentLayerName = drawing.getCurrentLayerName();
    const baseLayer = mergeLayers(selectedLayers, currentLayerName);
    setSelectedLayers([baseLayer]);
  };

  const isMultiSelecting = targetLayers.length > 1;
  const isSelectingLast = (targetLayers.length === 1) && (drawing.getLayerName(0) === targetLayers[0]);

  return (
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
