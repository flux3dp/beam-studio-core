import * as i18n from 'helpers/i18n';
import * as React from 'react';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import { TutorialCallbacks } from 'app/constants/tutorial-constants';
import DialogBox from 'app/widgets/Dialog-Box';
import Modal from 'app/widgets/Modal';
import ModalWithHole from 'app/widgets/Modal-With-Hole';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import { ITutorialDialog } from 'interfaces/ITutorial';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const { createContext } = React;
const TutorialContext = createContext({});
const LANG = i18n.lang.tutorial;
let _contextCaller;

interface Props {
  hasNextButton: boolean,
  dialogStylesAndContents: ITutorialDialog[],
  onClose: () => void,
}

interface States {
  currentStep: number,
}
class TutorialContextProvider extends React.Component<Props, States> {
  private defaultRect: Element;

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    }
  }

  componentWillUnmount() {
    this.clearDefaultRect();
  }

  handleCallback = (callbackId: string) => {
    if (callbackId === TutorialCallbacks.SELECT_DEFAULT_RECT) {
      this.selectDefaultRect();
    } else {
      console.log('Unknown callback id', callbackId);
    }
  }

  selectDefaultRect = () => {
    if (this.defaultRect) {
      this.clearDefaultRect();
    }
    const defaultRect = svgCanvas.addSvgElementFromJson({
      element: 'rect',
      curStyles: false,
      attr: {
        x: -1000,
        y: -1000,
        width: 100,
        height: 100,
        stroke: '#000',
        id: svgCanvas.getNextId(),
        'fill-opacity': 0,
        opacity: 1
      }
    });
    this.defaultRect = defaultRect;
    svgCanvas.selectOnly([defaultRect], true);
  }

  clearDefaultRect = () => {
    if (this.defaultRect) {
      this.defaultRect.remove();
      svgCanvas.clearSelection();
    }
  }

  handleNextStep = () => {
    const { currentStep } = this.state;
    const { dialogStylesAndContents, onClose } = this.props;
    if (dialogStylesAndContents[currentStep].callback) {
      console.log(dialogStylesAndContents[currentStep].callback);
      this.handleCallback(dialogStylesAndContents[currentStep].callback);
    }
    if (currentStep + 1 < dialogStylesAndContents.length) {
      this.setState({ currentStep: this.state.currentStep + 1 });
    } else {
      onClose();
    }
  }

  getNextStepRequirement = () => {
    const { currentStep } = this.state;
    const { dialogStylesAndContents } = this.props;
    const nextStepRequirement = dialogStylesAndContents[currentStep].nextStepRequirement;
    return nextStepRequirement;
  }

  render() {
    const {
      hasNextButton,
      dialogStylesAndContents,
    } = this.props;
    const {
      currentStep
    } = this.state;
    const {
      getNextStepRequirement,
      handleNextStep
    } = this;
    return (
      <TutorialContext.Provider value={{
        hasNextButton,
        dialogStylesAndContents,
        currentStep,
        getNextStepRequirement,
        handleNextStep,
      }}>
        {this.props.children}
      </TutorialContext.Provider>
    );
  }
}

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
