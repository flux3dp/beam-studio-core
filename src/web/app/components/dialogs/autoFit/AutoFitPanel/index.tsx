import React, { useCallback } from 'react';

import ActionPanelIcons from 'app/icons/action-panel/ActionPanelIcons';
import BackButton from 'app/widgets/FullWindowPanel/BackButton';
import FullWindowPanel from 'app/widgets/FullWindowPanel/FullWindowPanel';
import Header from 'app/widgets/FullWindowPanel/Header';
import Sider from 'app/widgets/FullWindowPanel/Sider';
import useI18n from 'helpers/useI18n';
import useNewShortcutsScope from 'helpers/hooks/useNewShortcutsScope';
import { AutoFitContour } from 'interfaces/IAutoFit';

import apply from '../apply';
import Canvas from './Canvas';
import Info from './Info';
import ShapeSelector from './ShapeSelector';
import styles from './index.module.scss';
import { showAlignModal } from '../AlignModal';

interface Props {
  onClose?: () => void;
  element: SVGElement;
  data: AutoFitContour[][];
  imageUrl: string;
}

// TODO: add unit test for AutoFitPanel & its components
const AutoFitPanel = ({ element, data, imageUrl, onClose }: Props): JSX.Element => {
  useNewShortcutsScope();
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const {
    buttons: tButtons,
    beambox: {
      right_panel: {
        object_panel: { actions_panel: tActionPanel },
      },
    },
  } = useI18n();
  const handleNext = useCallback(() => {
    showAlignModal(element, data[focusedIndex][0], (initD, d) => {
      apply(element, data[focusedIndex], initD, d);
      onClose?.();
    });
  }, [element, data, focusedIndex, onClose]);

  return (
    <FullWindowPanel
      onClose={onClose}
      mobileTitle={tActionPanel.auto_fit}
      renderContents={() => (
        <>
          <Sider className={styles.sider}>
            <BackButton onClose={onClose}>{tButtons.back_to_beam_studio}</BackButton>
            <Header
              icon={<ActionPanelIcons.AutoFit className={styles.icon} />}
              title={tActionPanel.auto_fit}
            />
            <Info element={element} />
          </Sider>
          <Canvas data={data} imageUrl={imageUrl} focusedIndex={focusedIndex} />
          <ShapeSelector
            data={data}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            onNext={handleNext}
          />
        </>
      )}
    />
  );
};

export default AutoFitPanel;
