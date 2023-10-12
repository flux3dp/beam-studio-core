import useWorkarea from './useWorkarea';

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key: string) => mockRead(key),
}));

const mockOnUpdateWorkArea = jest.fn();
const mockRemoveUpdateWorkAreaListener = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  onUpdateWorkArea: (callback) => mockOnUpdateWorkArea(callback),
  removeUpdateWorkAreaListener: (callback) => mockRemoveUpdateWorkAreaListener(callback),
}));

const mockUseEffect = jest.fn();
const mockUseState = jest.fn();
jest.mock('react', () => ({
  useEffect: (...args) => mockUseEffect(...args),
  useState: (...args) => mockUseState(...args),
}));
const mockSetState = jest.fn();

describe('test useWorkarea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return workarea', () => {
    const workarea = 'fbm1';
    mockUseState.mockReturnValue([workarea, mockSetState]);
    mockRead.mockReturnValue(workarea);
    const result = useWorkarea();
    expect(result).toEqual(workarea);
  });

  it('should call onUpdateWorkArea when mount', () => {
    const workarea = 'fbm1';
    mockUseState.mockReturnValue([workarea, mockSetState]);
    mockRead.mockReturnValue(workarea);
    useWorkarea();
    expect(mockUseEffect).toBeCalledTimes(1);
    const effect = mockUseEffect.mock.calls[0][0];
    const cleanup = effect();
    expect(mockOnUpdateWorkArea).toBeCalledTimes(1);
    const handler = mockOnUpdateWorkArea.mock.calls[0][0];
    handler();
    expect(mockSetState).toBeCalledTimes(1);
    expect(mockSetState).toBeCalledWith(workarea);
    cleanup();
    expect(mockRemoveUpdateWorkAreaListener).toBeCalledTimes(1);
  });
});
