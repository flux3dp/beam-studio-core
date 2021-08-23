import * as React from 'react';
import classNames from 'classnames';

import AddLayerButton from 'app/components/beambox/right-panel/AddLayerButton';
import Alert from 'app/actions/alert-caller';
import ColorPickerPanel from 'app/components/beambox/right-panel/ColorPickerPanel';
import Dialog from 'app/actions/dialog-caller';
import DragImage from 'app/components/beambox/right-panel/DragImage';
import i18n from 'helpers/i18n';
import LaserPanel from 'app/views/beambox/Right-Panels/Laser-Panel';
import SelLayerBlock from 'app/components/beambox/right-panel/SelLayerBlock';
import { cloneLayerConfig } from 'helpers/laser-config-helper';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'helpers/react-contextmenu';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import {
  getLayerElementByName,
  deleteLayers,
  cloneSelectedLayers,
  setLayersLock,
  mergeSelectedLayers,
  moveLayersToPosition,
} from 'helpers/layer-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.layer_panel;

interface Props {
  id?:string,
  elem: Element;
}

interface State {
  colorPanelLayer: string;
  colorPanelLeft: number;
  colorPanelTop: number;
  draggingDestIndex?: number;
  draggingLayer?: string;
  disableScroll? : boolean;
}

class LayerPanel extends React.Component<Props, State> {
  private currentTouchID: number;

  private firstTouchInfo: { pageX: number, pageY: number };

  private startDragTimer: NodeJS.Timeout;

  private draggingScrollTimer: NodeJS.Timeout;

  private draggingScrollDirection = 0;

  private layerListContainerRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      colorPanelLayer: null,
      colorPanelLeft: null,
      colorPanelTop: null,
      draggingDestIndex: null,
    };
    this.layerListContainerRef = React.createRef();
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

  unLockLayers = (layerName: string): void => {
    const { selectedLayers, setSelectedLayers } = this.context;
    if (selectedLayers.includes(layerName)) {
      setLayersLock(selectedLayers, false);
      this.forceUpdate();
    } else {
      setLayersLock([layerName], false);
      setSelectedLayers([layerName]);
    }
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

  selectOnlyLayer = (layerName: string): void => {
    const { setSelectedLayers } = this.context;
    svgCanvas.clearSelection();
    const drawing = svgCanvas.getCurrentDrawing();
    const res = drawing.setCurrentLayer(layerName);
    if (res) {
      setSelectedLayers([layerName]);
    }
  };

  toggleLayerSelected = (layerName: string): void => {
    const { selectedLayers, setSelectedLayers } = this.context;
    const drawing = svgCanvas.getCurrentDrawing();
    const index = selectedLayers.findIndex((name: string) => name === layerName);
    if (index >= 0) {
      if (selectedLayers.length > 1) {
        selectedLayers.splice(index, 1);
        drawing.setCurrentLayer(selectedLayers[0]);
      }
    } else {
      selectedLayers.push(layerName);
      drawing.setCurrentLayer(layerName);
    }
    setSelectedLayers(selectedLayers);
  };

  toggleContiguousSelectedUntil = (layerName: string): void => {
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayer: string = drawing.getCurrentLayerName();

    const allLayers: string[] = drawing.all_layers.map((layer) => layer.name_);
    let [startIndex, endIndex] = [-1, -1];
    for (let i = 0; i < allLayers.length; i += 1) {
      if (allLayers[i] === currentLayer) {
        startIndex = i;
      }
      if (allLayers[i] === layerName) {
        endIndex = i;
      }
      if (startIndex > -1 && endIndex > -1) break;
    }
    if (startIndex < 0 || endIndex < 0) return;

    const { selectedLayers, setSelectedLayers } = this.context;
    const isLayerSelected = selectedLayers.includes(layerName);

    for (let i = startIndex; i !== endIndex; endIndex > startIndex ? i += 1 : i -= 1) {
      const index = selectedLayers.findIndex((name) => name === allLayers[i]);
      if (isLayerSelected && index >= 0) {
        selectedLayers.splice(index, 1);
      } else if (!isLayerSelected && index < 0) {
        selectedLayers.push(allLayers[i]);
      }
    }
    if (!selectedLayers.includes(layerName)) {
      selectedLayers.push(layerName);
    }
    drawing.setCurrentLayer(layerName);
    setSelectedLayers(selectedLayers);
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

  setLayerVisibility = (layerName: string): void => {
    const drawing = svgCanvas.getCurrentDrawing();
    const isVis = drawing.getLayerVisibility(layerName);
    const { selectedLayers } = this.context;
    if (selectedLayers.includes(layerName)) {
      for (let i = 0; i < selectedLayers.length; i += 1) {
        svgCanvas.setLayerVisibility(selectedLayers[i], !isVis);
      }
    } else {
      svgCanvas.setLayerVisibility(layerName, !isVis);
    }
    this.forceUpdate();
  };

  openLayerColorPanel = (e: React.MouseEvent, layerName: string): void => {
    e.stopPropagation();
    this.setState({
      colorPanelLayer: layerName,
      colorPanelLeft: e.clientX,
      colorPanelTop: e.clientY,
    });
  };

  onLayerDragStart = (layerName: string, e?: React.DragEvent): void => {
    const dragImage = document.getElementById('drag-image') as Element;
    e?.dataTransfer?.setDragImage(dragImage, 0, 0);
    const { selectedLayers, setSelectedLayers } = this.context;
    if (!selectedLayers.includes(layerName)) {
      setSelectedLayers([layerName]);
    }
    this.setState({
      draggingLayer: layerName,
    });
  };

  onLayerCenterDragEnter = (layerName: string): void => {
    const { selectedLayers } = this.context;
    if (selectedLayers.includes(layerName)) {
      this.setState({ draggingDestIndex: null });
    }
  };

  onSensorAreaDragEnter = (index: number): void => {
    const { draggingDestIndex } = this.state;
    if (index !== draggingDestIndex) {
      this.setState({ draggingDestIndex: index });
    }
  };

  onlayerDragEnd = (): void => {
    const { draggingDestIndex } = this.state;
    const { selectedLayers } = this.context;
    if (draggingDestIndex !== null) {
      moveLayersToPosition(selectedLayers, draggingDestIndex);
      svgCanvas.sortTempGroupByLayer();
    }
    this.setState({
      draggingLayer: null,
      draggingDestIndex: null,
    });
  };

  preventDefault = (e: TouchEvent): void => {
    e.preventDefault();
  };

  draggingScroll = (): void => {
    const layerListContainer = this.layerListContainerRef.current;
    if (this.draggingScrollDirection !== 0 && layerListContainer) {
      if (this.draggingScrollDirection > 0) {
        layerListContainer.scrollTop += 10;
      } else {
        layerListContainer.scrollTop -= 10;
      }
    }
  };

  onLayerTouchStart = (layerName: string, e: React.TouchEvent): void => {
    if (!this.currentTouchID) {
      this.currentTouchID = e.changedTouches[0].identifier;
      this.firstTouchInfo = {
        pageX: e.changedTouches[0].pageX,
        pageY: e.changedTouches[0].pageY,
      };
      this.startDragTimer = setTimeout(() => {
        this.onLayerDragStart(layerName);
        this.startDragTimer = null;
        document.addEventListener('touchmove', this.preventDefault, { passive: false });
        this.draggingScrollTimer = setInterval(this.draggingScroll, 100);
      }, 800);
    }
  };

  onLayerTouchMove = (e: React.TouchEvent): void => {
    const touch = Array.from(e.changedTouches)
      .find((t) => t.identifier === this.currentTouchID);
    if (touch) {
      const { draggingLayer } = this.state;
      if (draggingLayer) {
        const layerListContainer = this.layerListContainerRef.current;
        const { top, height } = layerListContainer.getBoundingClientRect();
        if (touch.pageY < top) {
          this.draggingScrollDirection = -1;
        } else if (touch.pageY > top + height) {
          this.draggingScrollDirection = 1;
        } else {
          this.draggingScrollDirection = 0;
          const elem = document.elementFromPoint(touch.pageX, touch.pageY);
          if (elem.classList.contains('drag-sensor-area')) {
            const index = Number(elem.getAttribute('data-index'));
            this.onSensorAreaDragEnter(index);
          } else if (elem.classList.contains('layer-row')) {
            const name = elem.getAttribute('data-layer');
            this.onLayerCenterDragEnter(name);
          }
        }
      } else if (this.startDragTimer) {
        const { pageX, pageY } = this.firstTouchInfo;
        if (Math.hypot(touch.pageX - pageX, touch.pageY - pageY) > 10) {
          clearTimeout(this.startDragTimer);
          this.startDragTimer = null;
        }
      }
    }
  };

  onLayerTouchEnd = (e: React.TouchEvent): void => {
    const touch = Array.from(e.changedTouches)
      .find((t) => t.identifier === this.currentTouchID);
    if (touch) {
      if (this.startDragTimer) {
        clearTimeout(this.startDragTimer);
        this.startDragTimer = null;
      }
      if (this.draggingScrollTimer) {
        clearTimeout(this.draggingScrollTimer);
        this.draggingScrollTimer = null;
      }
      const { draggingLayer } = this.state;
      this.currentTouchID = null;
      if (draggingLayer) {
        document.removeEventListener('touchmove', this.preventDefault);
        this.onlayerDragEnd();
      }
    }
  };

  layerDoubleClick = (): void => {
    this.renameLayer();
  };

  handleLayerClick = (e: React.MouseEvent, layerName: string): void => {
    const isCtrlOrCmd = (window.os === 'MacOS' && e.metaKey) || (window.os !== 'MacOS' && e.ctrlKey);
    if (e.button === 0) {
      if (isCtrlOrCmd) {
        this.toggleLayerSelected(layerName);
      } else if (e.shiftKey) {
        this.toggleContiguousSelectedUntil(layerName);
      } else {
        this.selectOnlyLayer(layerName);
      }
    } else if (e.button === 2) {
      const { selectedLayers } = this.context;
      if (!selectedLayers.includes(layerName)) {
        this.selectOnlyLayer(layerName);
      }
    }
  };

  renderColorPickerPanel(): JSX.Element {
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

  renderDragBar = (): JSX.Element => <div key="drag-bar" className={classNames('drag-bar')} />;

  renderLayerList = (): JSX.Element => {
    const { selectedLayers } = this.context;
    const { draggingDestIndex } = this.state;
    const items = [];
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();

    const isAnyLayerMissing = drawing.all_layers.some((layer) => {
      if (!layer.group_.parentNode) {
        return true;
      }
      return false;
    });
    if (isAnyLayerMissing) {
      drawing.identifyLayers();
    }

    const allLayerNames: string[] = drawing.all_layers.map((layer) => layer.name_);

    if (draggingDestIndex === allLayerNames.length) {
      items.push(this.renderDragBar());
    }

    for (let i = allLayerNames.length - 1; i >= 0; i -= 1) {
      const layerName = allLayerNames[i];
      const layer = drawing.getLayerByName(layerName);
      if (layer) {
        const isLocked = layer.getAttribute('data-lock') === 'true';
        const isSelected = selectedLayers.includes(layerName);
        const isVis = drawing.getLayerVisibility(layerName);
        items.push(
          <div
            data-test-key={`layer-${i}`}
            key={layerName}
            className={classNames('layer', { layersel: isSelected, lock: isLocked, current: currentLayerName === layerName })}
            onClick={(e: React.MouseEvent) => this.handleLayerClick(e, layerName)}
            onMouseOver={() => this.highlightLayer(layerName)}
            onMouseOut={() => this.highlightLayer()}
            draggable
            onDragStart={(e: React.DragEvent) => this.onLayerDragStart(layerName, e)}
            onDragEnd={this.onlayerDragEnd}
            onTouchStart={(e: React.TouchEvent) => this.onLayerTouchStart(layerName, e)}
            onTouchMove={this.onLayerTouchMove}
            onTouchEnd={this.onLayerTouchEnd}
            onFocus={() => { }}
            onBlur={() => { }}
          >
            <div
              className="drag-sensor-area"
              data-index={i + 1}
              onDragEnter={() => this.onSensorAreaDragEnter(i + 1)}
            />
            <div
              className="layer-row"
              data-layer={layerName}
              onDragEnter={() => this.onLayerCenterDragEnter(layerName)}
            >
              <div className="layercolor">
                <div
                  id={`layerbackgroundColor-${i}`}
                  style={{ backgroundColor: drawing.getLayerColor(layerName) }}
                  onClick={(e: React.MouseEvent) => this.openLayerColorPanel(e, layerName)}
                />
              </div>
              <div
                id={`layerdoubleclick-${i}`}
                className="layername"
                onDoubleClick={(e: React.MouseEvent) => {
                  if (!e.ctrlKey && !e.shiftKey && !e.metaKey) this.layerDoubleClick();
                }}
              >
                {layerName}
              </div>
              <div
                id={`layervis-${i}`}
                className={classNames('layervis')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  this.setLayerVisibility(layerName);
                }}
              >
                <img className="vis-icon" src={isVis ? 'img/right-panel/icon-eyeopen.svg' : 'img/right-panel/icon-eyeclose.svg'} alt="vis-icon" />
              </div>
              <div
                id={`layerlock-${i}`}
                className="layerlock"
                onClick={(e: React.MouseEvent) => {
                  if (isLocked) {
                    e.stopPropagation();
                    this.unLockLayers(layerName);
                  }
                }}
              >
                <img src="img/right-panel/icon-layerlock.svg" alt="lock-icon" />
              </div>
            </div>
            <div
              className="drag-sensor-area"
              data-index={i}
              onDragEnter={() => this.onSensorAreaDragEnter(i)}
            />
          </div>,
        );
        if (draggingDestIndex === i) {
          items.push(this.renderDragBar());
        }
      }
    }

    return (
      <div id="layerlist">
        {items}
      </div>
    );
  };

  render(): JSX.Element {
    if (!svgCanvas) {
      setTimeout(() => {
        this.forceUpdate();
      }, 50);
      return null;
    }
    const { elem } = this.props;
    const { draggingLayer } = this.state;
    const { selectedLayers, setSelectedLayers } = this.context;
    const isTouchable = navigator.maxTouchPoints >= 1;
    const isMultiSelecting = selectedLayers.length > 1;
    const drawing = svgCanvas.getCurrentDrawing();
    const isSelectingLast = ((selectedLayers.length === 1)
      && (drawing.getLayerName(0) === selectedLayers[0]));

    return (
      <div id="layer-and-laser-panel">
        <div id="layerpanel" onMouseOut={() => this.highlightLayer()} onBlur={() => { }}>
          <ContextMenuTrigger
            id="layer-contextmenu"
            holdToDisplay={isTouchable ? 1000 : -1}
            hideOnLeaveHoldPosition
          >
            <div id="layerlist_container" ref={this.layerListContainerRef}>
              {this.renderColorPickerPanel()}
              {this.renderLayerList()}
            </div>
          </ContextMenuTrigger>
          <AddLayerButton setSelectedLayers={setSelectedLayers} />
          <SelLayerBlock elem={elem} />
          <DragImage selectedLayers={selectedLayers} draggingLayer={draggingLayer} />
          <ContextMenu id="layer-contextmenu">
            <MenuItem attributes={{ id:"renameLayer" }} disabled={isMultiSelecting} onClick={this.renameLayer}>
              {LANG.layers.rename}
            </MenuItem>
            <MenuItem attributes={{ id:"dupelayer" }} onClick={this.cloneSelectedLayers}>{LANG.layers.dupe}</MenuItem>
            <MenuItem attributes={{ id:"locklayer" }} onClick={this.lockSelectedLayers}>{LANG.layers.lock}</MenuItem>
            <MenuItem attributes={{ id:"deletelayer" }} onClick={this.deleteSelectLayers}>{LANG.layers.del}</MenuItem>
            <MenuItem attributes={{ id:"merge_down_layer"}} disabled={isMultiSelecting || isSelectingLast} onClick={this.mergeLayer}>
              {LANG.layers.merge_down}
            </MenuItem>
            <MenuItem attributes={{ id:"merge_all_layer" }} disabled={isMultiSelecting} onClick={this.mergeAllLayer}>
              {LANG.layers.merge_all}
            </MenuItem>
            <MenuItem attributes={{ id:"merge_selected_layer" }} disabled={!isMultiSelecting} onClick={this.mergeSelected}>
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
