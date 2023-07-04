import React from 'react';

import AddLayerButton from 'app/components/beambox/right-panel/AddLayerButton';
import Alert from 'app/actions/alert-caller';
import ConfigPanel from 'app/views/beambox/Right-Panels/ConfigPanel/ConfigPanel';
import Dialog from 'app/actions/dialog-caller';
import DragImage from 'app/components/beambox/right-panel/DragImage';
import i18n from 'helpers/i18n';
import LayerContextMenu from 'app/views/beambox/Right-Panels/LayerPanel/LayerContextMenu';
import LayerList from 'app/views/beambox/Right-Panels/LayerPanel/LayerList';
import SelLayerBlock from 'app/components/beambox/right-panel/SelLayerBlock';
import { ContextMenuTrigger } from 'helpers/react-contextmenu';
import { cloneLayerConfig } from 'helpers/layer/layer-config-helper';
import { getLayerElementByName, highlightLayer, moveLayersToPosition, setLayersLock } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
// import LayerItem from 'app/components/beambox/right-panel/LayerItem';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { isMobile } from 'helpers/system-helper';
import { Modal } from 'antd';
import { sprintf } from 'sprintf-js';
import { FloatingPanel } from 'antd-mobile';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG_PARAMS = i18n.lang.beambox.right_panel.laser_panel;
const LANG = i18n.lang.beambox.right_panel.layer_panel;

interface Props {
  elem: Element;
}

interface State {
  draggingDestIndex?: number;
  draggingLayer?: string;
  disableScroll?: boolean;
  contextTargetLayers?: [string];
  displayLaserPanelModal: boolean;
}

class LayerPanel extends React.Component<Props, State> {
  private currentTouchID?: number | null;

  private firstTouchInfo?: { pageX: number, pageY: number };

  private startDragTimer?: NodeJS.Timeout | null;

  private draggingScrollTimer?: NodeJS.Timeout | null;

  private draggingScrollDirection = 0;

  private layerListContainerRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      draggingDestIndex: null,
      displayLaserPanelModal: false,
    };
    this.layerListContainerRef = React.createRef();
    this.currentTouchID = null;
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
    const layer = getLayerElementByName(layerName);
    const layerColor = layer.getAttribute('data-color') || '#333333';
    Dialog.showColorPicker(layerColor, e.clientX, e.clientY,
      (newColor: string) => this.setLayerColor(layerName, newColor));
  };

  openLayerSettings = (e: React.MouseEvent, layerName: string): void => {
    e.stopPropagation();
    this.selectOnlyLayer(layerName);
    this.setState({ displayLaserPanelModal: true });
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
    console.log('onLayerDragStart', layerName);
  };

  onLayerCenterDragEnter = (layerName?: string): void => {
    const { selectedLayers } = this.context;
    if (selectedLayers.includes(layerName)) {
      this.setState({ draggingDestIndex: undefined });
    }
  };

  onSensorAreaDragEnter = (index: number): void => {
    const { draggingDestIndex } = this.state;
    if (index !== draggingDestIndex) {
      this.setState({ draggingDestIndex: index });
    }
  };

  onLayerDragEnd = (): void => {
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
    if (this.currentTouchID === null) {
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
          if (elem) {
            if (elem.classList.contains('drag-sensor-area')) {
              const index = Number(elem.getAttribute('data-index'));
              this.onSensorAreaDragEnter(index);
            } else if (elem.classList.contains('layer-row')) {
              const name = elem.getAttribute('data-layer');
              this.onLayerCenterDragEnter(name);
            }
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
        this.onLayerDragEnd();
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

  renderConfigPanel = () : JSX.Element => {
    const { selectedLayers } = this.context;
    const { displayLaserPanelModal } = this.state;
    if (isMobile()) {
      return (
        <Modal
          title={sprintf(LANG_PARAMS.preset_setting, selectedLayers.join(''))}
          open={displayLaserPanelModal}
          onCancel={() => this.setState({ displayLaserPanelModal: false })}
          onOk={() => this.setState({ displayLaserPanelModal: false })}
        >
          <ConfigPanel selectedLayers={selectedLayers} />
        </Modal>
      );
    }
    return <ConfigPanel selectedLayers={selectedLayers} />;
  };

  renderLayerPanel() : JSX.Element {
    const { elem } = this.props;
    const { draggingDestIndex, draggingLayer } = this.state;
    const { selectedLayers } = this.context;
    const drawing = svgCanvas.getCurrentDrawing();
    const isTouchable = navigator.maxTouchPoints >= 1;
    return (
      <div id="layerpanel" onMouseOut={() => highlightLayer()} onBlur={() => { }}>
        <ContextMenuTrigger
          id="layer-contextmenu"
          holdToDisplay={isTouchable ? 1000 : -1}
          hideOnLeaveHoldPosition
        >
          <div id="layerlist_container" ref={this.layerListContainerRef}>
            <LayerList
              draggingDestIndex={draggingDestIndex}
              onLayerClick={this.handleLayerClick}
              highlightLayer={highlightLayer}
              onLayerDragStart={this.onLayerDragStart}
              onlayerDragEnd={this.onLayerDragEnd}
              onLayerTouchStart={this.onLayerTouchStart}
              onLayerTouchMove={this.onLayerTouchMove}
              onLayerTouchEnd={this.onLayerTouchEnd}
              onSensorAreaDragEnter={this.onSensorAreaDragEnter}
              onLayerCenterDragEnter={this.onLayerCenterDragEnter}
              onLayerDoubleClick={this.layerDoubleClick}
              openLayerColorPanel={this.openLayerColorPanel}
              setLayerVisibility={this.setLayerVisibility}
              unLockLayers={this.unLockLayers}
              openLayerSettings={this.openLayerSettings}
            />
          </div>
        </ContextMenuTrigger>
        <SelLayerBlock elem={elem} />
        <DragImage selectedLayers={selectedLayers} draggingLayer={draggingLayer} />
        <LayerContextMenu
          drawing={drawing}
          selectOnlyLayer={this.selectOnlyLayer}
          renameLayer={this.renameLayer}
        />
      </div>
    );
  }

  render(): JSX.Element {
    if (!svgCanvas) {
      setTimeout(() => {
        this.forceUpdate();
      }, 50);
      return null;
    }
    const { setSelectedLayers } = this.context;

    return (
      <div id="layer-and-laser-panel">
        { isMobile()
          ? (
            <>
              <FloatingPanel
                handleDraggingOfContent={false}
                anchors={[200, window.innerHeight * 0.5, window.innerHeight - 40]}
              >
                {this.renderLayerPanel()}
              </FloatingPanel>
              <AddLayerButton setSelectedLayers={setSelectedLayers} />
            </>
          )
          : (
            <>
              <AddLayerButton setSelectedLayers={setSelectedLayers} />
              {this.renderLayerPanel()}
            </>
          )}
        {this.renderConfigPanel()}
      </div>
    );
  }
}

LayerPanel.contextType = LayerPanelContext;

export default LayerPanel;
