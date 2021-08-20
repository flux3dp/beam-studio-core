import * as React from 'react';
import classNames from 'classnames';

import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import BeamboxInit from 'implementations/beamboxInit';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import communicator from 'implementations/communicator';
import constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import LeftPanel from 'app/components/beambox/left-panel/LeftPanel';
import PathPreview from 'app/components/beambox/path-preview/PathPreview';
import RightPanel from 'app/components/beambox/right-panel/RightPanel';
import sentryHelper from 'helpers/sentry-helper';
import SvgEditor from 'app/components/beambox/SvgEditor';
import svgEditor from 'app/actions/beambox/svg-editor';
import TimeEstimationButton from 'app/components/beambox/TimeEstimationButton';
import TopBar from 'app/components/beambox/top-bar/TopBar';
import ZoomBlock from 'app/components/beambox/ZoomBlock';
import { RightPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';
import { TimeEstimationButtonContextProvider } from 'app/contexts/TimeEstimationButtonContext';
import { TopBarLeftPanelContextProvider } from 'app/contexts/TopBarLeftPanelContext';

sentryHelper.initSentry();
const beamboxInit = new BeamboxInit();

interface State {
  isPathPreviewing: boolean,
}

export default class Beambox extends React.Component<Record<string, never>, State> {
  constructor(props) {
    super(props);

    this.state = {
      isPathPreviewing: false,
    };
  }

  componentDidMount(): void {
    BeamboxGlobalInteraction.attach();

    // need to run after svgedit packages loaded, so place it at componentDidMouont
    if (BeamboxPreference.read('show_guides')) {
      beamboxStore.emitDrawGuideLines();
    }

    communicator.send('FRONTEND_READY');
    svgEditor.resetView();
    beamboxInit.showStartUpDialogs();
  }

  componentWillUnmount() {
    BeamboxGlobalInteraction.detach();
  }

  private togglePathPreview = () => {
    const { isPathPreviewing } = this.state;
    this.setState({ isPathPreviewing: !isPathPreviewing });
  };

  private renderTimeEstButton(): JSX.Element {
    const { isPathPreviewing } = this.state;
    if (isPathPreviewing) return null;
    return (
      <TimeEstimationButtonContextProvider>
        <TimeEstimationButton />
      </TimeEstimationButtonContextProvider>
    );
  }

  renderPathPreview = (): JSX.Element => {
    const { isPathPreviewing } = this.state;
    if (!isPathPreviewing) return null;
    return <PathPreview togglePathPreview={this.togglePathPreview} />;
  };

  renderZoomBlock = (): JSX.Element => {
    const { isPathPreviewing } = this.state;
    if (isPathPreviewing) return null;
    return (
      <ZoomBlock
        setZoom={(zoom) => svgEditor.zoomChanged(window, { zoomLevel: zoom / constant.dpmm })}
        resetView={svgEditor.resetView}
      />
    );
  };

  render(): JSX.Element {
    const { isPathPreviewing } = this.state;
    const activeLang = i18n.getActiveLang();
    return (
      <div className={classNames('studio-container', 'beambox-studio', activeLang)}>
        <TopBarLeftPanelContextProvider>
          <TopBar
            isPathPreviewing={isPathPreviewing}
            togglePathPreview={this.togglePathPreview}
          />
          <LeftPanel
            isPathPreviewing={isPathPreviewing}
            togglePathPreview={this.togglePathPreview}
          />
        </TopBarLeftPanelContextProvider>
        <RightPanelContextProvider>
          <RightPanel />
        </RightPanelContextProvider>
        <SvgEditor isPathPreviewing={isPathPreviewing} />
        {this.renderTimeEstButton()}
        {this.renderPathPreview()}
        {this.renderZoomBlock()}
        <div id="tool-panels-placeholder" />
        <div id="image-trace-panel-placeholder" />
      </div>
    );
  }
}
