const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: mockGet,
  set: mockSet,
}));

jest.mock('app/actions/beambox/constant', () => ({
  diode: {
    defaultOffsetX: 10, // mm
    defaultOffsetY: 10, // mm
  },
}));

test('test beambox-preference', () => {
  mockGet.mockReturnValue({
    abc: '123',
  });

  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const beamboxPreference = require('./beambox-preference');
  expect(mockGet).toHaveBeenNthCalledWith(1, 'beambox-preference');
  expect(mockSet).toHaveBeenNthCalledWith(1, 'beambox-preference', {
    should_remind_calibrate_camera: true,
    mouse_input_device: (window.os === 'MacOS') ? 'TOUCHPAD' : 'MOUSE',
    model: 'fbb1b',
    show_guides: false,
    guide_x0: 0,
    guide_y0: 0,
    engrave_dpi: 'medium',
    diode_offset_x: 10,
    diode_offset_y: 10,
    abc: '123',
  });

  mockGet.mockReturnValue({
    mouse_input_device: 'TOUCHPAD',
  });
  expect(beamboxPreference.default.read('mouse_input_device')).toBe('TOUCHPAD');
  expect(mockGet).toHaveBeenNthCalledWith(2, 'beambox-preference');

  mockGet.mockReturnValue({});
  beamboxPreference.default.write('mouse_input_device', 'MOUSE');
  expect(mockGet).toHaveBeenNthCalledWith(3, 'beambox-preference');
  expect(mockSet).toHaveBeenNthCalledWith(2, 'beambox-preference', {
    mouse_input_device: 'MOUSE',
  });
});
