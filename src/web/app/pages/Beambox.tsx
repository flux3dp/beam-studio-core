import * as React from 'react';
import classNames from 'classnames';

import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import BeamboxInit from 'implementations/beamboxInit';
import communicator from 'implementations/communicator';
import constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import LeftPanel from 'app/components/beambox/left-panel/LeftPanel';
import ImageTracePanel from 'app/views/beambox/ImageTracePanel/ImageTracePanel';
import openFileHelper from 'helpers/open-file-helper';
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
import { CanvasProvider } from 'app/contexts/CanvasContext';
import CanvasTabBar from 'app/components/mobile/CanvasTabBar';
import CanvasActionBar from 'app/components/mobile/CanvasActionBar';

sentryHelper.initSentry();
const beamboxInit = new BeamboxInit();

const Beambox = () => {
  React.useEffect(() => {
    BeamboxGlobalInteraction.attach();

    communicator.send('FRONTEND_READY');
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
      <div className={classNames('studio-container', 'beambox-studio', activeLang)}>
        <TopBar />
        <LeftPanel />
        <RightPanelContextProvider>
          <RightPanel />
        </RightPanelContextProvider>
        <SvgEditor />
        <TimeEstimationButtonContextProvider>
          <TimeEstimationButton />
        </TimeEstimationButtonContextProvider>
        <PathPreview />
        <ZoomBlock
          setZoom={(zoom) => svgEditor.zoomChanged(window, { zoomLevel: zoom / constant.dpmm })}
          resetView={svgEditor.resetView}
        />
        <div id="tool-panels-placeholder" />
        <ImageTracePanel />
        <CanvasActionBar />
        <CanvasTabBar />
      </div>
    </CanvasProvider>
  );
};

export default Beambox;
