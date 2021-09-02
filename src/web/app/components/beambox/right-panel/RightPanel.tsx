import * as React from 'react';
import classNames from 'classnames';

import LayerPanel from 'app/components/beambox/right-panel/LayerPanel';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import Tab from 'app/components/beambox/right-panel/Tab';
import { LayerPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { RightPanelContext } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';

const isWeb = window.FLUX.version === 'web';
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
    this.setSelectedTab = this.setSelectedTab.bind(this);
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

  setSelectedTab(selectedTab: 'layers' | 'objects'): void {
    this.setState({ selectedTab });
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
        <div id="sidepanels" className={classNames({win: isWin && !isWeb, linux: isLinux && !isWeb, web: isWeb })}>
          <Tab
            mode={mode}
            selectedElement={selectedElement}
            selectedTab={selectedTab}
            setSelectedTab={this.setSelectedTab}
          />
          <ObjectPanelContextProvider>
            {content}
          </ObjectPanelContextProvider>
        </div>
      </div>
    );
  }
}

RightPanel.contextType = RightPanelContext;
