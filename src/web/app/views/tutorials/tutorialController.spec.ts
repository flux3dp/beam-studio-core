/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

import { getNextStepRequirement, handleNextStep } from './tutorialController';

describe('test Tutorial-Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test handleNextStep', () => {
    handleNextStep();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'TutorialContext.handleNextStep');
  });

  test('test getNextStepRequirement', () => {
    getNextStepRequirement();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'TutorialContext.getNextStepRequirement', {
      nextStepRequirement: '',
    });
  });
});
