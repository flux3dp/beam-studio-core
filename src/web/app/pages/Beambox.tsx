import React from 'react';
import classNames from 'classnames';

import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import BeamboxInit from 'implementations/beamboxInit';
import CanvasTabBar from 'app/components/mobile/CanvasTabBar';
import communicator from 'implementations/communicator';
import i18n from 'helpers/i18n';
import ImageTracePanel from 'app/views/beambox/ImageTracePanel/ImageTracePanel';
import LeftPanel from 'app/components/beambox/left-panel/LeftPanel';
import openFileHelper from 'helpers/open-file-helper';
import PreviewOpacitySlider from 'app/components/beambox/PreviewOpacitySlider';
import RightPanel from 'app/components/beambox/right-panel/RightPanel';
import sentryHelper from 'helpers/sentry-helper';
import SvgEditor from 'app/components/beambox/SvgEditor';
import svgEditor from 'app/actions/beambox/svg-editor';
import TimeEstimationButton from 'app/components/beambox/TimeEstimationButton';
import TopBar from 'app/components/beambox/top-bar/TopBar';
import { CanvasProvider } from 'app/contexts/CanvasContext';
import { LayerPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { RightPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';
import { SelectedElementContextProvider } from 'app/contexts/SelectedElementContext';
import { TimeEstimationButtonContextProvider } from 'app/contexts/TimeEstimationButtonContext';

import styles from './Beambox.module.scss';

sentryHelper.initSentry();
const beamboxInit = new BeamboxInit();

const Beambox = (): JSX.Element => {
  React.useEffect(() => {
    BeamboxGlobalInteraction.attach();

    communicator.send('FRONTEND_READY');
    // Init view
    svgEditor.resetView();
    beamboxInit.showStartUpDialogs();
    openFileHelper.loadOpenFile();

    return () => {
      BeamboxGlobalInteraction.detach();
    };
  });

  const activeLang = i18n.getActiveLang();
  return (
    <CanvasProvider>
      <SelectedElementContextProvider>
        <LayerPanelContextProvider>
          <div className={classNames('studio-container', 'beambox-studio', activeLang)}>
            <TopBar />
            <LeftPanel />
            <RightPanelContextProvider>
              <RightPanel />
            </RightPanelContextProvider>
            <SvgEditor />
            <div className={classNames(styles.buttons, { [styles.mac]: window.os === 'MacOS' })}>
              <TimeEstimationButtonContextProvider>
                <TimeEstimationButton />
              </TimeEstimationButtonContextProvider>
              <PreviewOpacitySlider />
            </div>
            <div id="tool-panels-placeholder" />
            <ImageTracePanel />
            <CanvasTabBar />
          </div>
        </LayerPanelContextProvider>
      </SelectedElementContextProvider>
    </CanvasProvider>
  );
};

export default Beambox;
