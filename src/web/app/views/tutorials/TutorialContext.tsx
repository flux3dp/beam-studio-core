import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ITutorialDialog } from 'interfaces/ITutorial';
import { TutorialCallbacks } from 'app/constants/tutorial-constants';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

export const TutorialContext = React.createContext({});

interface Props {
  hasNextButton: boolean,
  dialogStylesAndContents: ITutorialDialog[],
  onClose: () => void,
}

interface States {
  currentStep: number,
}

export class TutorialContextProvider extends React.Component<Props, States> {
  private defaultRect: Element;

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    };
    const eventEmitter = eventEmitterFactory.createEventEmitter();
    eventEmitter.on('TutorialContext.handleNextStep', this.handleNextStep.bind(this));
    eventEmitter.on('TutorialContext.getNextStepRequirement', this.getNextStepRequirement.bind(this));
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
  };

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
        opacity: 1,
      },
    });
    this.defaultRect = defaultRect;
    svgCanvas.selectOnly([defaultRect], true);
  };

  clearDefaultRect = () => {
    if (this.defaultRect) {
      this.defaultRect.remove();
      svgCanvas.clearSelection();
    }
  };

  handleNextStep = () => {
    const { currentStep } = this.state;
    const { dialogStylesAndContents, onClose } = this.props;
    if (dialogStylesAndContents[currentStep].callback) {
      console.log(dialogStylesAndContents[currentStep].callback);
      this.handleCallback(dialogStylesAndContents[currentStep].callback);
    }
    if (currentStep + 1 < dialogStylesAndContents.length) {
      this.setState({ currentStep: currentStep + 1 });
    } else {
      onClose();
    }
  };

  getNextStepRequirement = (response: {
    nextStepRequirement: string,
  }): void => {
    const { currentStep } = this.state;
    const { dialogStylesAndContents } = this.props;
    const { nextStepRequirement } = dialogStylesAndContents[currentStep];
    response.nextStepRequirement = nextStepRequirement;
  };

  render() {
    const {
      hasNextButton,
      dialogStylesAndContents,
      children,
    } = this.props;
    const {
      currentStep,
    } = this.state;
    const {
      handleNextStep,
    } = this;
    return (
      <TutorialContext.Provider value={{
        hasNextButton,
        dialogStylesAndContents,
        currentStep,
        handleNextStep,
      }}
      >
        {children}
      </TutorialContext.Provider>
    );
  }
}
