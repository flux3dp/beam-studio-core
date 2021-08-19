import * as React from 'react';
import classNames from 'classnames';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import i18n from 'helpers/i18n';
import LayerPanel from 'app/views/beambox/Right-Panels/LayerPanel';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { LayerPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { RightPanelContext } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel;

const isWin = window.os === 'Windows';
const isLinux = window.os === 'Linux';

interface State {
  selectedTab: 'layers' | 'objects',
}

export default class RightPanel extends React.Component<{}, State> {
  private lastElement: Element;

  private lastMode: string;

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'layers',
    };
  }

  componentDidUpdate(): void {
    const { mode, selectedElement } = this.context;
    const { selectedTab } = this.state;
    if (mode === 'element') {
      if (!selectedElement && selectedTab !== 'layers') {
        this.setState({ selectedTab: 'layers' });
      } else if (selectedElement && !this.lastElement) {
        this.setState({ selectedTab: 'objects' });
      }
    } else if (this.lastMode !== mode) {
      this.setState({ selectedTab: 'objects' });
    }
    this.lastMode = mode;
    this.lastElement = selectedElement;
  }

  renderTabs(): JSX.Element {
    const {
      mode,
      selectedElement,
    } = this.context;
    const { selectedTab } = this.state;
    const isObjectDisabled = (mode === 'element' && (!selectedElement || selectedElement.length < 1));
    let objectTitle = LANG.tabs.objects;
    const LangTopBar = i18n.lang.topbar;
    if (mode === 'path-edit') {
      objectTitle = LANG.tabs.path_edit;
    } else if (mode === 'element' && selectedElement) {
      if (selectedElement.getAttribute('data-tempgroup') === 'true') {
        objectTitle = LangTopBar.tag_names.multi_select;
      } else if (selectedElement.getAttribute('data-textpath-g')) {
        objectTitle = LangTopBar.tag_names.text_path;
      } else if (selectedElement.tagName !== 'use') {
        objectTitle = LangTopBar.tag_names[selectedElement.tagName];
      } else if (selectedElement.getAttribute('data-svg') === 'true') {
        objectTitle = LangTopBar.tag_names.svg;
      } else if (selectedElement.getAttribute('data-dxf') === 'true') {
        objectTitle = LangTopBar.tag_names.dxf;
      } else {
        objectTitle = LangTopBar.tag_names.use;
      }
    }
    return (
      <div className="right-panel-tabs">
        <div
          className={classNames('tab', 'layers', { selected: selectedTab === 'layers' })}
          onClick={() => {
            this.setState({ selectedTab: 'layers' });
            if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_LAYER_PANEL) {
              svgCanvas.clearSelection();
              TutorialController.handleNextStep();
            }
          }}
        >
          <img className="tab-icon" src="img/right-panel/icon-layers.svg" draggable={false} />
          <div className="tab-title">
            {LANG.tabs.layers}
          </div>
        </div>
        <div
          className={classNames('tab', 'objects', { disabled: isObjectDisabled, selected: selectedTab === 'objects' })}
          onClick={isObjectDisabled ? null : () => this.setState({ selectedTab: 'objects' })}
        >
          <img className="tab-icon object" src="img/right-panel/icon-adjust.svg" draggable={false} />
          <div className="tab-title">
            {objectTitle}
          </div>
        </div>
      </div>
    );
  }

  renderLayerAndLaserPanel(): JSX.Element {
    const { selectedElement } = this.context;
    return (
      <LayerPanelContextProvider>
        <LayerPanel
          elem={selectedElement}
        />
      </LayerPanelContextProvider>
    );
  }

  renderObjectPanel(): JSX.Element {
    const { selectedElement } = this.context;
    return (
      <ObjectPanel
        elem={selectedElement}
      />
    );
  }

  render(): JSX.Element {
    const { mode, selectedElement } = this.context;
    const { selectedTab } = this.state;
    let content;
    if (selectedTab === 'layers') {
      content = this.renderLayerAndLaserPanel();
    } else if (mode === 'path-edit') {
      content = <PathEditPanel />;
    } else if (!selectedElement || selectedElement.length < 1) { // element mode
      content = this.renderLayerAndLaserPanel();
    } else {
      content = this.renderObjectPanel();
    }

    return (
      <div id="right-panel">
        <div id="sidepanels" className={classNames({ win: isWin, linux: isLinux })}>
          {this.renderTabs()}
          <ObjectPanelContextProvider>
            {content}
          </ObjectPanelContextProvider>
        </div>
      </div>
    );
  }
}

RightPanel.contextType = RightPanelContext;
