import * as React from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DialogBox from 'app/widgets/Dialog-Box';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import ModalWithHole from 'app/widgets/Modal-With-Hole';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ITutorialDialog } from 'interfaces/ITutorial';
import { TutorialContext, TutorialContextProvider } from 'app/views/tutorials/TutorialContext';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.tutorial;
let _contextCaller;

interface IComponentProps {
  endTutorial: () => void,
}
class TutorialComponent extends React.Component<IComponentProps> {
  componentDidMount() {
    _contextCaller = this.context;
  }

  componentWillUnmount() {
    _contextCaller = null;
  }

  renderTutorialDialog() {
    const { currentStep, dialogStylesAndContents, hasNextButton, handleNextStep } = this.context;
    const { dialogBoxStyles, text, subElement } = dialogStylesAndContents[currentStep];
    return (
      <DialogBox
        {...dialogBoxStyles}
        onClose={() => this.props.endTutorial()}
        content={
          <div className="tutorial-dialog">
            {`${currentStep + 1}/${dialogStylesAndContents.length}\n`}
            {text}
            {subElement}
            {hasNextButton ?
              <div className="next-button" onClick={() => handleNextStep()}>
                {LANG.next}
              </div> : null}
          </div>
        }
      />
    );
  }

  renderHintCircle() {
    const { currentStep, dialogStylesAndContents } = this.context;
    const { hintCircle } = dialogStylesAndContents[currentStep];
    if (!hintCircle) {
      return null;
    }
    return (
      <div className="hint-circle" style={hintCircle} />
    );
  }

  render() {
    const { currentStep, dialogStylesAndContents, onClose } = this.context;
    if (currentStep >= dialogStylesAndContents.length) {
      onClose();
      return null;
    }
    const { holePosition, holeSize } = dialogStylesAndContents[currentStep];
    const tutorialDialog = this.renderTutorialDialog();
    const hintCircle = this.renderHintCircle();
    if (!holePosition) {
      return (
        <Modal className={{ 'no-background': true }}>
          <div className="tutorial-container">
            {tutorialDialog}
            {hintCircle}
          </div>
        </Modal>
      );
    }
    return (
      <ModalWithHole
        holePosition={holePosition}
        holeSize={holeSize}
      >
        <div className="tutorial-container">
          {tutorialDialog}
          {hintCircle}
        </div>
      </ModalWithHole>
    );
  }
};
TutorialComponent.contextType = TutorialContext;

interface Props {
  end_alert: string;
  dialogStylesAndContents: ITutorialDialog[];
  hasNextButton: boolean;
  onClose: () => void;
}
export class Tutorial extends React.Component<Props> {
  endTutorial = () => {
    const { onClose, end_alert } = this.props;
    Alert.popUp({
      id: 'end-tutorial',
      message: end_alert,
      buttonType: AlertConstants.YES_NO,
      onYes: () => {
        onClose();
      }
    });
  }

  render() {
    return (
      <TutorialContextProvider {...this.props}>
        <TutorialComponent endTutorial={this.endTutorial} />
      </TutorialContextProvider>
    )
  }
}

class ContextHelper {
  static get context() {
    return _contextCaller;
  }
}

export const TutorialContextCaller = ContextHelper;
