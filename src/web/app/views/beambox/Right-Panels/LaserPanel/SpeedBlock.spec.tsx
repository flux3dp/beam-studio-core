import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SpeedBlock from './SpeedBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        speed: 'speed',
        speed_contrain_warning: 'speed_contrain_warning',
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, min, max, unit, defaultValue, decimal, displayMultiValue }: any
) => (
  <div>
    MockUnitInput
    <p>id: {id}</p>
    <p>min: {min}</p>
    <p>max: {max}</p>
    <p>unit: {unit}</p>
    <p>defaultValue: {defaultValue}</p>
    <p>decimal: {decimal}</p>
    <p>displayMultiValue: {displayMultiValue}</p>
  </div>
));

const mockDoLayersContainsVector = jest.fn();
jest.mock('helpers/layer/check-vector', () => (...args) => mockDoLayersContainsVector(...args));

const mockStorageGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockStorageGet(...args),
}));

const mockPrefRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockPrefRead(...args),
}));

const mockOnChange = jest.fn();
describe('test SpeedBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when unit is mm', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <SpeedBlock layerNames={['layer']} speed={{ value: 87 }} onChange={mockOnChange} />
    );
    expect(mockDoLayersContainsVector).toBeCalledTimes(1);
    expect(mockDoLayersContainsVector).toHaveBeenLastCalledWith(['layer']);
    expect(mockStorageGet).toBeCalledTimes(1);
    expect(mockStorageGet).toHaveBeenLastCalledWith('default-units');
    expect(mockPrefRead).toBeCalledTimes(1);
    expect(mockPrefRead).toHaveBeenLastCalledWith('workarea');
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when unit is inches', () => {
    mockStorageGet.mockReturnValueOnce('inches');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <SpeedBlock layerNames={['layer']} speed={{ value: 87 }} onChange={mockOnChange} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when has vector warning', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fhex1').mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(true);
    const { container } = render(
      <SpeedBlock layerNames={['layer']} speed={{ value: 87 }} onChange={mockOnChange} />
    );
    expect(container).toMatchSnapshot();
    expect(mockPrefRead).toBeCalledTimes(2);
    expect(mockPrefRead).toHaveBeenNthCalledWith(1, 'workarea');
    expect(mockPrefRead).toHaveBeenNthCalledWith(2, 'vector_speed_contraint');
  });

  test('onChange should work', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <SpeedBlock layerNames={['layer']} speed={{ value: 87 }} onChange={mockOnChange} />
    );
    expect(mockOnChange).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith(88);
  });
});
