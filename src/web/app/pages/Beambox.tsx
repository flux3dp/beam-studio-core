import * as React from 'react';
import classNames from 'classnames';

import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import BeamboxInit from 'app/actions/beambox/beambox-init';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import communicator from 'implementations/communicator';
import i18n from 'helpers/i18n';
import sentryHelper from 'helpers/sentry-helper';
import SVGEditor from 'app/pages/svg-editor';
import svgEditor from 'app/actions/beambox/svg-editor';
import TimeEstimationButton from 'app/views/beambox/TimeEstimationButton/TimeEstimationButton';
import { TimeEstimationButtonContextProvider } from 'app/views/beambox/TimeEstimationButton/TimeEstimationButtonContext';
import { TopBar } from 'app/views/beambox/TopBar/TopBar';
import { TopBarContextProvider } from 'app/views/beambox/TopBar/contexts/TopBarContext';
import { ZoomBlock } from 'app/views/beambox/ZoomBlock/ZoomBlock';
import { ZoomBlockContextProvider } from 'app/views/beambox/ZoomBlock/contexts/ZoomBlockContext';

sentryHelper.initSentry();
BeamboxInit.init();

export default class Beambox extends React.Component {
  async componentDidMount() {
    BeamboxGlobalInteraction.attach();

    // need to run after svgedit packages loaded, so place it at componentDidMouont
    if (BeamboxPreference.read('show_guides')) {
      beamboxStore.emitDrawGuideLines();
    }

    communicator.send('FRONTEND_READY');
    svgEditor.resetView();
    await BeamboxInit.showStartUpDialogs();
  }

  componentWillUnmount() {
    BeamboxGlobalInteraction.detach();
  }

  render() {
    const activeLang = i18n.getActiveLang();
    return (
      <div className={classNames('studio-container', 'beambox-studio', activeLang)}>
        <TopBarContextProvider>
          <TopBar />
        </TopBarContextProvider>
        <ZoomBlockContextProvider>
          <ZoomBlock />
        </ZoomBlockContextProvider>
        <TimeEstimationButtonContextProvider>
          <TimeEstimationButton />
        </TimeEstimationButtonContextProvider>
        <SVGEditor />
        <div id="tool-panels-placeholder" />
        <div id="image-trace-panel-placeholder" />
      </div>
    );
  }
}
