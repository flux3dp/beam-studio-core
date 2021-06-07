import eventEmitterFactory from 'helpers/eventEmitterFactory';

const eventEmitter = eventEmitterFactory.createEventEmitter();
export const handleNextStep = (): void => {
  eventEmitter.emit('TutorialContext.handleNextStep');
};

export const getNextStepRequirement = (): string => {
  const response = {
    nextStepRequirement: '',
  };
  eventEmitter.emit('TutorialContext.getNextStepRequirement', response);
  return response.nextStepRequirement;
};
