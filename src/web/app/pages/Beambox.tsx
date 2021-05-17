import * as React from 'react';
import classNames from 'classnames';

import i18n from 'helpers/i18n';
// import BeamboxActions from 'app/actions/beambox';
// import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
// import BeamboxInit from 'app/actions/beambox/beambox-init';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
// import sentryHelper from 'helpers/sentry-helper';
import SVGEditor from 'app/pages/svg-editor';
// import svgEditor from 'app/actions/beambox/svg-editor';
import { TimeEstimationButton } from 'app/views/beambox/Time-Estimation-Button/Time-Estimation-Button';
import { TopBar } from 'app/views/beambox/Top-Bar/Top-Bar';
import { TopBarContextProvider } from 'app/views/beambox/Top-Bar/contexts/Top-Bar-Context';
import { ZoomBlock } from 'app/views/beambox/Zoom-Block/Zoom-Block';
import { ZoomBlockContextProvider } from 'app/views/beambox/Zoom-Block/contexts/Zoom-Block-Context';

// const { electron } = window;

// sentryHelper.initSentry();
// BeamboxInit.init();

interface Props {
  className?: string;
}

class Beambox extends React.Component<Props> {
  async componentDidMount() {
    // BeamboxGlobalInteraction.attach();

    // need to run after svgedit packages loaded, so place it at componentDidMouont
    if (BeamboxPreference.read('show_guides')) {
      // BeamboxActions.drawGuideLines();
    }

    // const { ipc, events } = electron;
    // ipc.send(events.FRONTEND_READY);
    // svgEditor.resetView();
    // await BeamboxInit.showStartUpDialogs();
  }

  componentWillUnmount() {
    // BeamboxGlobalInteraction.detach();
  }

  render() {
    const activeLang = i18n.getActiveLang();
    const { className = '' } = this.props;
    return (
      <div className={classNames('studio-container', 'beambox-studio', activeLang, className)}>
        <TopBarContextProvider>
          <TopBar />
        </TopBarContextProvider>
        <ZoomBlockContextProvider>
          <ZoomBlock />
        </ZoomBlockContextProvider>
        <TimeEstimationButton />
        <SVGEditor />
        <div id="tool-panels-placeholder" />
        <div id="image-trace-panel-placeholder" />
      </div>
    );
  }
}

export default () => Beambox;
