import { getPromarkInfo, setPromarkInfo } from './promark-info';

const mockStorageGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockStorageGet(...args),
}));

const mockGetSelectedDevice = jest.fn();
jest.mock('app/views/beambox/TopBar/contexts/TopBarController', () => ({
  getSelectedDevice: () => mockGetSelectedDevice(),
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('./promark-data-store', () => ({
  get: (...args) => mockGet(...args),
  set: (...args) => mockSet(...args),
}));

describe('test promark-info', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('get with top controller device', () => {
    mockGetSelectedDevice.mockReturnValue({ model: 'fpm1', serial: '123' });
    mockGet.mockReturnValue({ isMopa: true, watt: 30 });
    expect(getPromarkInfo()).toEqual({ isMopa: true, watt: 30 });
    expect(mockGetSelectedDevice).toBeCalledTimes(1);
    expect(mockStorageGet).not.toBeCalled();
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toBeCalledWith('123', 'info');
  });

  test('get with storage', () => {
    mockGetSelectedDevice.mockReturnValue({ model: 'fbm1', serial: '123' });
    mockStorageGet.mockReturnValue('456');
    mockGet.mockReturnValue({ isMopa: true, watt: 50 });
    expect(getPromarkInfo()).toEqual({ isMopa: true, watt: 50 });
    expect(mockGetSelectedDevice).toBeCalledTimes(1);
    expect(mockStorageGet).toBeCalledTimes(1);
    expect(mockStorageGet).toBeCalledWith('last-promark-serial');
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toBeCalledWith('456', 'info');
  });

  test('get with no serial', () => {
    mockGetSelectedDevice.mockReturnValue({ model: 'fbm1', serial: '123' });
    mockStorageGet.mockReturnValue(null);
    mockGet.mockReturnValue({ isMopa: false, watt: 50 });
    expect(getPromarkInfo()).toEqual({ isMopa: false, watt: 50 });
    expect(mockGetSelectedDevice).toBeCalledTimes(1);
    expect(mockStorageGet).toBeCalledTimes(1);
    expect(mockStorageGet).toBeCalledWith('last-promark-serial');
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toBeCalledWith('no-serial', 'info');
  });

  test('set data', () => {
    mockGetSelectedDevice.mockReturnValue({ model: 'fpm1', serial: '123' });
    setPromarkInfo({ isMopa: false, watt: 30 });
    expect(mockGetSelectedDevice).toBeCalledTimes(1);
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toBeCalledWith('123', 'info', { isMopa: false, watt: 30 });
  });
});
