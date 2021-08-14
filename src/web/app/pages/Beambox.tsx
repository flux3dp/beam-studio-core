import * as React from 'react';
import classNames from 'classnames';

import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import BeamboxInit from 'implementations/beamboxInit';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import communicator from 'implementations/communicator';
import i18n from 'helpers/i18n';
import PathPreview from 'app/components/beambox/path-preview/PathPreview';
import sentryHelper from 'helpers/sentry-helper';
import SvgEditor from 'app/components/beambox/SvgEditor';
import svgEditor from 'app/actions/beambox/svg-editor';
import TimeEstimationButton from 'app/views/beambox/TimeEstimationButton/TimeEstimationButton';
import { TimeEstimationButtonContextProvider } from 'app/views/beambox/TimeEstimationButton/TimeEstimationButtonContext';
import TopBar from 'app/components/beambox/top-bar/TopBar';
import { TopBarContextProvider } from 'app/views/beambox/TopBar/contexts/TopBarContext';

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

  async componentDidMount(): Promise<void> {
    BeamboxGlobalInteraction.attach();

    // need to run after svgedit packages loaded, so place it at componentDidMouont
    if (BeamboxPreference.read('show_guides')) {
      beamboxStore.emitDrawGuideLines();
    }

    communicator.send('FRONTEND_READY');
    svgEditor.resetView();
    await beamboxInit.showStartUpDialogs();
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

  render(): JSX.Element {
    const { isPathPreviewing } = this.state;
    const activeLang = i18n.getActiveLang();
    return (
      <div className={classNames('studio-container', 'beambox-studio', activeLang)}>
        <TopBarContextProvider>
          <TopBar isPathPreviewing={isPathPreviewing} togglePathPreview={this.togglePathPreview} />
        </TopBarContextProvider>
        {this.renderTimeEstButton()}
        <SvgEditor isPathPreviewing={isPathPreviewing} />
        {this.renderPathPreview()}
        <div id="tool-panels-placeholder" />
        <div id="image-trace-panel-placeholder" />
      </div>
    );
  }
}
