import * as React from 'react';

import AddLayerButton from 'app/components/beambox/right-panel/AddLayerButton';
import Alert from 'app/actions/alert-caller';
import ColorPickerPanel from 'app/components/beambox/right-panel/ColorPickerPanel';
import Dialog from 'app/actions/dialog-caller';
import DragImage from 'app/components/beambox/right-panel/DragImage';
import i18n from 'helpers/i18n';
import LaserPanel from 'app/views/beambox/Right-Panels/Laser-Panel';
import LayerList from 'app/components/beambox/right-panel/LayerList';
import SelLayerBlock from 'app/components/beambox/right-panel/SelLayerBlock';
import { cloneLayerConfig } from 'helpers/laser-config-helper';
import {
  cloneSelectedLayers,
  deleteLayers,
  getLayerElementByName,
  mergeSelectedLayers,
  setLayersLock,
} from 'helpers/layer-helper';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'helpers/react-contextmenu';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.layer_panel;

interface Props {
  elem: Element;
}

interface State {
  colorPanelLayer: string;
  colorPanelLeft: number;
  colorPanelTop: number;
  draggingDestIndex?: number;
  draggingLayer?: string;
}

class LayerPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      colorPanelLayer: null,
      colorPanelLeft: null,
      colorPanelTop: null,
    };
  }

  componentDidMount(): void {
    const { selectedLayers } = this.context;
    if (selectedLayers.length === 0) {
      this.initMultiSelectedLayer();
    }
  }

  componentDidUpdate(): void {
    const { selectedLayers } = this.context;
    if (selectedLayers.length === 0) {
      this.initMultiSelectedLayer();
    }
  }

  cloneSelectedLayers = (): void => {
    const { selectedLayers, setSelectedLayers } = this.context;
    const newSelectedLayers = cloneSelectedLayers(selectedLayers);
    setSelectedLayers(newSelectedLayers);
  };

  deleteSelectLayers = (): void => {
    const { selectedLayers, setSelectedLayers } = this.context;
    deleteLayers(selectedLayers);
    setSelectedLayers([]);
  };

  lockSelectedLayers = (): void => {
    const { selectedLayers } = this.context;
    svgCanvas.clearSelection();
    setLayersLock(selectedLayers, true);
    this.forceUpdate();
  };

  mergeLayer = (): void => {
    const drawing = svgCanvas.getCurrentDrawing();
    const layerCount = drawing.getNumLayers();
    const curIndex = drawing.getCurrentLayerPosition();
    if (curIndex === layerCount) {
      return;
    }
    svgCanvas.mergeLayer();
    const { setSelectedLayers } = this.context;
    setSelectedLayers([]);
  };

  mergeAllLayer = (): void => {
    svgCanvas.mergeAllLayers();
    const { setSelectedLayers } = this.context;
    setSelectedLayers([]);
  };

  mergeSelected = (): void => {
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    const { selectedLayers, setSelectedLayers } = this.context;
    const baseLayer = mergeSelectedLayers(selectedLayers, currentLayerName);
    setSelectedLayers([baseLayer]);
  };

  renameLayer = (): void => {
    const { setSelectedLayers } = this.context;
    const drawing = svgCanvas.getCurrentDrawing();
    const oldName = drawing.getCurrentLayerName();

    Dialog.promptDialog({
      caption: LANG.notification.newName,
      defaultValue: oldName,
      onYes: (newName: string) => {
        if (!newName || oldName === newName) {
          return;
        }
        if (svgCanvas.getCurrentDrawing().hasLayer(newName)) {
          Alert.popUp({
            id: 'dupli_layer_name',
            message: LANG.notification.enterUniqueLayerName,
          });
          return;
        }
        svgCanvas.renameCurrentLayer(newName);
        cloneLayerConfig(oldName, newName);
        setSelectedLayers([newName]);
      },
    });
  };

  initMultiSelectedLayer = (): void => {
    if (!svgCanvas) {
      return;
    }
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    if (currentLayerName) {
      const { setSelectedLayers } = this.context;
      setSelectedLayers([currentLayerName]);
    }
  };

  highlightLayer = (layerName?: string): void => {
    let i: number;
    const curNames = [];
    const numLayers = svgCanvas.getCurrentDrawing().getNumLayers();
    for (i = 0; i < numLayers; i += 1) {
      curNames[i] = svgCanvas.getCurrentDrawing().getLayerName(i);
    }

    if (layerName) {
      for (i = 0; i < numLayers; i += 1) {
        if (curNames[i] !== layerName) {
          svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 0.5);
        }
      }
    } else {
      for (i = 0; i < numLayers; i += 1) {
        svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 1.0);
      }
    }
  };

  setLayerColor = (layerName: string, newColor: string): void => {
    const { selectedLayers } = this.context;
    const { isUsingLayerColor } = svgCanvas;
    if (selectedLayers.includes(layerName)) {
      for (let i = 0; i < selectedLayers.length; i += 1) {
        const layer = getLayerElementByName(selectedLayers[i]);
        layer.setAttribute('data-color', newColor);
        if (isUsingLayerColor) {
          svgCanvas.updateLayerColor(layer);
        }
      }
    } else {
      const layer = getLayerElementByName(layerName);
      layer.setAttribute('data-color', newColor);
      if (isUsingLayerColor) {
        svgCanvas.updateLayerColor(layer);
      }
    }
    this.forceUpdate();
  };

  updateDraggingLayer = (layerName: string): void => {
    this.setState({
      draggingLayer: layerName,
    });
  };

  updateDraggingDestIndex = (layerIndex: number): void => {
    this.setState({
      draggingDestIndex: layerIndex,
    });
  };

  updateColorPanel = ({ colorPanelLayer, colorPanelLeft, colorPanelTop }: {
    colorPanelLayer: string;
    colorPanelLeft: number;
    colorPanelTop: number;
  }): void => {
    this.setState({
      colorPanelLayer,
      colorPanelLeft,
      colorPanelTop,
    });
  };

  renderColorPickerPanel() {
    const { colorPanelLayer, colorPanelTop, colorPanelLeft } = this.state;
    if (!colorPanelLayer) {
      return null;
    }
    return (
      <ColorPickerPanel
        layerName={colorPanelLayer}
        top={colorPanelTop}
        left={colorPanelLeft}
        onClose={() => this.setState({ colorPanelLayer: null })}
        onColorChanged={(newColor: string) => this.setLayerColor(colorPanelLayer, newColor)}
      />
    );
  }

  render() {
    if (!svgCanvas) {
      setTimeout(() => {
        this.forceUpdate();
      }, 50);
      return null;
    }
    const { elem } = this.props;
    const { draggingLayer, draggingDestIndex } = this.state;
    const { selectedLayers, setSelectedLayers } = this.context;
    const isMultiSelecting = selectedLayers.length > 1;
    const drawing = svgCanvas.getCurrentDrawing();
    const isSelectingLast = ((selectedLayers.length === 1)
      && (drawing.getLayerName(0) === selectedLayers[0]));
    return (
      <div id="layer-and-laser-panel">
        <div id="layerpanel" onMouseOut={() => this.highlightLayer()} onBlur={() => { }}>
          <ContextMenuTrigger id="layer-contextmenu" holdToDisplay={-1}>
            <div id="layerlist_container">
              {this.renderColorPickerPanel()}
              <LayerList
                selectedLayers={selectedLayers}
                draggingDestIndex={draggingDestIndex}
                setSelectedLayers={setSelectedLayers}
                highlightLayer={this.highlightLayer}
                updateDraggingLayer={this.updateDraggingLayer}
                updateDraggingDestIndex={this.updateDraggingDestIndex}
                updateColorPanel={this.updateColorPanel}
                renameLayer={this.renameLayer}
              />
            </div>
          </ContextMenuTrigger>
          <AddLayerButton setSelectedLayers={setSelectedLayers} />
          <SelLayerBlock elem={elem} />
          <DragImage selectedLayers={selectedLayers} draggingLayer={draggingLayer} />
          <ContextMenu id="layer-contextmenu">
            <MenuItem disabled={isMultiSelecting} onClick={this.renameLayer}>
              {LANG.layers.rename}
            </MenuItem>
            <MenuItem onClick={this.cloneSelectedLayers}>{LANG.layers.dupe}</MenuItem>
            <MenuItem onClick={this.lockSelectedLayers}>{LANG.layers.lock}</MenuItem>
            <MenuItem onClick={this.deleteSelectLayers}>{LANG.layers.del}</MenuItem>
            <MenuItem disabled={isMultiSelecting || isSelectingLast} onClick={this.mergeLayer}>
              {LANG.layers.merge_down}
            </MenuItem>
            <MenuItem disabled={isMultiSelecting} onClick={this.mergeAllLayer}>
              {LANG.layers.merge_all}
            </MenuItem>
            <MenuItem disabled={!isMultiSelecting} onClick={this.mergeSelected}>
              {LANG.layers.merge_selected}
            </MenuItem>
          </ContextMenu>
        </div>
        <LaserPanel
          selectedLayers={selectedLayers}
        />
      </div>
    );
  }
}

LayerPanel.contextType = LayerPanelContext;

export default LayerPanel;
